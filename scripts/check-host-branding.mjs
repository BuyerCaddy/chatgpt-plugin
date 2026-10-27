import {isAbsolute, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRpc} from '../plugins/buyercaddy/skills/research/scripts/connect.mjs';

const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const images = value => ({
  composer: [value?.composerIcon, value?.composerIconUrl].some(nonempty),
  logo: [value?.logo, value?.logoUrl].some(nonempty),
});

// This is a metadata acceptance gate, not a screenshot/rendering test.
// No install, login, data query, token read or configuration mutation occurs.
export async function checkHostBranding(rpc) {
  await rpc.call('initialize', {clientInfo: {name: 'buyercaddy_branding_check', version: '1.0.0'}, capabilities: {experimentalApi: true}});
  rpc.initialized();
  const inventory = await rpc.call('plugin/list', {marketplaceKinds: ['created-by-me-remote'], forceRefetch: true});
  if (inventory.marketplaceLoadErrors?.length) throw new Error('Plugin inventory could not be refreshed completely');
  const matches = (inventory.marketplaces ?? []).flatMap(m => m.plugins ?? []).filter(p => p.id === 'buyercaddy@created-by-me-remote');
  if (matches.length !== 1 || !matches[0].remotePluginId) throw new Error('Expected one identifiable personal BuyerCaddy plugin');
  const listed = matches[0];
  const detail = await rpc.call('plugin/read', {remoteMarketplaceName: 'created-by-me-remote', pluginName: listed.remotePluginId});
  const current = detail.plugin?.summary;
  if (!current || current.remotePluginId !== listed.remotePluginId || current.version !== listed.version) throw new Error('Plugin identity or release changed during inspection');
  const listedImages = images(listed.interface), detailImages = images(current.interface);
  const versionMatches = nonempty(current.version) && current.localVersion === current.version;
  const pass = current.installed === true && current.enabled === true && versionMatches && listedImages.composer && listedImages.logo && detailImages.composer && detailImages.logo;
  return {status: pass ? 'metadata_ready' : 'metadata_not_ready', version: current.version, installed: current.installed === true, enabled: current.enabled === true, installedVersionMatches: versionMatches, list: listedImages, detail: detailImages, renderedIconVerified: false};
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let rpc;
  try {
    const at = process.argv.indexOf('--codex-bin'), binary = at >= 0 ? process.argv[at + 1] : undefined;
    if (!binary || !isAbsolute(binary)) throw new Error('Pass --codex-bin with the verified absolute Codex executable path');
    rpc = createRpc(binary);
    const result = await checkHostBranding(rpc);
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'metadata_ready') process.exitCode = 2;
  } catch (error) {
    console.error(JSON.stringify({status: 'check_failed', message: error.message}));
    process.exitCode = 1;
  } finally { rpc?.close(); }
}
