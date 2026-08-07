# Org Asset Isolation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Isolar logo, galeria, uploads, paleta e fontes Google Fonts por organização SaaS, sem partilha cross-org.

**Architecture:** Tabela `org_assets` + bucket Storage `org-assets` por org; `theme` extendido com `fontHeading`/`fontBody`; runtime carrega galeria/fonts em `activateOrg`; editor mostra galeria org separada do catálogo IAR global.

**Tech Stack:** Supabase Postgres/Storage/RLS, React UMD (existente), Google Fonts CSS API, localStorage (state por org, inalterado).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-07-org-asset-isolation-design.md`
- Branch: `develop`
- SaaS only (`SAAS_MODE`); legado offline inalterado
- Fontes: Google Fonts dropdown no admin — **sem** upload `.woff2`
- Galeria catálogo IAR (`IAR_GALLERIES`) permanece global mas UI separada
- Logo mantém bucket `org-logos` existente
- GRANTs explícitos em toda migration nova (lição `002_api_grants`)
- Superadmin gere assets no admin (MVP)

## File map

| Path | Responsibility |
|------|----------------|
| `supabase/migrations/003_org_assets.sql` | Tabela, bucket, RLS, grants |
| `core/org-skin.js` | theme fonts, CSS vars, `loadOrgFonts()` |
| `core/org-gallery.js` | `loadOrgGallery`, `uploadOrgAsset`, `deleteOrgAsset` |
| `core/org-skin.test.mjs` | Tests fonts + theme vars |
| `core/admin-app.jsx` | Font dropdowns + galeria CRUD |
| `core/editor-app.jsx` | Galeria split, TweaksPanel SaaS, org switch reload |
| `core/form-fields.jsx` | Upload → Storage, galeria org |
| `marcas/iar/styles.css` | `--font-heading`, `--font-body` |
| `marcas/iar/canvas.html` | Load org-gallery on auth |
| `scripts/e2e-local-checklist.py` | Asset isolation smoke |

---

### Task 1: Migration org_assets + Storage bucket

**Files:**
- Create: `supabase/migrations/003_org_assets.sql`

**Interfaces:**
- Produces: table `public.org_assets`, bucket `org-assets`, RLS policies, GRANTs

- [ ] **Step 1: Write migration**

```sql
-- org_assets metadata
create table public.org_assets (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  kind text not null check (kind in ('gallery', 'upload')),
  storage_path text not null,
  url text not null,
  label text not null default '',
  created_at timestamptz not null default now()
);

create index org_assets_org_kind_idx on public.org_assets (org_id, kind);

alter table public.org_assets enable row level security;

create policy org_assets_select_member on public.org_assets for select
  using (public.is_org_member(org_id) or public.is_superadmin());

create policy org_assets_write_superadmin on public.org_assets for all
  using (public.is_superadmin())
  with check (public.is_superadmin());

grant select, insert, update, delete on table public.org_assets to authenticated, service_role;

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('org-assets', 'org-assets', true)
on conflict (id) do nothing;

create policy org_assets_storage_read on storage.objects for select
  using (bucket_id = 'org-assets' and (
    public.is_org_member((storage.foldername(name))[1]::uuid)
    or public.is_superadmin()
  ));

create policy org_assets_storage_write on storage.objects for all
  using (bucket_id = 'org-assets' and public.is_superadmin())
  with check (bucket_id = 'org-assets' and public.is_superadmin());
```

Note: `storage.foldername(name)[1]` assumes path `{org_id}/...`. Test locally; adjust policy if Supabase helper differs — fallback: `(split_part(name, '/', 1))::uuid`.

- [ ] **Step 2: Apply locally**

```bash
npx supabase db reset
```

Expected: migration applies without error.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/003_org_assets.sql
git commit -m "Add org_assets table and org-assets storage bucket."
```

---

### Task 2: org-skin fonts + tests

**Files:**
- Modify: `core/org-skin.js`
- Modify: `core/org-skin.test.mjs`

**Interfaces:**
- Produces: `buildOrgSkin` includes `fontHeading`, `fontBody`; `applyOrgTheme` sets `--font-heading`, `--font-body`; `loadOrgFonts(skin)` injects Google Fonts link

- [ ] **Step 1: Extend tests**

Add to `core/org-skin.test.mjs`:

```javascript
const orgWithFonts = {
  ...org,
  theme: { ...org.theme, fontHeading: 'Fraunces', fontBody: 'Inter' },
};
const skinFonts = buildOrgSkin(orgWithFonts);
assert.equal(skinFonts.fontHeading, 'Fraunces');
assert.equal(skinFonts.fontBody, 'Inter');

applyOrgTheme(skinFonts.theme, fakeRoot);
assert.equal(vars['--font-heading'], 'Fraunces');
assert.equal(vars['--font-body'], 'Inter');
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
node core/org-skin.test.mjs
```

