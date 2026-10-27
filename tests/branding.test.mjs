import {test} from 'node:test';
import assert from 'node:assert/strict';
import {checkHostBranding} from '../scripts/check-host-branding.mjs';

function host(overrides = {}, detailOverrides = {}, errors = []) {
  const plugin = {id: 'buyercaddy@created-by-me-remote', remotePluginId: 'fixture', version: '0.2.7', localVersion: '0.2.7', installed: true, enabled: true, interface: {logoUrl: 'https://example.invalid/logo.png', composerIconUrl: 'https://example.invalid/composer.png'}, ...overrides};
  const methods = [];
  return {methods, initialized() {}, async call(method) {
    methods.push(method);
    if (method === 'initialize') return {};
    if (method === 'plugin/list') return {marketplaces: [{plugins: [plugin]}], marketplaceLoadErrors: errors};
    if (method === 'plugin/read') return {plugin: {summary: {...plugin, ...detailOverrides}}};
    throw new Error('Unexpected mutation or account/data request');
  }};
}

test('valid host image metadata passes without claiming visual rendering or changing account state', async () => {
  const rpc = host(), result = await checkHostBranding(rpc);
  assert.equal(result.status, 'metadata_ready');
  assert.equal(result.renderedIconVerified, false);
  assert.deepEqual(rpc.methods, ['initialize', 'plugin/list', 'plugin/read']);
});

test('installed package with discarded remote image fields fails acceptance', async () => {
  const result = await checkHostBranding(host({interface: {logo: null, logoUrl: null, composerIcon: null, composerIconUrl: null}}));
  assert.equal(result.status, 'metadata_not_ready');
  assert.equal(result.installedVersionMatches, true);
  assert.deepEqual(result.list, {composer: false, logo: false});
});

test('inconsistent list/detail, old installed version and failed inventory cannot pass', async () => {
  assert.equal((await checkHostBranding(host({}, {interface: {}}))).status, 'metadata_not_ready');
  assert.equal((await checkHostBranding(host({localVersion: '0.2.6'}))).status, 'metadata_not_ready');
  await assert.rejects(checkHostBranding(host({}, {version: '0.2.8'})), /changed/);
  await assert.rejects(checkHostBranding(host({}, {}, ['unavailable'])), /refreshed/);
});
