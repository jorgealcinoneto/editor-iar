# White-label SaaS MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the static IAR editor into a multi-org SaaS with Supabase auth, org-scoped skin (logo/colors/name/handle), and a shared `church-v1` template catalog.

**Architecture:** Keep the Babel-CDN React app on GitHub Pages. Add Supabase (Auth + Postgres + Storage). After login, resolve the user's org, set `window.ORG_SKIN`, override CSS variables, and key `localStorage` by `orgId`. Superadmin manages orgs/invites via `admin.html`. OFMJ stays local-only, out of the SaaS path.

**Tech Stack:** React 18 UMD + Babel standalone (existing), Supabase JS CDN (`@supabase/supabase-js`), Postgres RLS, GitHub Pages, `html-to-image` (existing). Node for unit tests of pure skin helpers (no frontend test runner today).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-04-white-label-saas-mvp-design.md`
- MVP catalog id is always `church-v1` (current IAR templates/styles)
- Org creation: superadmin only; members via invite
- Skin tokens: `theme.marinho` → `--marinho`, `theme.accent` → `--estola`, `theme.accentSoft` → `--estola-claro`, `theme.paper` → `--papel`, `theme.ink` → `--grafite`, `theme.ambar` → `--ambar`
- State key: `ed:{orgId}:state` (replace `ed:iar:state` in SaaS mode)
- Env: `window.SUPABASE_URL` and `window.SUPABASE_ANON_KEY` from `config.js` (gitignored secrets file + `config.example.js` committed)
- Do not integrate OFMJ into SaaS boot
- Do not build the no-code template builder in this plan
- Free-tier friendly: no server-side PNG export

## File map

| Path | Responsibility |
|------|----------------|
| `supabase/migrations/001_saas_mvp.sql` | Tables, RLS, storage policies |
| `config.example.js` | Documented env shape |
| `config.js` | Local secrets (gitignored) |
| `core/supabase-client.js` | Create/reuse Supabase client |
| `core/org-skin.js` | `applyOrgTheme`, `buildOrgSkin`, `getSkinBrandLines` |
| `core/org-skin.test.mjs` | Node tests for skin helpers |
| `core/auth-gate.jsx` | Login UI + session + org resolution |
| `core/boot.jsx` | Boot SaaS vs legacy `MARCA_FORCADA` |
| `core/editor-app.jsx` | Use `ORG_SKIN`, org-scoped localStorage |
| `marcas/iar/icons.jsx` | Logo from `ORG_SKIN.logoUrl` |
| `marcas/iar/templates.jsx` | PostHead/PostFoot/brand strings from skin |
| `admin.html` + `core/admin-app.jsx` | Superadmin CRUD orgs + invites |
| `index.html` | Load config + supabase + auth before editor |
| `.gitignore` | Ignore `config.js` |

---

### Task 1: Supabase schema, RLS, storage

**Files:**
- Create: `supabase/migrations/001_saas_mvp.sql`
- Modify: `.gitignore`
- Create: `config.example.js`

**Interfaces:**
- Produces: tables `orgs`, `org_members`, `invites`; bucket `org-logos`; helper SQL to detect platform superadmin via `org_members.role = 'superadmin'` on any org OR a dedicated check: user is superadmin if they have at least one `org_members.role = 'superadmin'`

- [ ] **Step 1: Add `config.js` to gitignore**

Append to `.gitignore`:

```
config.js
```

- [ ] **Step 2: Write `config.example.js`**

```js
// Copy to config.js and fill values from Supabase Project Settings → API
window.SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
window.SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

- [ ] **Step 3: Write migration SQL**

Create `supabase/migrations/001_saas_mvp.sql` with exact contents:

```sql
-- White-label SaaS MVP schema
create extension if not exists "pgcrypto";

create table public.orgs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  handle text not null default '',
  logo_url text,
  catalog_id text not null default 'church-v1',
  theme jsonb not null default '{
    "paper":"#F5EFE6","ink":"#1C2A3A","accent":"#1A52D6",
    "accentSoft":"#4978E3","ambar":"#C99B6B","marinho":"#0E2A47"
  }'::jsonb,
  created_at timestamptz not null default now()
);

create table public.org_members (
  org_id uuid not null references public.orgs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('superadmin', 'member')),
  primary key (org_id, user_id)
);

create table public.invites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  email text not null,
  token text not null unique default encode(gen_random_bytes(16), 'hex'),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'expired')),
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now()
);

create index invites_email_idx on public.invites (lower(email));
create index org_members_user_idx on public.org_members (user_id);

create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.org_members m
    where m.user_id = auth.uid() and m.role = 'superadmin'
  );
$$;

create or replace function public.is_org_member(oid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.org_members m
    where m.user_id = auth.uid() and m.org_id = oid
  );
$$;

alter table public.orgs enable row level security;
alter table public.org_members enable row level security;
alter table public.invites enable row level security;

create policy orgs_select_member on public.orgs for select
  using (public.is_org_member(id) or public.is_superadmin());

create policy orgs_write_superadmin on public.orgs for all
  using (public.is_superadmin())
  with check (public.is_superadmin());

create policy members_select_own on public.org_members for select
  using (user_id = auth.uid() or public.is_superadmin());

create policy members_write_superadmin on public.org_members for all
  using (public.is_superadmin())
  with check (public.is_superadmin());

create policy invites_select_superadmin on public.invites for select
  using (public.is_superadmin());

create policy invites_write_superadmin on public.invites for all
  using (public.is_superadmin())
  with check (public.is_superadmin());

-- Storage bucket (run in SQL editor; create bucket org-logos as public read)
insert into storage.buckets (id, name, public)
values ('org-logos', 'org-logos', true)
on conflict (id) do nothing;

create policy org_logos_public_read on storage.objects for select
  using (bucket_id = 'org-logos');

create policy org_logos_superadmin_write on storage.objects for all
  using (bucket_id = 'org-logos' and public.is_superadmin())
  with check (bucket_id = 'org-logos' and public.is_superadmin());
```

- [ ] **Step 4: Apply migration in Supabase**

Manual (operator): create free Supabase project → SQL Editor → paste `001_saas_mvp.sql` → Run. Confirm tables exist under Table Editor.

- [ ] **Step 5: Bootstrap first superadmin (manual SQL after first Auth user exists)**

```sql
-- After you sign up once in the app, replace USER_UUID and create seed org:
insert into public.orgs (slug, name, handle)
values ('iar', 'Igreja Anglicana Rio', '@igrejaanglicanario')
returning id;

insert into public.org_members (org_id, user_id, role)
values ('ORG_UUID', 'USER_UUID', 'superadmin');
```

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/001_saas_mvp.sql config.example.js .gitignore
git commit -m "Add Supabase schema and config example for SaaS MVP."
```

---

### Task 2: Supabase client + org skin helpers (TDD)

**Files:**
- Create: `core/supabase-client.js`
- Create: `core/org-skin.js`
- Create: `core/org-skin.test.mjs`

**Interfaces:**
- Produces:
  - `window.getSupabase()` → SupabaseClient
  - `buildOrgSkin(orgRow)` → `{ id, slug, name, handle, logoUrl, catalogId, theme }`
  - `applyOrgTheme(theme, rootEl = document.documentElement)` → void (sets CSS vars)
  - `getSkinBrandLines(skin)` → `{ line1, line2 }` where `line1` is all but last word of `name`, `line2` is last word (fallback line1=`name`, line2=``)

- [ ] **Step 1: Write failing Node tests**

Create `core/org-skin.test.mjs`:

```js
import { strict as assert } from 'node:assert';
import { buildOrgSkin, applyOrgTheme, getSkinBrandLines } from './org-skin.js';

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
```

- [ ] **Step 2: Run tests — expect FAIL (module missing)**

```bash
node core/org-skin.test.mjs
```

Expected: `ERR_MODULE_NOT_FOUND` for `./org-skin.js`

- [ ] **Step 3: Implement `core/org-skin.js` as ES module + browser global**

```js
export function buildOrgSkin(org) {
  if (!org) return null;
  return {
    id: org.id,
    slug: org.slug,
    name: org.name || '',
    handle: org.handle || '',
    logoUrl: org.logo_url || '',
    catalogId: org.catalog_id || 'church-v1',
    theme: org.theme || {},
  };
}

export function getSkinBrandLines(skin) {
  const name = (skin?.name || '').trim();
  if (!name) return { line1: '', line2: '' };
  const parts = name.split(/\s+/);
  if (parts.length === 1) return { line1: parts[0], line2: '' };
  return { line1: parts.slice(0, -1).join(' '), line2: parts[parts.length - 1] };
}

export function applyOrgTheme(theme, rootEl) {
  const root = rootEl || (typeof document !== 'undefined' ? document.documentElement : null);
  if (!root || !theme) return;
  const map = {
    marinho: '--marinho',
    accent: '--estola',
    accentSoft: '--estola-claro',
    paper: '--papel',
    ink: '--grafite',
    ambar: '--ambar',
  };
  Object.entries(map).forEach(([key, cssVar]) => {
    if (theme[key]) root.style.setProperty(cssVar, theme[key]);
  });
}

