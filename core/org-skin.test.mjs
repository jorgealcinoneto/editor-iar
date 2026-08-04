import { strict as assert } from 'node:assert';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { buildOrgSkin, applyOrgTheme, getSkinBrandLines } = require('./org-skin.js');

const org = {
  id: '11111111-1111-1111-1111-111111111111',
  slug: 'demo',
  name: 'Igreja Anglicana Rio',
  handle: '@demo',
  logo_url: 'https://example.com/logo.png',
  catalog_id: 'church-v1',
  theme: { marinho: '#010101', accent: '#020202', accentSoft: '#030303', paper: '#040404', ink: '#050505', ambar: '#060606' },
};

const skin = buildOrgSkin(org);
assert.equal(skin.id, org.id);
assert.equal(skin.logoUrl, org.logo_url);
assert.equal(skin.catalogId, 'church-v1');
assert.deepEqual(getSkinBrandLines(skin), { line1: 'Igreja Anglicana', line2: 'Rio' });
assert.deepEqual(getSkinBrandLines(buildOrgSkin({ ...org, name: 'Solo' })), { line1: 'Solo', line2: '' });

const vars = {};
const fakeRoot = { style: { setProperty: (k, v) => { vars[k] = v; } } };
applyOrgTheme(skin.theme, fakeRoot);
assert.equal(vars['--marinho'], '#010101');
assert.equal(vars['--estola'], '#020202');
assert.equal(vars['--estola-claro'], '#030303');
assert.equal(vars['--papel'], '#040404');
assert.equal(vars['--grafite'], '#050505');
assert.equal(vars['--ambar'], '#060606');

console.log('org-skin tests OK');