- [ ] **Step 3: Implement in org-skin.js**

```javascript
// buildOrgSkin — add:
fontHeading: org.theme?.fontHeading || 'Cormorant Garamond',
fontBody: org.theme?.fontBody || 'DM Sans',

// applyOrgTheme map — add:
fontHeading: '--font-heading',
fontBody: '--font-body',

// new function loadOrgFonts(skin):
function loadOrgFonts(skin) {
  if (typeof document === 'undefined') return;
  const id = 'ed-org-fonts';
  let link = document.getElementById(id);
  if (!skin?.fontHeading && !skin?.fontBody) {
    if (link) link.remove();
    return;
  }
  const families = [skin.fontHeading, skin.fontBody].filter(Boolean);
  const unique = [...new Set(families)];
  const params = unique.map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`).join('&');
  const href = `https://fonts.googleapis.com/css2?${params}&display=swap`;
  if (!link) {
    link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  link.href = href;
}
global.loadOrgFonts = loadOrgFonts;

// activateOrg — after applyOrgTheme:
loadOrgFonts(global.ORG_SKIN);
global.ORG_GALLERY = [];
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
node core/org-skin.test.mjs
```

- [ ] **Step 5: Commit**

```bash
git add core/org-skin.js core/org-skin.test.mjs
git commit -m "Add per-org Google Fonts to org skin."
```

---

### Task 3: org-gallery.js helpers

**Files:**
- Create: `core/org-gallery.js`
- Modify: `index.html`, `admin.html`, `marcas/iar/canvas.html` (script tag)

**Interfaces:**
- Produces:
  - `window.loadOrgGallery(supabase, orgId)` → `ORG_GALLERY[]`
  - `window.uploadOrgAsset(supabase, orgId, file, kind)` → `{ id, url }`
  - `window.deleteOrgAsset(supabase, asset)` → void

- [ ] **Step 1: Implement org-gallery.js**

```javascript
(function (global) {
  async function loadOrgGallery(supabase, orgId) {
    if (!orgId) { global.ORG_GALLERY = []; return []; }
    const { data, error } = await supabase
      .from('org_assets')
      .select('id, url, label, kind, storage_path')
      .eq('org_id', orgId)
      .eq('kind', 'gallery')
      .order('created_at', { ascending: false });
    if (error) throw error;
    global.ORG_GALLERY = data || [];
    return global.ORG_GALLERY;
  }

  async function uploadOrgAsset(supabase, orgId, file, kind) {
    const ext = (file.name.split('.').pop() || 'png').toLowerCase();
    const path = `${orgId}/${kind}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('org-assets')
      .upload(path, file, { upsert: false, contentType: file.type || 'image/png' });
    if (upErr) throw upErr;
    const { data: pub } = supabase.storage.from('org-assets').getPublicUrl(path);
    const url = pub?.publicUrl || '';
    const { data, error } = await supabase
      .from('org_assets')
      .insert({ org_id: orgId, kind, storage_path: path, url, label: file.name })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function deleteOrgAsset(supabase, asset) {
    await supabase.storage.from('org-assets').remove([asset.storage_path]);
    const { error } = await supabase.from('org_assets').delete().eq('id', asset.id);
    if (error) throw error;
  }

  global.loadOrgGallery = loadOrgGallery;
  global.uploadOrgAsset = uploadOrgAsset;
  global.deleteOrgAsset = deleteOrgAsset;
})(window);
```

- [ ] **Step 2: Add script tags** after `org-skin.js`:

```html
<script src="core/org-gallery.js"></script>
```

(canvas: `../../core/org-gallery.js`)

- [ ] **Step 3: Wire activateOrg reload**

In `core/auth-gate.jsx` `loadMemberships`, after `activateOrg`:

```javascript
if (global.SAAS_MODE && typeof global.loadOrgGallery === 'function') {
  try { await global.loadOrgGallery(supabase, row.orgs.id); } catch (e) { console.error('gallery', e); }
}
```

- [ ] **Step 4: Commit**

```bash
git add core/org-gallery.js core/auth-gate.jsx index.html admin.html marcas/iar/canvas.html
git commit -m "Add org gallery loader and upload helpers."
```

---

### Task 4: Editor — galeria split + TweaksPanel SaaS

**Files:**
- Modify: `core/editor-app.jsx`
- Modify: `marcas/iar/styles.css` (font CSS vars)

**Interfaces:**
- Consumes: `ORG_GALLERY`, `ORG_SKIN.theme`, `loadOrgGallery`
- Produces: UI with org gallery section + collapsible IAR catalog; SaaS tweaks from theme

- [ ] **Step 1: CSS vars in styles.css**

```css
.post-inner, .post {
  font-family: var(--font-body, 'DM Sans', sans-serif);
}
/* headings in templates — use var(--font-heading) where .tpl-title etc. */
```

- [ ] **Step 2: Refactor GalleryBrowser**

Two sections when `SAAS_MODE`:
- Org photos from `(window.ORG_GALLERY || []).map(a => a.url)`
- IAR catalog from `marca.galleries` in collapsible `<details>`

- [ ] **Step 3: TweaksPanel SaaS branch**

When `window.SAAS_MODE && window.ORG_SKIN?.theme`:
- Hide manifest palette/accent grids
- Show read-only swatches from theme (paper, ink, accent, marinho, ambar)
- Keep fontScale if desired (per-org state already isolated)

- [ ] **Step 4: switchOrg — reload gallery**

```javascript
const switchOrg = async (org) => {
  // ... existing save ...
  window.activateOrg(org, window.ORG_MEMBERSHIP?.role);
  if (window.SAAS_MODE) {
    try {
      await window.loadOrgGallery(window.getSupabase(), org.id);
    } catch (e) { console.error(e); }
  }
  reloadMarcaState(marcaId, org.id);
  setActiveOrgId(org.id);
};
```

- [ ] **Step 5: Manual smoke** — switch between iar / igreja-teste, galerias distintas

- [ ] **Step 6: Commit**

```bash
git add core/editor-app.jsx marcas/iar/styles.css
git commit -m "Isolate editor gallery and palette per org in SaaS mode."
```

---

### Task 5: form-fields upload → Storage

**Files:**
- Modify: `core/form-fields.jsx`

**Interfaces:**
- Consumes: `uploadOrgAsset`, `ORG_GALLERY`, `ORG_MEMBERSHIP.orgId`

- [ ] **Step 1: SaaS upload path**

In photo/image field `onFile`:

```javascript
if (window.SAAS_MODE && window.uploadOrgAsset) {
  const orgId = window.ORG_MEMBERSHIP?.orgId;
  if (!orgId) return;
  const asset = await window.uploadOrgAsset(window.getSupabase(), orgId, file, 'upload');
  onChange(asset.url);
  return;
}
// else existing FileReader data: URL (legado)
```

- [ ] **Step 2: Galeria inline** — org URLs first, IAR catalog in separate labeled block (mirror GalleryBrowser)

- [ ] **Step 3: Commit**

```bash
git add core/form-fields.jsx
git commit -m "Upload field images to org-scoped storage in SaaS mode."
```

---

### Task 6: Admin — fonts + galeria CRUD

**Files:**
- Modify: `core/admin-app.jsx`

**Interfaces:**
- Consumes: `uploadOrgAsset`, `deleteOrgAsset`, `loadOrgGallery`
- Produces: font dropdowns in theme form; gallery upload/list/delete per org

- [ ] **Step 1: Font constants**

```javascript
const GOOGLE_FONTS = [
  'Cormorant Garamond', 'EB Garamond', 'Fraunces', 'Instrument Serif',
  'DM Sans', 'Inter', 'Space Grotesk', 'Syne', 'Bricolage Grotesque',
  'Unbounded', 'JetBrains Mono', 'Anton',
];
```

- [ ] **Step 2: Theme form** — two `<select>` for `fontHeading`, `fontBody`

- [ ] **Step 3: Gallery section** when editing org with id:
- Load `loadOrgGallery(supabase, form.id)` on startEdit
- Multi file input → `uploadOrgAsset(..., 'gallery')` each
- List with delete button → `deleteOrgAsset`

- [ ] **Step 4: Commit**

```bash
git add core/admin-app.jsx
git commit -m "Admin: manage org fonts and gallery assets."
```

---

### Task 7: E2E + docs

**Files:**
- Modify: `scripts/e2e-local-checklist.py`
- Modify: `CLAUDE.md`, `README.md`

- [ ] **Step 1: E2E — upload gallery asset org iar, verify not visible query as different org** (service role or two tokens)

- [ ] **Step 2: Docs** — note org asset isolation in CLAUDE.md SaaS section

- [ ] **Step 3: Commit**

```bash
git add scripts/e2e-local-checklist.py CLAUDE.md README.md
git commit -m "Document and test org asset isolation."
```

---

## Spec coverage (self-review)

| Spec requirement | Task |
|------------------|------|
| org_assets table + bucket | Task 1 |
| theme fontHeading/fontBody | Task 2, 6 |
| loadOrgGallery on activateOrg | Task 3 |
| Galeria org vs catálogo IAR | Task 4, 5 |
| TweaksPanel from org theme | Task 4 |
| Upload → Storage | Task 5 |
| Admin gallery + fonts | Task 6 |
| Canvas parity | Task 3 (script + auth-gate) |
| Switch org reload | Task 4 |
| Tests | Task 2, 7 |
| RLS cross-org block | Task 1, 7 |

No placeholders. Types consistent across tasks.
