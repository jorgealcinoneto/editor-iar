#!/usr/bin/env node
/* ============================================
   Seed genérico de org: logo + galeria + metadados.

   Uso:  node scripts/seed-org.mjs <slug> [--local]

   Tudo (name, handle, catalogId, theme, ficheiros) vem de
   supabase/seed-assets/<slug>/manifest.json — o script não tem
   nada específico de nenhuma org.

   Idempotente: org por select-then-update/insert, logo com upsert
   em caminho fixo, galeria em clear-then-reinsert.
============================================ */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, join, extname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const CONTENT_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};
const contentTypeFor = (file) => CONTENT_TYPES[extname(file).toLowerCase()] || 'application/octet-stream';

function parseArgs() {
  const args = process.argv.slice(2);
  const slug = args.find((a) => !a.startsWith('--'));
  if (!slug) throw new Error('Uso: node scripts/seed-org.mjs <slug> [--local]');
  return { slug, local: args.includes('--local') };
}

function localServiceRoleKey() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return process.env.SUPABASE_SERVICE_ROLE_KEY;
  try {
    const raw = execSync('npx supabase status -o json', { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    return JSON.parse(raw.trim()).SERVICE_ROLE_KEY || '';
  } catch {
    return '';
  }
}

function loadEnv(local) {
  if (local) {
    const confPath = join(ROOT, 'config.local.js');
    if (!existsSync(confPath)) throw new Error('config.local.js em falta — corre ./dev.sh');
    const src = readFileSync(confPath, 'utf8');
    const url = (src.match(/SUPABASE_URL\s*=\s*['"]([^'"]+)['"]/) || [])[1];
    const key = localServiceRoleKey();
    if (!url || !key) throw new Error('Para --local: sobe o stack (`npx supabase start`) e garante config.local.js');
    return { url, key };
  }
  const url = process.env.SUPABASE_URL || 'https://ftcefxhnadnxhqvuamqu.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('Defina SUPABASE_SERVICE_ROLE_KEY');
  return { url, key };
}

async function ensureOrg(sb, manifest) {
  const fields = {
    name: manifest.name,
    handle: manifest.handle,
    theme: manifest.theme,
    ...(manifest.catalogId ? { catalog_id: manifest.catalogId } : {}),
  };
  const { data: existing, error: selErr } = await sb
    .from('orgs').select('id').eq('slug', manifest.orgSlug).maybeSingle();
  if (selErr) throw selErr;
  if (existing?.id) {
    const { error } = await sb.from('orgs').update(fields).eq('id', existing.id);
    if (error) throw error;
    return existing.id;
  }
  const { data, error } = await sb
    .from('orgs').insert({ slug: manifest.orgSlug, ...fields }).select('id').single();
  if (error) throw error;
  return data.id;
}

async function ensureSuperadminMembership(sb, orgId) {
  const { data: admins, error } = await sb
    .from('org_members').select('user_id').eq('role', 'superadmin').limit(20);
  if (error) throw error;
  const ids = [...new Set((admins || []).map((a) => a.user_id))];
  for (const userId of ids) {
    const { error: upErr } = await sb.from('org_members').upsert(
      { org_id: orgId, user_id: userId, role: 'superadmin' },
      { onConflict: 'org_id,user_id' },
    );
    if (upErr) throw upErr;
  }
  return ids.length;
}

async function uploadLogo(sb, orgId, assetDir, logo) {
  const ext = extname(logo.file).toLowerCase();
  const path = `${orgId}/logo${ext}`;
  const buf = readFileSync(join(assetDir, logo.file));
  const { error: upErr } = await sb.storage.from('org-logos')
    .upload(path, buf, { upsert: true, contentType: contentTypeFor(logo.file) });
  if (upErr) throw upErr;
  const { data: pub } = sb.storage.from('org-logos').getPublicUrl(path);
  const { error } = await sb.from('orgs').update({ logo_url: pub.publicUrl }).eq('id', orgId);
  if (error) throw error;
  console.log('logo   ', logo.label, '→', pub.publicUrl);
}

async function clearGallery(sb, orgId) {
  const { data: existing, error: listErr } = await sb
    .from('org_assets').select('id, storage_path').eq('org_id', orgId).eq('kind', 'gallery');
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

async function uploadGallery(sb, orgId, assetDir, items) {
  await clearGallery(sb, orgId);
  for (const item of items) {
    const ext = extname(item.file).toLowerCase();
    const storagePath = `${orgId}/gallery/${randomUUID()}${ext}`;
    const buf = readFileSync(join(assetDir, item.file));
    const { error: upErr } = await sb.storage.from('org-assets')
      .upload(storagePath, buf, { upsert: false, contentType: contentTypeFor(item.file) });
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
  const { slug, local } = parseArgs();
  const assetDir = join(ROOT, 'supabase/seed-assets', slug);
  const manifestPath = join(assetDir, 'manifest.json');
  if (!existsSync(manifestPath)) throw new Error(`manifest.json não encontrado em ${assetDir}`);
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (manifest.orgSlug !== slug) {
    throw new Error(`manifest.orgSlug (${manifest.orgSlug}) não bate com o argumento (${slug})`);
  }

  const { url, key } = loadEnv(local);
  const sb = createClient(url, key, { auth: { persistSession: false } });

  const orgId = await ensureOrg(sb, manifest);
  const admins = await ensureSuperadminMembership(sb, orgId);
  if (manifest.logo) await uploadLogo(sb, orgId, assetDir, manifest.logo);
  if (manifest.gallery?.length) await uploadGallery(sb, orgId, assetDir, manifest.gallery);

  console.log(`\nOK · org ${manifest.name}`);
  console.log(`   id        ${orgId}`);
  console.log(`   catalog   ${manifest.catalogId || '(default)'}`);
  console.log(`   galeria   ${manifest.gallery?.length || 0} assets`);
  console.log(`   admins    ${admins}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
