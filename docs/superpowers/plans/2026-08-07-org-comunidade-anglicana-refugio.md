# Org Comunidade Anglicana Refúgio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar a org SaaS `refugio` (cloud + seed local) com tema sage/oliva/creme, logo, galeria de fotos/variantes, e barra do editor a seguir `theme.marinho`.

**Architecture:** Assets versionados em `supabase/seed-assets/refugio/` + manifest; SQL seed/MCP cria a org e membership; script Node faz upload Storage (`org-logos`, `org-assets`) e escreve `logo_url`/`org_assets`. CSS do `ed-bar` passa a CSS vars do tema.

**Tech Stack:** Supabase Postgres/Storage, `@supabase/supabase-js`, Node ESM script, CSS vars existentes (`org-skin.js`).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-07-org-comunidade-anglicana-refugio-design.md`
- Branch: `develop`
- Slug `refugio`; name `Comunidade Anglicana Refúgio`; handle `@anglicana_refugio`
- UUID local fixo: `b0000000-0000-4000-8000-000000000003`
- Manter `iar` e `igreja-teste`
- Galeria: fotos + variantes de logo; **excluir** artes “PRINCÍPIOS” e “QUEM SOMOS?”
- Terracota `#C46B4A` fora do theme nesta iteração
- Theme exacto:
  ```json
  {"paper":"#F5F1E4","ink":"#4A5B45","marinho":"#4A5B45","accent":"#A7CF9A","accentSoft":"#C5E0BB","ambar":"#E0A85E","fontHeading":"Cormorant Garamond","fontBody":"DM Sans"}
  ```
- Cloud project: `ftcefxhnadnxhqvuamqu`
- Script usa `SUPABASE_SERVICE_ROLE_KEY` (cloud) ou keys de `supabase status` (`--local`); nunca commit keys

## File map

| Path | Responsibility |
|------|----------------|
| `supabase/seed-assets/refugio/manifest.json` | Lista de ficheiros → role (`logo` \| `gallery`) + label |
| `supabase/seed-assets/refugio/*.{png,jpg,webp}` | Binários curados (logo + galeria) |
| `supabase/seed.sql` | Org + membership + theme no reset local |
| `scripts/seed-org-refugio.mjs` | Upload Storage + update DB (cloud ou `--local`) |
| `core/editor-styles.css` | `.ed-bar--iar` usa `--marinho` / `--papel` / `--estola` |
| `README.md` | Nota: após `db reset`, correr o script |

---

### Task 1: Curar assets + manifest

**Files:**
- Create: `supabase/seed-assets/refugio/manifest.json`
- Create: `supabase/seed-assets/refugio/logo-symbol.png` (logo principal)
- Create: `supabase/seed-assets/refugio/logo-*.png` (variantes galeria)
- Create: `supabase/seed-assets/refugio/photo-*.jpg|png` (fotos culto)
- Test: `test -f supabase/seed-assets/refugio/manifest.json && jq . supabase/seed-assets/refugio/manifest.json`

**Interfaces:**
- Consumes: ficheiros em `~/.cursor/projects/Users-jorgealcinoneto-Documents-mestrado-editor-iar/assets/`
- Produces: `manifest.json` shape:
  ```json
  {
    "orgSlug": "refugio",
    "logo": { "file": "logo-symbol.png", "label": "Símbolo circular" },
    "gallery": [
      { "file": "logo-wordmark-olive.png", "label": "Wordmark oliva" },
      { "file": "photo-reuniao.png", "label": "Reunião" }
    ]
  }
  ```

- [ ] **Step 1: Criar pasta e copiar/renomear assets**

Fonte (Cursor assets). Mapear assim (ajustar se um ficheiro não existir — escolher o visualmente correcto):

| Destino | Fonte (basename) | Role |
|---------|------------------|------|
| `logo-symbol.png` | Emblema **só círculo** sage (ex. variante sem wordmark; se só houver com texto, usar o círculo mais limpo, p.ex. de `COMUNIDADE_…_0000` ou crop mental: preferir ficheiro ~circular sem tipografia grande) | logo |
| `logo-emblem-arched.png` | Círculo + texto arqueado | gallery |
| `logo-wordmark-olive.png` | Wordmark “COMUNIDADE ANGLICANA / REFÚGIO” fundo oliva (`4-7ce2…` ou `3-a75c…`) | gallery |
| `logo-symbol-black.png` | Símbolo sage em fundo preto | gallery |
| `logo-symbol-olive.png` | Símbolo sage em fundo oliva | gallery |
| `photo-reuniao.png` | `image-4de9900c-…` (reunião parede sage) | gallery |
| `photo-comunhao.png` | `image-d8945f02-…` (hóstia nas mãos) | gallery |
| `photo-elevacao.png` | `image-5863a658-…` (elevação) | gallery |
| `photo-celebrante.png` | `image-a822fa93-…` (celebrante a sorrir) | gallery |

