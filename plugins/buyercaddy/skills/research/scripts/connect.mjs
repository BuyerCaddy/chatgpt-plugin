import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';
import {isAbsolute, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFile,stat} from 'node:fs/promises';

const ORIGIN = 'https://buyercaddy-oauth-gateway-972736928837.us-central1.run.app';
const SERVER = 'buyercaddy';

export function validateAuthorizationUrl(value) {
  const url = new URL(value);
  if (url.origin !== ORIGIN || url.pathname !== '/authorize' || url.username || url.password || url.hash)
    throw new Error('Unexpected authorization provider');
  const p = url.searchParams;
  const redirect = new URL(p.get('redirect_uri'));
  if (redirect.protocol !== 'http:' || !['127.0.0.1','localhost','[::1]'].includes(redirect.hostname) || redirect.username || redirect.password)
    throw new Error('Expected the local Codex callback');
  if (p.get('response_type') !== 'code' || p.get('code_challenge_method') !== 'S256' ||
      !p.get('code_challenge') || !p.get('state') || !p.get('client_id') ||
      p.get('resource') !== `${ORIGIN}/mcp/openai`)
    throw new Error('Incomplete host-bound OAuth request');
  return url.href;
}

export function createRpc(binary) {
  const child = spawn(binary, ['app-server'], {stdio:['pipe','pipe','pipe'], windowsHide:true});
  let nextId = 0;
  const pending = new Map();
  const notifications = [];
  const listeners = new Set();
  let dead = false;
  const fail = () => {
    dead = true;
    for (const {reject,timer} of pending.values()) { clearTimeout(timer); reject(new Error('Codex app-server stopped')); }
    pending.clear();
    for (const listener of listeners) listener({method:'connection/closed'});
  };
  child.on('error', fail);
  child.on('exit', fail);
  child.stderr.on('data', () => {}); // Never forward host logs or credentials.
  const reader = createInterface({input:child.stdout});
  reader.on('line', line => {
    let message;
    try { message=JSON.parse(line); } catch { return; }
    const request=pending.get(message.id);
    if (request) {
      clearTimeout(request.timer); pending.delete(message.id);
      if (message.error) request.reject(new Error(`Host request failed (${message.error.code})`));
      else request.resolve(message.result);
    } else if (message.method === 'mcpServer/oauthLogin/completed') {
      notifications.push(message);
      for (const listener of listeners) listener(message);
    }
  });
  return {
    call(method, params) {
      if(dead) return Promise.reject(new Error('Codex app-server unavailable'));
      const id=++nextId;
      return new Promise((resolve,reject) => {
        const timer=setTimeout(()=>{pending.delete(id);reject(new Error(`Host request timed out: ${method}`));},45000);
        pending.set(id,{resolve,reject,timer});
        child.stdin.write(JSON.stringify({id,method,params})+'\n');
      });
    },
    initialized() { child.stdin.write(JSON.stringify({method:'initialized',params:{}})+'\n'); },
    waitForLogin(loginId) {
      return new Promise((resolve,reject) => {
        const accept = message => {
          if (message.method==='connection/closed') {cleanup();reject(new Error('Codex app-server stopped'));}
          else if(message.params?.name===SERVER && message.params.loginId===loginId) {cleanup();resolve(message.params);}
        };
        const timer=setTimeout(()=>{cleanup();reject(new Error('Authorization timed out'));},610000);
        const cleanup=()=>{clearTimeout(timer);listeners.delete(accept);};
        listeners.add(accept);
        if(dead) accept({method:'connection/closed'});
        else for(const message of notifications) accept(message);
      });
    },
    close() { reader.close(); child.kill(); }
  };
}

async function validatePendingRequest(request) {
  if(!request || typeof request!=='object' || Array.isArray(request) ||
     Object.keys(request).some(key=>!['tool','arguments'].includes(key)) ||
     !request.arguments || typeof request.arguments!=='object' || Array.isArray(request.arguments))
    throw new Error('Expected a pending request with only tool and arguments');
  const snapshot=JSON.parse(await readFile(new URL('../references/tools.json',import.meta.url),'utf8'));
  const tool=snapshot.tools.find(tool=>tool.name===request.tool);
  if(!tool || tool.name==='CompanyProductsAsJson' || Object.hasOwn(request.arguments,'onBehalfOfUser'))
    throw new Error('Only ordinary BuyerCaddy research can be resumed; exports and delegated requests are excluded');
  const schema=tool.inputSchema;
  for(const key of Object.keys(request.arguments)) {
    if(!Object.hasOwn(schema.properties,key)) throw new Error('Pending request contains an unpublished argument');
  }
  if((schema.required??[]).some(key=>!Object.hasOwn(request.arguments,key)))
    throw new Error('Pending request is missing a required argument');
  for(const [key,value] of Object.entries(request.arguments)) {
    const rule=schema.properties[key];
    if(rule.type==='integer' ? !Number.isInteger(value) : rule.type==='array' ? !Array.isArray(value) : typeof value!==rule.type)
      throw new Error('Pending request argument has the wrong type');
    if(rule.minimum!==undefined && value<rule.minimum || rule.maximum!==undefined && value>rule.maximum ||
       rule.enum && !rule.enum.includes(value)) throw new Error('Pending request argument is outside the published range');
  }
  return JSON.parse(JSON.stringify(request));
}

