# Local Supabase Dev Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ambiente de desenvolvimento local com Supabase CLI/Docker, Postgres, Auth e Storage; auto-login sem magic link; produção (Pages + cloud) inalterada.

**Architecture:** `supabase start` levanta stack local idêntica ao cloud. `config.local.js` + `LOCAL_DEV=true` activam auto `signInWithPassword` no auth-gate. Migrations existentes + `seed.sql` populam user dev e orgs. `./dev.sh` orquestra stack + HTTP server em `127.0.0.1:8080`.

**Tech Stack:** Supabase CLI, Docker, Postgres local, supabase-js (existente), Python `http.server`, React UMD (existente).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-07-local-supabase-dev-design.md`
- Branch: `develop` (não alterar fluxo Pages/`main` sem merge explícito)
- Host dev fixo: `http://127.0.0.1:8080` (nunca misturar com `localhost`)
- Dev user: `dev@local.test` / `dev123`, superadmin em todas orgs seed
- `LOCAL_DEV=true` → nunca chamar `signInWithOtp`
- `config.local.js` gitignored; `config.js` continua cloud
- JWT real (RLS activo) — não injectar `ORG_MEMBERSHIP` fake
- Ports Supabase default: API `54321`, DB `54322`, Studio `54323`

## File map

| Path | Responsibility |
|------|----------------|
| `supabase/config.toml` | Auth dev (sem confirm email), site URL local |
| `supabase/seed.sql` | User dev + orgs + memberships |
| `core/config-loader.js` | Carrega `config.local.js` ou fallback `config.js` |
| `config.local.example.js` | Template LOCAL_DEV + DEV_AUTH + keys locais |
| `core/auth-gate.jsx` | Auto-login LOCAL_DEV |
| `core/admin-app.jsx` | Auto-login LOCAL_DEV (mesmo padrão) |
| `dev.sh` / `dev-stop.sh` | Orquestração local |
| `index.html`, `admin.html`, `marcas/iar/canvas.html` | Usar config-loader |
| `.gitignore` | `config.local.js` |
| `README.md` | Secção Dev local |

---

### Task 1: Supabase CLI scaffold + config.toml

**Files:**
- Create: `supabase/config.toml` (via `supabase init` + edits)
- Modify: `.gitignore`

**Interfaces:**
- Produces: local Supabase project linked to existing `supabase/migrations/`

- [ ] **Step 1: Init Supabase (se ainda não existir config.toml)**

Run from repo root:

```bash
supabase init
```

Expected: `supabase/config.toml` created; existing `supabase/migrations/` preserved.

- [ ] **Step 2: Edit `supabase/config.toml` — auth + site URL**

In `[auth]` section set:

```toml
site_url = "http://127.0.0.1:8080"
additional_redirect_urls = ["http://127.0.0.1:8080/**"]
enable_signup = true
```

In `[auth.email]` disable confirm for dev:

```toml
enable_confirmations = false
```

- [ ] **Step 3: Update `.gitignore`**

Append:

```
config.local.js
.supabase/
```

- [ ] **Step 4: Verify stack starts**

```bash
supabase start
supabase status
```

Expected: API URL `http://127.0.0.1:54321`, anon key printed.

- [ ] **Step 5: Commit**

```bash
git add supabase/config.toml .gitignore
git commit -m "Add Supabase local config for dev stack."
```

---

### Task 2: Seed SQL (dev user + orgs)

**Files:**
- Create: `supabase/seed.sql`

**Interfaces:**
- Consumes: migration `001_saas_mvp.sql` (tables `orgs`, `org_members`)
- Produces: auth user UUID fixo `a0000000-0000-4000-8000-000000000001`; orgs `iar` + `igreja-teste`

- [ ] **Step 1: Write `supabase/seed.sql`**

```sql
-- Dev user: dev@local.test / dev123
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) VALUES (
  'a0000000-0000-4000-8000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'dev@local.test',
  crypt('dev123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  'a0000000-0000-4000-8000-000000000002',
  'a0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  '{"sub":"a0000000-0000-4000-8000-000000000001","email":"dev@local.test"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT DO NOTHING;

INSERT INTO public.orgs (id, slug, name, handle) VALUES
  ('b0000000-0000-4000-8000-000000000001', 'iar', 'Igreja Anglicana Rio', '@igrejaanglicanario'),
  ('b0000000-0000-4000-8000-000000000002', 'igreja-teste', 'Igreja Anglicana Teste', '@igreja.teste')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.org_members (org_id, user_id, role) VALUES
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'superadmin'),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'superadmin')
ON CONFLICT DO NOTHING;
```

- [ ] **Step 2: Apply reset**

```bash
supabase db reset
```

Expected: no errors; `select email from auth.users` shows `dev@local.test`.

- [ ] **Step 3: Smoke test auth**