**Excluir:** qualquer arte com “PRINCÍPIOS” ou “QUEM SOMOS?”; screenshots de PR/console.

```bash
ASSETS="$HOME/.cursor/projects/Users-jorgealcinoneto-Documents-mestrado-editor-iar/assets"
DEST="/Users/jorgealcinoneto/Documents/mestrado/editor-iar/supabase/seed-assets/refugio"
mkdir -p "$DEST"
# Copiar com nomes estáveis (ajustar paths exactos após inspecção visual)
cp "$ASSETS/<logo-symbol-source>" "$DEST/logo-symbol.png"
# ... restantes conforme tabela
```

Inspeccionar cada PNG com Read tool (imagem) antes de confirmar o mapeamento.

- [ ] **Step 2: Escrever `manifest.json`**

```json
{
  "orgSlug": "refugio",
  "logo": { "file": "logo-symbol.png", "label": "Símbolo circular" },
  "gallery": [
    { "file": "logo-emblem-arched.png", "label": "Emblema com texto" },
    { "file": "logo-wordmark-olive.png", "label": "Wordmark oliva" },
    { "file": "logo-symbol-black.png", "label": "Símbolo fundo preto" },
    { "file": "logo-symbol-olive.png", "label": "Símbolo fundo oliva" },
    { "file": "photo-reuniao.png", "label": "Reunião" },
    { "file": "photo-comunhao.png", "label": "Comunhão" },
    { "file": "photo-elevacao.png", "label": "Elevação" },
    { "file": "photo-celebrante.png", "label": "Celebrante" }
  ]
}
```

- [ ] **Step 3: Verificar**

```bash
cd /Users/jorgealcinoneto/Documents/mestrado/editor-iar
test -f supabase/seed-assets/refugio/logo-symbol.png
jq -e '.logo.file and (.gallery|length >= 6)' supabase/seed-assets/refugio/manifest.json
ls supabase/seed-assets/refugio/ | wc -l
```

Expected: jq exit 0; pelo menos 8 ficheiros de imagem + manifest.

- [ ] **Step 4: Commit**

```bash
git add supabase/seed-assets/refugio
git commit -m "$(cat <<'EOF'
Add Refúgio seed assets and gallery manifest.

EOF
)"
```

---

### Task 2: Barra do editor segue tema da org

**Files:**
- Modify: `core/editor-styles.css` (blocos `.ed-bar--iar` ~564–625)
- Test: inspeção visual / grep que não restam hardcodes IAR na barra

**Interfaces:**
- Consumes: CSS vars já aplicadas por `applyOrgTheme` (`--marinho`, `--papel`, `--estola`, `--estola-claro`)
- Produces: `.ed-bar--iar` themable por org

- [ ] **Step 1: Confirmar hardcodes actuais**

```bash
rg -n "ed-bar--iar|#0E2A47|#1A52D6|#4978E3" core/editor-styles.css
```

Expected: linhas com fundo azul e primary azul.

- [ ] **Step 2: Substituir por CSS vars**

Trocar o bloco:

```css
.ed-bar--iar { background: #0E2A47; color: #F5EFE6; }
.ed-bar--iar .ed-btn--primary { background: #1A52D6; color: #fff; }
.ed-bar--iar .ed-btn--primary:hover:not(:disabled) { background: #4978E3; }
```

por:

```css
.ed-bar--iar {
  background: var(--marinho, #0E2A47);
  color: var(--papel, #F5EFE6);
}
.ed-bar--iar .ed-btn--primary {
  background: var(--estola, #1A52D6);
  color: #fff;
}
.ed-bar--iar .ed-btn--primary:hover:not(:disabled) {
  background: var(--estola-claro, #4978E3);
}
```

Também:

```css
.ed-bar__title {
  /* ... */
  color: var(--estola-claro, #4978E3);
}
.ed-bar--iar .ed-marca-tab.is-active { color: var(--marinho, #0E2A47); }
```

Fallback mantém IAR se vars ainda não aplicadas.

- [ ] **Step 3: Verificar ausência de hardcode na barra**

```bash
rg -n "\.ed-bar--iar|#0E2A47|#1A52D6" core/editor-styles.css
```

Expected: `#0E2A47` / `#1A52D6` só como fallback dentro de `var(--…, …)` no bloco da barra (ou zero se preferires só vars sem fallback — preferir com fallback).

- [ ] **Step 4: Commit**

```bash
git add core/editor-styles.css
git commit -m "$(cat <<'EOF'
Theme editor top bar from org CSS variables.

EOF
)"
```

