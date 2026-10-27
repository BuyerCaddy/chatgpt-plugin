import test from 'node:test';
import assert from 'node:assert/strict';
import {connect,validateAuthorizationUrl} from '../plugins/buyercaddy/skills/research/scripts/connect.mjs';

const origin='https://buyercaddy-oauth-gateway-972736928837.us-central1.run.app';
function authorizationUrl(){
  const url=new URL('/authorize',origin);
  for(const [key,value] of Object.entries({response_type:'code',client_id:'fixture',state:'fixture-state',code_challenge:'fixture-challenge',code_challenge_method:'S256',redirect_uri:'http://127.0.0.1:39183/callback',resource:`${origin}/mcp/openai`})) url.searchParams.set(key,value);
  return url.href;
}
function fixture(authStatus='notLoggedIn',success=true){
  const calls=[];const events=[];
  const rpc={
    async call(method,params){
      calls.push({method,params});
      if(method==='mcpServerStatus/list') return {data:authStatus===null?[]:[{name:'buyercaddy',authStatus}]};
      if(method==='mcpServer/oauth/login') return {authorizationUrl:authorizationUrl(),loginId:'fixture-id'};
      return {};
    },
    initialized(){},
    async waitForLogin(id){assert.equal(id,'fixture-id');return {success};}
  };
  return {rpc,calls,events,emit:e=>events.push(e)};
}

test('missing authorization starts the host-bound DCR flow and waits for completion',async()=>{
  const f=fixture();await connect(f.rpc,f.emit);
  assert.deepEqual(f.events.map(e=>e.event),['authorization_required','authorization_completed']);
  assert.equal(f.events[1].success,true);
  assert.equal(f.calls.find(c=>c.method==='mcpServer/oauth/login').params.name,'buyercaddy');
  assert(!f.calls.some(c=>/install$|tool\/call|config\/.*write/.test(c.method)));
});
test('existing authorization does not open another login',async()=>{
  for(const status of ['oAuth','bearerToken']){
    const f=fixture(status);await connect(f.rpc,f.emit);
    assert.equal(f.events[0].event,'connection_status');
    assert(!f.calls.some(c=>c.method==='mcpServer/oauth/login'));
  }
});

test('first login to an available local server does not depend on account catalogue access',async()=>{
  const f=fixture();const call=f.rpc.call;
  f.rpc.call=async(method,params)=>{if(method==='plugin/list')throw new Error('Account catalogue unavailable');return call(method,params);};
  await connect(f.rpc,f.emit);
  assert.equal(f.events.at(-1).success,true);
  assert(!f.calls.some(c=>c.method==='plugin/list'));
});

test('a missing remote server is rediscovered before starting login',async()=>{
  const f=fixture();const call=f.rpc.call;let statuses=0;
  f.rpc.call=async(method,params)=>{if(method==='mcpServerStatus/list'&&statuses++===0)return {data:[]};return call(method,params);};
  await connect(f.rpc,f.emit);
  assert(f.calls.some(c=>c.method==='plugin/list'));
  assert.equal(f.events.at(-1).success,true);
});
test('explicit expired OAuth reconnect starts a new flow',async()=>{
  const f=fixture('oAuth');await connect(f.rpc,f.emit,false,true);
  assert.equal(f.events[0].event,'authorization_required');
});
test('check mode reports missing authorization without opening it',async()=>{
  const f=fixture();await connect(f.rpc,f.emit,true);
  assert.deepEqual(f.events,[{event:'connection_status',authStatus:'notLoggedIn',needsLogin:true}]);
});
test('cancellation never claims successful connection',async()=>{
  const f=fixture('notLoggedIn',false);await connect(f.rpc,f.emit);
  assert.equal(f.events.at(-1).success,false);
});
test('unavailable server or unsupported auth stops before login',async()=>{
  for(const status of [null,'unknown','unsupported']){
    const f=fixture(status);await assert.rejects(connect(f.rpc,f.emit));
    assert(!f.calls.some(c=>c.method==='mcpServer/oauth/login'));
  }
});
test('only exact provider and host-bound PKCE authorization URLs are accepted',()=>{
  assert.equal(validateAuthorizationUrl(authorizationUrl()),authorizationUrl());
  for(const [key,value] of [['redirect_uri','https://evil.example/callback'],['resource',`${origin}/mcp`],['code_challenge_method','plain'],['state',''],['client_id','']]){
    const url=new URL(authorizationUrl());url.searchParams.set(key,value);
    assert.throws(()=>validateAuthorizationUrl(url.href));
  }
  const url=new URL(authorizationUrl());url.hostname='evil.example';assert.throws(()=>validateAuthorizationUrl(url.href));
});
test('callback wait failure does not produce a success event',async()=>{
  const f=fixture();f.rpc.waitForLogin=async()=>{throw new Error('Authorization timed out')};
  await assert.rejects(connect(f.rpc,f.emit),/timed out/);
  assert(!f.events.some(e=>e.success));
});