```bash
curl -s 'http://127.0.0.1:54321/auth/v1/token?grant_type=password' \
  -H "apikey: $(supabase status -o env | grep ANON_KEY | cut -d= -f2)" \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@local.test","password":"dev123"}' | head -c 200
```

Expected: JSON with `access_token`.

- [ ] **Step 4: Commit**

```bash
git add supabase/seed.sql
git commit -m "Add local dev seed with superadmin user and orgs."
```

---

### Task 3: Config loader + config.local.example

**Files:**
- Create: `core/config-loader.js`
- Create: `config.local.example.js`
- Modify: `index.html`, `admin.html`, `marcas/iar/canvas.html`

**Interfaces:**
- Produces: `window.LOCAL_DEV`, `window.SUPABASE_URL`, `window.SUPABASE_ANON_KEY`, `window.DEV_AUTH` (when local)

- [ ] **Step 1: Write `core/config-loader.js`**

```javascript
(function () {
  const LOCAL = 'config.local.js';
  const CLOUD = 'config.js';

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve(src);
      s.onerror = () => reject(new Error('Failed to load ' + src));
      document.head.appendChild(s);
    });
  }

  window.loadAppConfig = async function loadAppConfig() {
    try {
      const r = await fetch(LOCAL, { method: 'HEAD', cache: 'no-store' });
      if (r.ok) return loadScript(LOCAL);
    } catch {}
    return loadScript(CLOUD);
  };
})();
```

- [ ] **Step 2: Write `config.local.example.js`**

```javascript
// Copy to config.local.js (gitignored). Keys from: supabase status
window.LOCAL_DEV = true;
window.SUPABASE_URL = 'http://127.0.0.1:54321';
window.SUPABASE_ANON_KEY = 'YOUR_LOCAL_ANON_KEY';
window.DEV_AUTH = { email: 'dev@local.test', password: 'dev123' };
```

- [ ] **Step 3: Update `index.html` — async config load**

Replace synchronous `<script src="config.js">` with loader before supabase scripts:

```html
<script src="core/config-loader.js"></script>
<script>
  loadAppConfig().then(function () {
    var s = [
      'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
      'core/supabase-client.js',
      'core/org-skin.js',
      'core/auth-login-hints.js'
    ];
    var i = 0;
    function next() {
      if (i >= s.length) {
        var tags = document.querySelectorAll('script[data-after-config]');
        tags.forEach(function (el) {
          var n = document.createElement('script');
          n.type = el.getAttribute('data-type') || 'text/javascript';
          if (n.type === 'text/babel') n.src = el.getAttribute('data-src');
          else n.src = el.getAttribute('data-src');
          document.body.appendChild(n);
        });
        return;
      }
      var el = document.createElement('script');
      el.src = s[i++];
      el.onload = next;
      el.onerror = next;
      document.head.appendChild(el);
    }
    next();
  });
</script>
```

**Simpler alternative (preferred):** keep existing script order but block boot with inline defer:

```html
<script src="core/config-loader.js"></script>
<script>
  window.__configReady = loadAppConfig();
</script>
```

Then in `core/boot.jsx` first line of `boot()`: `await window.__configReady` (wrap boot in async IIFE).

Apply the **simpler alternative** — modify `core/boot.jsx`:

```javascript
async function boot() {
  if (window.__configReady) await window.__configReady;
  if (window.SAAS_MODE) {
    if (typeof window.mountAuthGate === 'function') window.mountAuthGate();
    return;
  }
  bootEditor();
}
boot();
```

And replace `<script src="config.js">` with:

```html
<script src="core/config-loader.js"></script>
<script>window.__configReady = loadAppConfig();</script>
```

Repeat pattern in `admin.html` (admin boot is inline in admin-app.jsx — add await at top of AdminApp useEffect or small boot wrapper).

For `canvas.html`: same config-loader + `__configReady` before auth-gate.

- [ ] **Step 4: Manual smoke — config loads**

Copy example, fill anon key from `supabase status`, open `index.html` via server — console shows no 404 on config.

- [ ] **Step 5: Commit**

```bash
git add core/config-loader.js config.local.example.js index.html admin.html marcas/iar/canvas.html core/boot.jsx
git commit -m "Add config loader for local vs cloud Supabase."
```

---

### Task 4: LOCAL_DEV auto-login (auth-gate + admin)

**Files:**
- Modify: `core/auth-gate.jsx`
- Modify: `core/admin-app.jsx`

**Interfaces:**
- Consumes: `window.LOCAL_DEV`, `window.DEV_AUTH`, `window.getSupabase()`
- Produces: sessão Supabase real; `activateOrg()` via fluxo existente

- [ ] **Step 1: Add `devAutoLogin` helper in auth-gate**

At top of IIFE in `core/auth-gate.jsx`:

```javascript
async function devAutoLogin(supabase) {
  if (!window.LOCAL_DEV || !window.DEV_AUTH) return null;
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData?.session) return sessionData.session;
  const { email, password } = window.DEV_AUTH;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error('Dev login falhou: ' + error.message + ' — corre supabase db reset');
  return data.session;
}
```

- [ ] **Step 2: Use in AuthGate before onAuthStateChange wait**

In `useEffect` after `getSupabase()`:

```javascript
(async () => {
  try {
    await devAutoLogin(supabase);
  } catch (err) {
    setState({ phase: 'error', message: err.message });
    return;
  }
  // existing onAuthStateChange subscription...
})();
```

- [ ] **Step 3: Guard LoginForm — skip OTP UI hint in LOCAL_DEV**

In `LoginForm`, if `window.LOCAL_DEV` return early with message "Dev mode: recarrega — auto-login activo" (should not render if auto-login works).

- [ ] **Step 4: Mirror in admin-app.jsx**

Extract shared helper to `core/dev-auth.js` (preferred DRY):

```javascript
(function () {
  window.devAutoLogin = async function (supabase) {
    if (!window.LOCAL_DEV || !window.DEV_AUTH) return null;
    const { data: s } = await supabase.auth.getSession();
    if (s?.session) return s.session;
    const { email, password } = window.DEV_AUTH;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error('Dev login falhou: ' + error.message);
    return data.session;
  };
})();
```

Load `core/dev-auth.js` after config, before auth-gate. Use in both auth-gate and admin-app.

- [ ] **Step 5: Manual test**

With `config.local.js` + stack running: open `index.html` → editor loads without login screen.

- [ ] **Step 6: Commit**

```bash
git add core/dev-auth.js core/auth-gate.jsx core/admin-app.jsx index.html admin.html
git commit -m "Auto-login with password when LOCAL_DEV is enabled."
```

---

### Task 5: dev.sh + dev-stop.sh + README

**Files:**
- Create: `dev.sh`
- Create: `dev-stop.sh`
- Modify: `README.md`, `CLAUDE.md`

- [ ] **Step 1: Write `dev.sh`**

```bash
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if ! docker info >/dev/null 2>&1; then
  echo "Docker não está a correr. Abre Docker Desktop."
  exit 1
fi

if ! command -v supabase >/dev/null; then
  echo "Instala Supabase CLI: brew install supabase/tap/supabase"
  exit 1
fi

supabase start

if [[ ! -f config.local.js ]]; then
  echo "Criando config.local.js a partir do example..."
  cp config.local.example.js config.local.js
  ANON=$(supabase status -o json 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin)['ANON_KEY'])" 2>/dev/null || supabase status | awk '/anon key/ {print $NF}')
  echo "Preenche SUPABASE_ANON_KEY em config.local.js: $ANON"
fi

echo "Editor: http://127.0.0.1:8080/index.html"
echo "Admin:  http://127.0.0.1:8080/admin.html"
echo "Studio: http://127.0.0.1:54323"
python3 -m http.server 8080 --bind 127.0.0.1
```

```bash
chmod +x dev.sh
```

- [ ] **Step 2: Write `dev-stop.sh`**

```bash
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
pkill -f "python3 -m http.server 8080" 2>/dev/null || true
supabase stop
echo "Dev stack parado."
```

```bash
chmod +x dev-stop.sh
```

- [ ] **Step 3: README § Dev local**

Add section after "Setup local":

- Pré-requisitos: Docker, Supabase CLI
- `./dev.sh` — sobe tudo
- `./dev-stop.sh` — para
- `supabase db reset` — repõe seed
- Credenciais: `dev@local.test` / `dev123`
- Usar sempre `127.0.0.1:8080`

- [ ] **Step 4: Run checklist from spec**

1. `./dev.sh` → editor sem magic link
2. Org switcher funciona
3. Admin CRUD + logo
4. Convite link correcto
5. Canvas org activa

- [ ] **Step 5: Commit**

```bash
git add dev.sh dev-stop.sh README.md CLAUDE.md
git commit -m "Add dev scripts and document local Supabase workflow."
```

---

## Spec coverage (self-review)

| Spec requirement | Task |
|------------------|------|
| Supabase CLI + Docker | Task 1 |
| seed dev user + orgs | Task 2 |
| config.local.js + loader | Task 3 |
| LOCAL_DEV auto-login | Task 4 |
| dev.sh / dev-stop.sh | Task 5 |
| Auth gate never OTP in LOCAL_DEV | Task 4 |
| 127.0.0.1 host | Tasks 1, 5 |
| Production unchanged | Tasks 3–4 (cloud config fallback) |
| Checklist manual | Task 5 step 4 |
| develop branch | all commits on `develop` |

No placeholders found. Types consistent (`devAutoLogin`, `loadAppConfig`, `DEV_AUTH`).