if (typeof window !== 'undefined') {
  Object.assign(window, { buildOrgSkin, getSkinBrandLines, applyOrgTheme });
}
```

Also create a thin UMD-less browser loader note: for Babel app without modules, add `core/org-skin.browser.js` that duplicates the three functions onto `window` (copy of same logic without `export`). Prefer one file loaded as classic script:

Actually for this static app, use **classic script** only — put functions on `window` in `core/org-skin.js` without `export`, and make the test file define helpers inline OR use a dual-package. Simplest path for this repo:

Rewrite implementation as classic script assigning `window`, and test with:

```js
// core/org-skin.test.mjs — load via vm or duplicate import
```

**Chosen approach for this codebase:** `core/org-skin.js` classic:

```js
(function (global) {
  function buildOrgSkin(org) { /* same */ }
  function getSkinBrandLines(skin) { /* same */ }
  function applyOrgTheme(theme, rootEl) { /* same */ }
  global.buildOrgSkin = buildOrgSkin;
  global.getSkinBrandLines = getSkinBrandLines;
  global.applyOrgTheme = applyOrgTheme;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { buildOrgSkin, getSkinBrandLines, applyOrgTheme };
  }
})(typeof window !== 'undefined' ? window : globalThis);
```

And test:

```js
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { buildOrgSkin, applyOrgTheme, getSkinBrandLines } = require('./org-skin.js');
// ...asserts...
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
node core/org-skin.test.mjs
```

Expected: `org-skin tests OK`

- [ ] **Step 5: Implement `core/supabase-client.js`**

```js
(function (global) {
  let client = null;
  function getSupabase() {
    if (client) return client;
    const url = global.SUPABASE_URL;
    const key = global.SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Falta config.js (SUPABASE_URL / SUPABASE_ANON_KEY)');
    if (!global.supabase?.createClient) throw new Error('SDK Supabase não carregado');
    client = global.supabase.createClient(url, key);
    return client;
  }
  global.getSupabase = getSupabase;
})(window);
```

- [ ] **Step 6: Commit**

```bash
git add core/org-skin.js core/org-skin.test.mjs core/supabase-client.js
git commit -m "Add org skin helpers and Supabase client wrapper."
```

---

### Task 3: Tokenize brand chrome in catalog

**Files:**
- Modify: `marcas/iar/icons.jsx` (`IconLogoMarca`)
- Modify: `marcas/iar/templates.jsx` (`PostHead`, `PostFoot`, `LectionaryBrand`, hardcoded handles/names in Story/Print/Spotify chrome — not myth body copy)

**Interfaces:**
- Consumes: `window.ORG_SKIN`, `window.getSkinBrandLines`
- Produces: brand UI reads skin; content defaults in registry unchanged

- [ ] **Step 1: Update `IconLogoMarca` to prefer skin logo**

In `marcas/iar/icons.jsx`, change `src`/`alt` to:

```jsx
const skin = window.ORG_SKIN;
const src = skin?.logoUrl
  || ((window.MARCAS?.iar?.assetBase || 'marcas/iar/') + 'assets/logo-iar-symbol.png');
const alt = skin?.name || 'Igreja Anglicana Rio';
```

- [ ] **Step 2: Update `PostHead` / `PostFoot`**

```jsx
function PostHead({ category, dark = false, compact = false, logoWidth = 56, logoHeight = 64, textScale = 1, legible = false }) {
  const skin = window.ORG_SKIN;
  const { line1, line2 } = (window.getSkinBrandLines || (() => ({ line1: 'Igreja Anglicana', line2: 'RIO' })))(skin || { name: 'Igreja Anglicana Rio' });
  // render line1 / (line2 || 'RIO') instead of hardcoded strings
}