function resumeFixture(authStatus='notLoggedIn',success=true){
  const f=fixture(authStatus,success);const call=f.rpc.call;let authorized=authStatus==='oAuth',threads=0;
  f.rpc.call=async(method,params)=>{
    if(method==='thread/start'){f.calls.push({method,params});return {thread:{id:`ephemeral-${++threads}`}};}
    if(method==='mcpServerStatus/list'){
      f.calls.push({method,params});
      // A stale global connection is intentionally unusable; only a ready runtime works.
      return {data:params.threadId?[{name:'buyercaddy',authStatus:authorized?'oAuth':'notLoggedIn',tools:authorized?{Vendors:{name:'Vendors'}}:{}}]:[]};
    }
    if(method==='mcpServer/tool/call'){
      f.calls.push({method,params});
      assert(authorized);
      assert.equal(params.threadId,`ephemeral-${threads}`);
      return {content:[{type:'text',text:'{"content":[{"name":"Salesforce","domain":"salesforce.com"}]}'}]};
    }
    return call(method,params);
  };
  f.rpc.waitForLogin=async()=>{authorized=success;return {success};};
  return f;
}
const original={tool:'Vendors',arguments:{nameOrDomain:'salesforce.com',fuzzy:false,page:0,size:1}};

test('resume waits for login and runtime readiness, then executes identical arguments once',async()=>{
  const f=resumeFixture();await connect(f.rpc,f.emit,false,false,{request:original,cwd:process.cwd()});
  const calls=f.calls.filter(c=>c.method==='mcpServer/tool/call');
  assert.equal(calls.length,1);
  assert.deepEqual(calls[0].params.arguments,original.arguments);
  assert.equal(calls[0].params.tool,original.tool);
  assert.equal(calls[0].params.threadId,'ephemeral-2');
  assert.equal(f.events.at(-1).event,'request_completed');
  assert.equal(f.events.at(-1).success,true);
  assert(!f.calls.some(c=>c.method==='turn/start'||c.method==='plugin/install'));
});
test('saved login resumes a stale chat request without another consent',async()=>{
  const f=resumeFixture('oAuth');await connect(f.rpc,f.emit,false,false,{request:original,cwd:process.cwd()});
  assert.equal(f.events.at(-1).event,'request_completed');
  assert.equal(f.calls.filter(c=>c.method==='mcpServer/tool/call').length,1);
  assert(!f.calls.some(c=>c.method==='mcpServer/oauth/login'));
});
test('cancelled consent never executes the pending query',async()=>{
  const f=resumeFixture('notLoggedIn',false);await connect(f.rpc,f.emit,false,false,{request:original,cwd:process.cwd()});
  assert(!f.calls.some(c=>c.method==='mcpServer/tool/call'));
  assert(!f.events.some(e=>e.event==='request_completed'));
});
test('resume rejects exports, delegated identity, unknown tools, credentials and oversized pages before connecting',async()=>{
  for(const request of [
    {tool:'CompanyProductsAsJson',arguments:{companyDomain:'example.com',onBehalfOfUser:'a@example.com'}},
    {tool:'GetCreditsBalance',arguments:{}},
    {tool:'CompanyProducts',arguments:{companyDomain:'example.com',onBehalfOfUser:'a@example.com'}},
    {...original,arguments:{...original.arguments,apiKey:'fixture'}},
    {...original,arguments:{...original.arguments,size:201}},
    {...original,server:'other'}
  ]){
    const f=resumeFixture();await assert.rejects(connect(f.rpc,f.emit,false,false,{request,cwd:process.cwd()}));
    assert.equal(f.calls.length,0);
  }
});
test('a resumed tool failure is reported without another login or duplicate call',async()=>{
  const f=resumeFixture('oAuth');const call=f.rpc.call;
  f.rpc.call=async(method,params)=>method==='mcpServer/tool/call'?{isError:true,content:[{type:'text',text:'HTTP 500'}]}:call(method,params);
  await assert.rejects(connect(f.rpc,f.emit,false,false,{request:original,cwd:process.cwd()}),/resumed/i);
  assert(!f.events.some(e=>e.event==='request_completed'&&e.success));
  assert(!f.calls.some(c=>c.method==='mcpServer/oauth/login'));
});
test('saved authorization without the requested live tool does not execute a guessed method',async()=>{
  const f=resumeFixture('oAuth');const call=f.rpc.call;
  f.rpc.call=async(method,params)=>{
    const result=await call(method,params);
    if(method==='mcpServerStatus/list')result.data[0].tools={};
    return result;
  };
  await assert.rejects(connect(f.rpc,f.emit,false,false,{request:original}),/unavailable/);
  assert(!f.calls.some(c=>c.method==='mcpServer/tool/call'));
});
test('application-level failure remains a failure in both structured and text results',async()=>{
  for(const result of [{structuredContent:{success:false}},{content:[{type:'text',text:'{"success":false,"message":"upstream error"}'}]}]){
    const f=resumeFixture('oAuth');const call=f.rpc.call;
    f.rpc.call=async(method,params)=>method==='mcpServer/tool/call'?result:call(method,params);
    await assert.rejects(connect(f.rpc,f.emit,false,false,{request:original}),/resumed/i);
    assert.equal(f.events.at(-1).event,'request_failed');
    assert.equal(f.events.at(-1).success,false);
  }
});
