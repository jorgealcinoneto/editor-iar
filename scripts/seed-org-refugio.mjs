#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ASSET_DIR = join(ROOT, 'supabase/seed-assets/refugio');
const MANIFEST = JSON.parse(readFileSync(join(ASSET_DIR, 'manifest.json'), 'utf8'));
const ORG_UUID_LOCAL = 'b0000000-0000-4000-8000-000000000003';
const THEME = {
  paper: '#F5F1E4',
  ink: '#4A5B45',
  marinho: '#4A5B45',
  accent: '#A7CF9A',
  accentSoft: '#C5E0BB',
  ambar: '#E0A85E',
  fontHeading: 'Cormorant Garamond',
  fontBody: 'DM Sans',
};

function localServiceRoleKey() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return process.env.SUPABASE_SERVICE_ROLE_KEY;
  try {
    const raw = execSync('npx supabase status', { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const json = JSON.parse(raw.trim().split('\n').pop());
    return json.SERVICE_ROLE_KEY || '';
  } catch {
    return '';
  }
}

function loadEnv() {
  const local = process.argv.includes('--local');
  if (local) {
    const confPath = join(ROOT, 'config.local.js');
    if (!existsSync(confPath)) throw new Error('config.local.js em falta');
    const src = readFileSync(confPath, 'utf8');
    const url = (src.match(/SUPABASE_URL\s*=\s*['"]([^'"]+)['"]/) || [])[1];
    const key = localServiceRoleKey();
    if (!url || !key) {
      throw new Error('Para --local: sobe o stack (`npx supabase start`) e garante config.local.js');
    }
    return { url, key, local: true };
  }
  const url = process.env.SUPABASE_URL || 'https://ftcefxhnadnxhqvuamqu.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('Defina SUPABASE_SERVICE_ROLE_KEY');
  return { url, key, local: false };
}

async function ensureOrg(sb, local) {
  const slug = MANIFEST.orgSlug;
  const { data: existing } = await sb.from('orgs').select('id').eq('slug', slug).maybeSingle();
  if (existing?.id) {
    await sb.from('orgs').update({
      name: 'Comunidade Anglicana Refúgio',
      handle: '@anglicana_refugio',
      theme: THEME,
    }).eq('id', existing.id);
    return existing.id;
  }
  const row = {
    ...(local ? { id: ORG_UUID_LOCAL } : {}),
    slug,
    name: 'Comunidade Anglicana Refúgio',
    handle: '@anglicana_refugio',
    theme: THEME,
  };
  const { data, error } = await sb.from('orgs').insert(row).select('id').single();
  if (error) throw error;
  return data.id;
}

async function ensureSuperadminMembership(sb, orgId) {
  const { data: admins } = await sb.from('org_members').select('user_id').eq('role', 'superadmin').limit(20);
  const ids = [...new Set((admins || []).map((a) => a.user_id))];
  for (const userId of ids) {
    await sb.from('org_members').upsert(
      { org_id: orgId, user_id: userId, role: 'superadmin' },
      { onConflict: 'org_id,user_id' }
    );
  }
}

async function uploadLogo(sb, orgId, file, label) {
  const path = `${orgId}/logo.png`;
  const buf = readFileSync(join(ASSET_DIR, file));
  const { error: upErr } = await sb.storage.from('org-logos').upload(path, buf, {
    upsert: true,
    contentType: 'image/png',
  });
  if (upErr) throw upErr;
  const { data: pub } = sb.storage.from('org-logos').getPublicUrl(path);
  const { error } = await sb.from('orgs').update({ logo_url: pub.publicUrl }).eq('id', orgId);
  if (error) throw error;
  console.log('logo', label, pub.publicUrl);
}

async function clearGallery(sb, orgId) {
  const { data: existing, error: listErr } = await sb
    .from('org_assets')
    .select('id, storage_path')
    .eq('org_id', orgId)
    .eq('kind', 'gallery');
  if (listErr) throw listErr;
  if (!existing?.length) return;
  const paths = existing.map((a) => a.storage_path).filter(Boolean);
  if (paths.length) {
    const { error: rmErr } = await sb.storage.from('org-assets').remove(paths);
    if (rmErr) throw rmErr;
  }
  const { error: delErr } = await sb.from('org_assets').delete().eq('org_id', orgId).eq('kind', 'gallery');
  if (delErr) throw delErr;
}

async function uploadGallery(sb, orgId, items) {
  await clearGallery(sb, orgId);
  for (const item of items) {
    const ext = item.file.split('.').pop().toLowerCase();
    const storagePath = `${orgId}/gallery/${randomUUID()}.${ext}`;
    const buf = readFileSync(join(ASSET_DIR, item.file));
    const ctype = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
    const { error: upErr } = await sb.storage.from('org-assets').upload(storagePath, buf, {
      upsert: false,
      contentType: ctype,
    });
    if (upErr) throw upErr;
    const { data: pub } = sb.storage.from('org-assets').getPublicUrl(storagePath);
    const { error } = await sb.from('org_assets').insert({
      org_id: orgId,
      kind: 'gallery',
      storage_path: storagePath,
      url: pub.publicUrl,
      label: item.label || item.file,
    });
    if (error) throw error;
    console.log('gallery', item.label);
  }
}

async function main() {
  const { url, key, local } = loadEnv();
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const orgId = await ensureOrg(sb, local);
  await ensureSuperadminMembership(sb, orgId);
  await uploadLogo(sb, orgId, MANIFEST.logo.file, MANIFEST.logo.label);
  await uploadGallery(sb, orgId, MANIFEST.gallery);
  console.log('OK org', orgId);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