export async function connect(rpc, emit, checkOnly=false, reconnect=false, options={}) {
  const request=options.request ? await validatePendingRequest(options.request) : null;
  if(request && checkOnly) throw new Error('Check mode cannot execute a pending request');
  const cwd=options.cwd??process.cwd();
  if(request && !isAbsolute(cwd)) throw new Error('Expected an absolute workspace path');
  await rpc.call('initialize',{clientInfo:{name:'buyercaddy_connect',title:'BuyerCaddy connection',version:'0.2.10'},capabilities:{experimentalApi:true,requestAttestation:false}});
  rpc.initialized();
  let threadId;
  const startRuntime=async()=>{
    const response=await rpc.call('thread/start',{cwd,ephemeral:true});
    threadId=response.thread?.id;
    if(!threadId) throw new Error('Host did not create the temporary MCP runtime');
  };
  if(request) await startRuntime();
  const readStatus=()=>rpc.call('mcpServerStatus/list',{serverName:SERVER,detail:'toolsAndAuthOnly',...(threadId?{threadId}:{})});
  // A usable MCP connection does not require access to an account plugin catalogue.
  let status=await readStatus();
  let server=status.data?.find(s=>s.name===SERVER);
  if(!server){
    // Refresh only when discovery needs it; do not install or change settings.
    await rpc.call('plugin/list',{marketplaceKinds:['created-by-me-remote','workspace-directory','shared-with-me'],forceRefetch:true});
    await rpc.call('plugin/installed',{});
    if(request) await startRuntime();
    status=await readStatus();
    server=status.data?.find(s=>s.name===SERVER);
  }
  if(!server) throw new Error('BuyerCaddy MCP is unavailable in this Codex profile');
  const resume=async()=>{
    if(!request) return;
    // Thread-scoped status waits for discovery; global status can be empty or stale.
    if(server.toolsError || !Object.values(server.tools??{}).some(tool=>tool.name===request.tool))
      throw new Error('The pending tool is unavailable in the refreshed BuyerCaddy connection');
    const result=await rpc.call('mcpServer/tool/call',{threadId,server:SERVER,tool:request.tool,arguments:request.arguments});
    if(result.isError===true || result.structuredContent?.success===false) {
      emit({event:'request_failed',success:false,tool:request.tool,result});
      throw new Error('The resumed request failed; do not start another login automatically');
    }
    for(const item of result.content??[]) {
      if(item.type!=='text') continue;
      let value;try{value=JSON.parse(item.text);}catch{continue;}
      if(value?.success===false) {
        emit({event:'request_failed',success:false,tool:request.tool,result});
        throw new Error('The resumed request failed; do not start another login automatically');
      }
    }
    emit({event:'request_completed',success:true,tool:request.tool,result});
  };
  if(checkOnly || (!reconnect && ['oAuth','bearerToken'].includes(server.authStatus))) {
    emit({event:'connection_status',authStatus:server.authStatus,needsLogin:server.authStatus==='notLoggedIn'});
    if(!checkOnly) await resume();
    return;
  }
  if(server.authStatus!=='notLoggedIn' && !(reconnect && server.authStatus==='oAuth')) throw new Error('The host did not report OAuth login support');
  const login=await rpc.call('mcpServer/oauth/login',{name:SERVER,...(threadId?{threadId}:{}),clientRegistration:'dcr',scopes:['mcp:tools','offline_access'],timeoutSecs:600});
  if(!login.loginId) throw new Error('Host cannot correlate OAuth completion; update Codex');
  const authorizationUrl=validateAuthorizationUrl(login.authorizationUrl);
  emit({event:'authorization_required',authorizationUrl,expiresInSeconds:600});
  const completion=await rpc.waitForLogin(login.loginId);
  emit({event:'authorization_completed',success:completion.success===true});
  if(completion.success===true && request) {
    await rpc.call('config/mcpServer/reload');
    await startRuntime();
    status=await readStatus();
    server=status.data?.find(s=>s.name===SERVER);
    if(!server || !['oAuth','bearerToken'].includes(server.authStatus))
      throw new Error('Sign-in was saved but the refreshed runtime is not authorized');
    await resume();
  }
}

if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  let rpc;
  try {
    const args=process.argv.slice(2);
    const at=args.indexOf('--codex-bin');
    const binary=at>=0 ? args[at+1] : undefined;
    if(!binary || !isAbsolute(binary)) throw new Error('Pass --codex-bin with the verified absolute path to this host\'s Codex executable');
    const requestAt=args.indexOf('--request-file');
    let request;
    if(requestAt>=0) {
      const path=args[requestAt+1];
      if(!path || !isAbsolute(path) || (await stat(path)).size>65536)
        throw new Error('Pending request must be a small JSON file at an absolute path');
      request=JSON.parse(await readFile(path,'utf8'));
    }
    rpc=createRpc(binary);
    await connect(rpc,event=>console.log(JSON.stringify(event)),args.includes('--check'),args.includes('--reconnect'),{request});
  } catch(error) {
    console.log(JSON.stringify({event:'connection_error',message:error.message}));
    process.exitCode=1;
  } finally { rpc?.close(); }
}