---

### Task 3: Seed SQL local com org Refúgio

**Files:**
- Modify: `supabase/seed.sql`
- Test: `rg refugio supabase/seed.sql`

**Interfaces:**
- Consumes: UUID `b0000000-0000-4000-8000-000000000003`, theme JSON da spec
- Produces: org + membership no `db reset`

- [ ] **Step 1: Actualizar INSERT de orgs**

Substituir o bloco de orgs por:

```sql
INSERT INTO public.orgs (id, slug, name, handle, theme) VALUES
  (
    'b0000000-0000-4000-8000-000000000001',
    'iar',
    'Igreja Anglicana Rio',
    '@igrejaanglicanario',
    '{"paper":"#F5EFE6","ink":"#1C2A3A","accent":"#1A52D6","accentSoft":"#4978E3","ambar":"#C99B6B","marinho":"#0E2A47","fontHeading":"Cormorant Garamond","fontBody":"DM Sans"}'::jsonb
  ),
  (
    'b0000000-0000-4000-8000-000000000002',
    'igreja-teste',
    'Igreja Anglicana Teste',
    '@igreja.teste',
    '{"paper":"#F5EFE6","ink":"#1C2A3A","accent":"#1A52D6","accentSoft":"#4978E3","ambar":"#C99B6B","marinho":"#0E2A47","fontHeading":"Cormorant Garamond","fontBody":"DM Sans"}'::jsonb
  ),
  (
    'b0000000-0000-4000-8000-000000000003',
    'refugio',
    'Comunidade Anglicana Refúgio',
    '@anglicana_refugio',
    '{"paper":"#F5F1E4","ink":"#4A5B45","marinho":"#4A5B45","accent":"#A7CF9A","accentSoft":"#C5E0BB","ambar":"#E0A85E","fontHeading":"Cormorant Garamond","fontBody":"DM Sans"}'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;
```

- [ ] **Step 2: Membership**

```sql
INSERT INTO public.org_members (org_id, user_id, role) VALUES
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'superadmin'),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'superadmin'),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'superadmin')
ON CONFLICT DO NOTHING;
```

- [ ] **Step 3: Verificar**

```bash
rg -n "refugio|anglicana_refugio|b0000000-0000-4000-8000-000000000003" supabase/seed.sql
```

Expected: slug, handle, uuid e theme presentes.

- [ ] **Step 4: Commit**

```bash
git add supabase/seed.sql
git commit -m "$(cat <<'EOF'
Seed Comunidade Anglicana Refúgio org for local Supabase.

EOF
)"
```

---

### Task 4: Script `seed-org-refugio.mjs`

**Files:**
- Create: `scripts/seed-org-refugio.mjs`
- Modify: `README.md` (comando pós-reset)
- Test: `node --check scripts/seed-org-refugio.mjs`

**Interfaces:**
- Consumes: `manifest.json`, env `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`, ou `--local` a ler `config.local.js` + service role de `npx supabase status -o env`
- Produces: async CLI; exit 0; uploads + rows `org_assets`; `orgs.logo_url` preenchido

- [ ] **Step 1: Escrever o script**

```javascript
#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

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

function loadEnv() {
  const local = process.argv.includes('--local');
  if (local) {
    const confPath = join(ROOT, 'config.local.js');
    if (!existsSync(confPath)) throw new Error('config.local.js em falta');
    const src = readFileSync(confPath, 'utf8');
    const url = (src.match(/SUPABASE_URL\s*=\s*['"]([^'"]+)['"]/) || [])[1];
    // Prefer service role from env; fallback instructions
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Para --local: export SUPABASE_SERVICE_ROLE_KEY=$(npx supabase status -o env | sed -n "s/SERVICE_ROLE_KEY=//p")');
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

async function uploadGallery(sb, orgId, items) {
  for (const item of items) {
    const ext = item.file.split('.').pop().toLowerCase();
    const storagePath = `${orgId}/gallery/${crypto.randomUUID()}.${ext}`;
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
```

Nota: se o project não tiver `@supabase/supabase-js` instalado, usar CDN-less via `npm install @supabase/supabase-js --no-save` no passo de teste, ou `npx` — no Step 2 instalar como dep de dev se necessário:

```bash
cd /Users/jorgealcinoneto/Documents/mestrado/editor-iar
npm init -y
npm install @supabase/supabase-js --save-dev
```

Só se `package.json` ainda não existir (confirmado: não existe — criar mínimo).

- [ ] **Step 2: Syntax check**

```bash
node --check scripts/seed-org-refugio.mjs
```

Expected: sem output, exit 0.

- [ ] **Step 3: Documentar no README**

Acrescentar sob Modo SaaS / checklist local:

```markdown
### Seed org Refúgio (assets)

Após `npx supabase db reset` (ou na cloud com service role):

```bash
export SUPABASE_SERVICE_ROLE_KEY=...   # local: de `npx supabase status -o env`
node scripts/seed-org-refugio.mjs --local   # ou sem --local para cloud
```
```

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-org-refugio.mjs README.md package.json package-lock.json
git commit -m "$(cat <<'EOF'
Add script to seed Refúgio org logo and gallery assets.

EOF
)"
```

---

### Task 5: Aplicar na cloud + verificar

**Files:**
- N/A (dados remotos); opcional SQL via MCP se o script falhar no insert

**Interfaces:**
- Consumes: script Task 4, assets Task 1, service role cloud
- Produces: org `refugio` na cloud com logo + galeria

- [ ] **Step 1: Inserir/actualizar org via SQL (MCP ou script)**

Se o script já faz `ensureOrg`, este passo é opcional. Via MCP `execute_sql` no project `ftcefxhnadnxhqvuamqu`:

```sql
INSERT INTO public.orgs (slug, name, handle, theme)
VALUES (
  'refugio',
  'Comunidade Anglicana Refúgio',
  '@anglicana_refugio',
  '{"paper":"#F5F1E4","ink":"#4A5B45","marinho":"#4A5B45","accent":"#A7CF9A","accentSoft":"#C5E0BB","ambar":"#E0A85E","fontHeading":"Cormorant Garamond","fontBody":"DM Sans"}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  handle = EXCLUDED.handle,
  theme = EXCLUDED.theme
RETURNING id;
```

Membership:

```sql
INSERT INTO public.org_members (org_id, user_id, role)
SELECT o.id, m.user_id, 'superadmin'
FROM public.orgs o
CROSS JOIN (
  SELECT DISTINCT user_id FROM public.org_members WHERE role = 'superadmin'
) m
WHERE o.slug = 'refugio'
ON CONFLICT DO NOTHING;
```

- [ ] **Step 2: Correr upload cloud**

```bash
export SUPABASE_URL=https://ftcefxhnadnxhqvuamqu.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=<from dashboard>
node scripts/seed-org-refugio.mjs
```

Expected: logs `logo …` e várias linhas `gallery …`; exit 0.

- [ ] **Step 3: Verificar SQL**

```sql
SELECT slug, name, handle, logo_url IS NOT NULL AS has_logo, theme->>'marinho' AS marinho
FROM orgs WHERE slug = 'refugio';

SELECT count(*) FROM org_assets a
JOIN orgs o ON o.id = a.org_id
WHERE o.slug = 'refugio' AND a.kind = 'gallery';
```

Expected: `has_logo=true`, `marinho=#4A5B45`, count ≥ 6.

- [ ] **Step 4: Verificar UI (cloud Pages ou local)**

1. Abrir editor SaaS, seleccionar **Comunidade Anglicana Refúgio**
2. Barra superior oliva `#4A5B45` (não azul)
3. Galeria com fotos + logos
4. Trocar para IAR → barra volta a azul-marinho

- [ ] **Step 5: Commit docs se README mudou nesta task; senão skip**

Se só dados cloud: sem commit. Push `develop` quando o user pedir.

---

### Task 6: Seed local end-to-end (opcional se stack disponível)

**Files:** none new

- [ ] **Step 1: Reset + script**

```bash
cd /Users/jorgealcinoneto/Documents/mestrado/editor-iar
./dev.sh   # ou: npx supabase db reset && python3 -m http.server 8080 --bind 127.0.0.1
export SUPABASE_SERVICE_ROLE_KEY=$(npx supabase status -o env 2>/dev/null | sed -n 's/^SERVICE_ROLE_KEY=//p')
node scripts/seed-org-refugio.mjs --local
```

Expected: OK org `b0000000-0000-4000-8000-000000000003`

- [ ] **Step 2: Checklist rápido**

Abrir `http://127.0.0.1:8080/index.html` → org Refúgio → barra oliva + galeria.

---

## Spec coverage (self-review)

| Spec requirement | Task |
|------------------|------|
| Org cloud + seed local | 3, 5, 6 |
| Theme JSON exacto | 3, 4, 5 |
| Logo principal símbolo | 1, 4 |
| Galeria fotos + variantes logo | 1, 4, 5 |
| Excluir artes finalizadas | 1 |
| Manter igreja-teste | 3 |
| ed-bar por `--marinho` | 2 |
| Script one-shot | 4 |
| Sem terracotta no theme | 3, 4 |
| Fontes Cormorant + DM Sans | 3, 4 |

## Placeholder scan

Nenhum TBD; paths e código concretos; service role via env (não no repo).
