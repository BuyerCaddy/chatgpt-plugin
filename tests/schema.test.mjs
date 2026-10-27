import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname, relative } from 'node:path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const root = fileURLToPath(new URL('../', import.meta.url));
const plugin = resolve(root, 'plugins/buyercaddy');
const read = path => readFile(resolve(root, path), 'utf8');
const json = async path => JSON.parse(await read(path));
const snapshot = await json('plugins/buyercaddy/skills/research/references/tools.json');
const examples = await json('tests/examples.json');
const ajv = new Ajv({ strict: false, allErrors: true }); addFormats(ajv);

test('every bundled tool has one schema-valid fixture and routing coverage', async () => {
  assert.deepEqual(Object.keys(examples).sort(), snapshot.tools.map(t => t.name).sort());
  const skill = await read('plugins/buyercaddy/skills/research/SKILL.md');
  for (const tool of snapshot.tools) {
    assert(skill.includes(tool.name), `Missing route for ${tool.name}`);
    const validate = ajv.compile(tool.inputSchema);
    assert(validate(examples[tool.name]), `${tool.name}: ${ajv.errorsText(validate.errors)}`);
    assert(!validate({ ...examples[tool.name], unsupportedFilter: true }), `${tool.name} allows unknown parameters`);
    for (const field of tool.inputSchema.required ?? []) {
      const input = { ...examples[tool.name] }; delete input[field];
      assert(!validate(input), `${tool.name} must require ${field}`);
    }
  }
});

test('paging boundaries and no invented paging on other tools', () => {
  for (const tool of snapshot.tools) {
    const schema = tool.inputSchema, validate = ajv.compile(schema), base = examples[tool.name];
    if (schema.properties.size) {
      for (const size of [1, 20, 200]) assert(validate({ ...base, size }), `${tool.name} size ${size}`);
      for (const size of [0, 201, 1.5, '20']) assert(!validate({ ...base, size }), `${tool.name} rejects size ${size}`);
    }
    if (schema.properties.page) {
      for (const page of [0, 1]) assert(validate({ ...base, page }));
      for (const page of [-1, 0.5, '0']) assert(!validate({ ...base, page }));
    } else assert(!validate({ ...base, page: 1 }), `${tool.name} has no page contract`);
  }
});

test('country filter, required empty search and exact enums remain supported', () => {
  const get = name => ajv.compile(snapshot.tools.find(t => t.name === name).inputSchema);
  assert(get('ProductsSearch')({ search: '' }));
  assert(!get('ProductsSearch')({ categoryId: 'fixture' }));
  assert(get('CompaniesSearch')({ countryIn: ['Germany'] }));
  assert(!get('CompaniesSearch')({ employeeRangeIn: ['1000-4999'] }));
  assert(!get('CompanyProductsAsJson')({ companyDomain: 'microsoft.com', onBehalfOfUser: 'not-an-email' }));
});

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? files(resolve(dir, e.name)) : [resolve(dir, e.name)]))).flat();
}

test('installed package is self-contained with only the explicit sign-in helper', async () => {
  const paths = await files(plugin);
  assert(paths.some(p => p.endsWith('SKILL.md')));
  for (const path of paths) {
    if (/\.(?:ps1|sh|js|mjs|exe)$/i.test(path))
      assert.equal(relative(plugin, path).replaceAll('\\', '/'), 'skills/research/scripts/connect.mjs');
    if (path.endsWith('.png')) continue;
    const text = await readFile(path, 'utf8');
    assert(!/[A-Z]:[\\/](?:work|Users)[\\/]/.test(text), `Absolute workstation path in ${relative(root, path)}`);
    assert(!/-----BEGIN .*PRIVATE KEY-----/.test(text));
    if (!path.endsWith('.md')) continue;
    for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
      const link = match[1]; if (/^(?:https?:|#)/.test(link)) continue;
      const target = resolve(dirname(path), link.split('#')[0]);
      assert(!relative(plugin, target).startsWith('..'), `Link escapes installed plugin: ${link}`);
      assert((await stat(target)).isFile(), `Missing ${link}`);
    }
  }
});


test('every advertised direct or array enum value is accepted; invented values are rejected', () => {
  let checked = 0;
  for (const tool of snapshot.tools) {
    const validate = ajv.compile(tool.inputSchema);
    for (const [name, schema] of Object.entries(tool.inputSchema.properties)) {
      const values = schema.enum ?? schema.items?.enum;
      if (!values) continue;
      const input = value => ({ ...examples[tool.name], [name]: schema.type === 'array' ? [value] : value });
      for (const value of values) {
        assert(validate(input(value)), `${tool.name}.${name}: ${value}`);
        checked++;
      }
      assert(!validate(input('__INVALID_ENUM__')), `${tool.name}.${name} must reject invented values`);
    }
  }
  assert(checked > 0);
});