function PostFoot({ pages, handle, dark = false }) {
  const h = handle ?? window.ORG_SKIN?.handle ?? '@igrejaanglicanario';
  // use h
}
```

- [ ] **Step 3: Replace remaining chrome hardcodes in templates**

Replace brand chrome only (not educational copy about Anglicanism):

- `LectionaryBrand` lines → skin brand lines
- Story verse/quote footer `@igrejaanglicanario` → `ORG_SKIN.handle`
- `StorySpotify` / `CapaSpotify` / `BannerYouTube` brand text + alt → skin
- `PrintFolder` church name + handle → skin

Leave registry `defaults` myth/lectionary sample text as-is (editable content).

- [ ] **Step 4: Manual verify legacy mode**

Without `ORG_SKIN`, open `index.html` with `MARCA_FORCADA='iar'` — brand still shows Igreja Anglicana Rio / default logo.

- [ ] **Step 5: Commit**

```bash
git add marcas/iar/icons.jsx marcas/iar/templates.jsx
git commit -m "Tokenize catalog brand chrome to read ORG_SKIN."
```

---

### Task 4: Auth gate + org resolution

**Files:**
- Create: `core/auth-gate.jsx`
- Modify: `core/boot.jsx`
- Modify: `index.html`

**Interfaces:**
- Consumes: `getSupabase`, `buildOrgSkin`, `applyOrgTheme`
- Produces: `window.ORG_SKIN`, `window.ORG_MEMBERSHIP = { orgId, role }`; calls `bootEditor()` only after auth+org OK
- Legacy: if `window.SAAS_MODE !== true`, keep current boot (MARCA_FORCADA)

- [ ] **Step 1: Set SaaS mode in `index.html`**

Add before other app scripts:

```html
<script src="config.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="core/supabase-client.js"></script>
<script src="core/org-skin.js"></script>
<script>window.SAAS_MODE = true;</script>
```

Keep marca scripts (iar icons/templates/registry/manifest) as today. Remove hard dependency on always-on editor until auth passes — `#root` filled by auth-gate.

- [ ] **Step 2: Implement `core/auth-gate.jsx`**

Responsibilities:

1. `getSupabase().auth.getSession()`
2. If no session → render login form (`signInWithPassword` + optional `signUp` disabled; use magic link `signInWithOtp({ email })` as primary)
3. If session → `from('org_members').select('org_id, role, orgs(*)').eq('user_id', user.id)`
4. If zero rows → message “Sem organização. Pede convite ao admin.”
5. If rows → pick org: `localStorage.ed:orgActiva` if still in list, else `rows[0]`
6. `window.ORG_SKIN = buildOrgSkin(row.orgs)`; `applyOrgTheme(window.ORG_SKIN.theme)`; `window.ORG_MEMBERSHIP = { orgId, role }`
7. Call `window.startEditorAfterAuth()`

Also handle invite accept query `?invite=TOKEN`: look up invite is **not** possible for members via RLS — instead use a Supabase Edge Function later OR security definer RPC:

Add to migration in this task if missing:

```sql
create or replace function public.accept_invite(invite_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  inv public.invites%rowtype;
begin
  select * into inv from public.invites
  where token = invite_token and status = 'pending' and expires_at > now();
  if not found then raise exception 'invalid_invite'; end if;
  if lower(inv.email) <> lower(auth.jwt()->>'email') then raise exception 'email_mismatch'; end if;
  insert into public.org_members (org_id, user_id, role)
  values (inv.org_id, auth.uid(), 'member')
  on conflict do nothing;
  update public.invites set status = 'accepted' where id = inv.id;
  return inv.org_id;
end;
$$;
grant execute on function public.accept_invite(text) to authenticated;
```

Auth-gate on `?invite=` calls `supabase.rpc('accept_invite', { invite_token })` then reloads memberships.

- [ ] **Step 3: Wire `boot.jsx`**

```js
window.startEditorAfterAuth = function startEditorAfterAuth() {
  // existing bootEditor() body
};

function boot() {
  if (window.SAAS_MODE) {
    // auth-gate mounts itself and calls startEditorAfterAuth
    if (typeof window.mountAuthGate === 'function') window.mountAuthGate();
    return;
  }
  bootEditor();
}
```

- [ ] **Step 4: Manual test**

1. Copy `config.example.js` → `config.js` with real keys  
2. Serve locally, open index → login screen  
3. After seed superadmin membership → editor loads with skin  

- [ ] **Step 5: Commit**

```bash
git add index.html core/boot.jsx core/auth-gate.jsx supabase/migrations/001_saas_mvp.sql
git commit -m "Add SaaS auth gate and org resolution before editor boot."
```

---

### Task 5: Editor uses org-scoped state + skin in chrome

**Files:**
- Modify: `core/editor-app.jsx`

**Interfaces:**
- Consumes: `window.ORG_SKIN`, `window.ORG_MEMBERSHIP`, `window.SAAS_MODE`
- In SaaS mode: treat active marca as synthetic `church-v1` mapped to existing `window.MARCAS.iar` but override `name`/`handle` from skin; `loadMarcaState`/`saveMarcaState` use `ed:{orgId}:state`

- [ ] **Step 1: Add helpers at top of `editor-app.jsx`**

```js
function saasOrgId() {
  return window.SAAS_MODE ? window.ORG_MEMBERSHIP?.orgId : null;
}

function stateKey(marcaId) {
  const oid = saasOrgId();
  return oid ? `ed:${oid}:state` : `ed:${marcaId}:state`;
}
```

Update `loadMarcaState` / `saveMarcaState` to use `stateKey(marcaId)`.

- [ ] **Step 2: In SaaS mode hide marca selector; force `iar` catalog**

```js
const forced = window.SAAS_MODE ? 'iar' : window.MARCA_FORCADA;
```

After mount, if `ORG_SKIN`, set document title to `Editor — ${ORG_SKIN.name}`.

- [ ] **Step 3: Top bar brand text**

Where IAR brand is rendered, prefer `ORG_SKIN.name` / `ORG_SKIN.handle`.

- [ ] **Step 4: Manual verify isolation**

Two orgs A/B → switch users → localStorage keys differ → PNG shows respective logo/colors.

- [ ] **Step 5: Commit**

```bash
git add core/editor-app.jsx
git commit -m "Scope editor state and chrome to active org skin."
```

---

### Task 6: Admin app (superadmin)

**Files:**
- Create: `admin.html`
- Create: `core/admin-app.jsx`

**Interfaces:**
- Consumes: `getSupabase`, `is_superadmin` via attempting select on all orgs / RPC
- Produces: create/update org, upload logo to `org-logos/{org_id}/logo.png`, create invite rows, show invite URL `{origin}/index.html?invite={token}`

- [ ] **Step 1: Scaffold `admin.html`**

Load same config, supabase SDK, `supabase-client.js`, React, Babel, `admin-app.jsx`. No template catalog required.

- [ ] **Step 2: Implement admin UI**

Features (single page):

1. Require session; if not `is_superadmin` (check `org_members` for role) → deny  
2. List orgs from `orgs`  
3. Form create/edit: slug, name, handle, theme color inputs (6 hex fields), logo file input  
4. On save: upsert `orgs`; if file, `storage.from('org-logos').upload(`${id}/logo.png`, file, { upsert:true })` then update `logo_url` with public URL  
5. Invite form: email + org → insert `invites` → display link  

- [ ] **Step 3: Manual test**

Create org B, invite email, accept invite as second user, confirm skin B in editor.

- [ ] **Step 4: Commit**

```bash
git add admin.html core/admin-app.jsx
git commit -m "Add superadmin page for orgs, logos, and invites."
```

---

### Task 7: Docs, deploy checklist, legacy path

**Files:**
- Modify: `README.md`
- Modify: `CLAUDE.md` (short SaaS pointer)
- Keep: legacy `MARCA_FORCADA` path when `SAAS_MODE` false for local OFMJ/IAR without Supabase

- [ ] **Step 1: Document in README**

Sections:

- SaaS local: copy config, run SQL, seed superadmin, `python3 -m http.server 8080`, open `/index.html` and `/admin.html`
- Legacy local: set `window.SAAS_MODE = false` in index (or use a `index-legacy.html` copy) for offline IAR without auth

- [ ] **Step 2: GitHub Pages note**

Pages cannot ship secrets in public repo — `config.js` must be generated in CI as a secret artifact **or** use Supabase with anon key (anon key is public-by-design; RLS protects data). Commit anon key in `config.js` is acceptable if RLS is correct; never commit service role key.

- [ ] **Step 3: End-to-end checklist from spec**

Run all 6 verification bullets from the design spec; paste results in commit message body or leave as README “Verified” note.

- [ ] **Step 4: Commit + push when user asks**

```bash
git add README.md CLAUDE.md
git commit -m "Document SaaS MVP setup and legacy offline mode."
```

---

## Spec coverage check

| Spec requirement | Task |
|------------------|------|
| Supabase Auth + orgs/members/invites | 1, 4 |
| Storage logos | 1, 6 |
| RLS | 1 |
| ORG_SKIN + CSS vars | 2, 4, 5 |
| Tokenize PostHead/logo/handle | 3 |
| localStorage per org | 5 |
| Admin CRUD + invite | 6 |
| Superadmin-only org creation | 6 |
| church-v1 catalog / IAR templates | 3–5 (reuse marcas/iar) |
| OFMJ out of SaaS | 4 (SAAS_MODE loads only iar) |
| Free tier / Pages hosting | 7 |
| Error states (no auth, no membership, bad invite) | 4 |
| accept invite RPC | 4 |

## Placeholder scan

None intentional. Operator-manual steps (create Supabase project, seed UUID) are explicit SQL, not TBD.
