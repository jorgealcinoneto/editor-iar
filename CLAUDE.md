# CLAUDE.md — editor-iar

> Guia para agentes e humanos que trabalham neste repositório.  
> Prioridade sobre docs em pastas legadas (`PASTOR/`, `PRODUTOR-CONTEUDO/`) quando o trabalho é aqui.

Hub form-based multi-org (SaaS): **org** → template IAR → campos → preview → PNG.  
Stack: HTML estático + React 18 UMD + Babel standalone + Supabase (Auth, Postgres, Storage, RLS). Sem bundler.

---

## Modos de execução

| Modo | Como | Auth | Marcas |
|------|------|------|--------|
| **SaaS (default)** | `index.html` com `SAAS_MODE = true` | Magic link (cloud) ou auto-login (`LOCAL_DEV`) | Só IAR / catálogo `church-v1`, skin por org |
| **Legado offline** | `SAAS_MODE = false` + `MARCA_FORCADA` | Nenhuma | Código ainda tem ramos OFMJ; pasta `marcas/ofmj/` **não está no repo** |

- **`admin.html`:** só `role = superadmin` — CRUD orgs, logo, tema, fontes, convites, galeria.
- **Produção Pages:** tipicamente `https://jorgealcinoneto.github.io/editor-iar/` + project Supabase cloud (`ftcefxhnadnxhqvuamqu`).
- **Nunca** commitar service role key. Anon key é pública (RLS protege).

---

## Arranque rápido

```bash
# Dev local (Docker + Supabase CLI)
./dev.sh                 # supabase start + HTTP 127.0.0.1:8080
./dev-stop.sh            # para HTTP + supabase stop

# Após db reset: assets da org Refúgio
node scripts/seed-org-refugio.mjs --local

# Cloud / Pages (com config.js)
python3 -m http.server 8080 --bind 127.0.0.1
```

| URL | Uso |
|-----|-----|
| `http://127.0.0.1:8080/index.html` | Editor (sempre `127.0.0.1`, não `localhost` — Auth redirect) |
| `http://127.0.0.1:8080/admin.html` | Admin |
| `http://127.0.0.1:54323` | Studio local |

**Seed local** (`npx supabase db reset`): user `dev@local.test` / `dev123`, superadmin nas orgs `iar`, `igreja-teste`, `refugio`.

---

## Config

| Ficheiro | Git | Conteúdo |
|----------|-----|----------|
| `config.example.js` | sim | Template cloud |
| `config.js` | **ignorado** | `SUPABASE_URL`, `SUPABASE_ANON_KEY` (cloud/Pages) |
| `config.local.example.js` | sim | Template local + `LOCAL_DEV` + `DEV_AUTH` |
| `config.local.js` | **ignorado** | Criado por `./dev.sh` |

`core/config-loader.js`: em **localhost/127.0.0.1** tenta `config.local.js`; senão `config.js` (evita 404 de `config.local.js` em produção).

Magic link (cloud): Auth → URL Configuration — Site URL + Redirect URLs (`http://127.0.0.1:8080/**`, origem Pages).

---

## Arquitectura SaaS (fluxo)

```
index.html (SAAS_MODE)
  → config-loader → getSupabase()
  → boot.jsx → mountAuthGate (auth-gate.jsx)
      → [LOCAL_DEV] devAutoLogin | [cloud] magic link
      → ?invite= → RPC accept_invite
      → org_members → activateOrg (ORG_SKIN, ORG_MEMBERSHIP)
      → loadOrgGallery → evento ed:gallery-loaded
  → startEditorAfterAuth → editor-app.jsx (marca church-v1 / IAR)
```

**Globals importantes:** `window.SAAS_MODE`, `ORG_SKIN`, `ORG_MEMBERSHIP`, `ORG_MEMBERSHIPS`, `ORG_GALLERY`, `MARCAS`, `IAR_TEMPLATES`.

**Eventos:** `ed:org-change`, `ed:gallery-loaded`.

---

## Estrutura do repositório

### Entradas

| Path | Função |
|------|--------|
| `index.html` | Editor SaaS; `MARCA_FORCADA='iar'`; scripts Babel das marcas/core |
| `admin.html` | Painel superadmin |
| `dev.sh` / `dev-stop.sh` | Orquestra stack local |
| `package.json` | `@supabase/supabase-js` (seed), Playwright (e2e); quase sem scripts npm |
| `.nojekyll` | GitHub Pages sem Jekyll |

Scripts `build.sh` / `publicar.sh` / `start-editor.sh` aparecem em docs antigas — **não estão no tree actual**. Deploy SaaS = push estático + `config.js` no Pages.

### `core/` — runtime partilhado

| Ficheiro | Função |
|----------|--------|
| `boot.jsx` | Boot SaaS vs legado; espera deps Babel |
| `auth-gate.jsx` | Login, convites, resolve org, chama `loadOrgGallery` |
| `editor-app.jsx` | UI editor: templates, form, stage, export, switcher de org, galeria |
| `admin-app.jsx` | Orgs, logo (`org-logos`), theme/fontes, convites, CRUD galeria |
| `form-fields.jsx` | Campos (text/rich/textarea/number/select/icon/slider/swatch/photo/image) |
| `editor-styles.css` | UI `ed-*`; `.ed-bar--iar` usa `var(--marinho\|--papel\|--estola)` (tema da org) |
| `supabase-client.js` | Singleton `getSupabase()` |
| `org-skin.js` | `buildOrgSkin`, `activateOrg`, `applyOrgTheme`, `loadOrgFonts`, `isSuperadmin` |
| `org-gallery.js` | `loadOrgGallery`, `uploadOrgAsset`, `deleteOrgAsset` |
| `config-loader.js` | Escolhe config local vs cloud |
| `dev-auth.js` | Auto `signInWithPassword` em `LOCAL_DEV` |
| `auth-login-hints.js` | Hints rate-limit SMTP |
| `app-path.js` | Paths relativos (Pages / canvas) |
| `org-skin.test.mjs` | Testes Node de skin |
| `canvas/design-canvas.jsx` | Canvas panorâmico (pan, slides, export) |
| `canvas/tweaks-panel.jsx` | Tweaks do canvas |

### `marcas/iar/` — único catálogo no disco

| Ficheiro | Função |
|----------|--------|
| `manifest.js` | `window.MARCAS.iar` — `exportPixelRatio: 1`, galleries meta |
| `registry.jsx` | `IAR_TEMPLATES` (**22** templates) + `IAR_GALLERIES` (legado; **escondido no SaaS**) |
| `templates.jsx` | Componentes dos posts; lê `ORG_SKIN` (logo, nome, handle, cores) |
| `icons.jsx` | `window.IARIcons` |
| `styles.css` | Vars litúrgicas default (`--marinho`, `--estola`, …); override por org |
| `assets/` | Imagens preset IAR (logo, fotos, QR, …) |
| `canvas.html` | Canvas IAR + auth SaaS |

**Templates (ids):** `cover-type`, `cover-photo`, `cover-icon`, `body-num`, `body-icon`, `close-cta`, `verse`, `community`, `campaign`, `mito-cover`, `mito-verdict`, `mito-arg`, `mito-cta`, `event`, `event-v2`, `story-verse`, `story-event`, `story-quote`, `lectionary`, `story-spotify`, `capa-spotify`, `banner-youtube`.

**`marcas/ofmj/`:** ausente no repo; ramos em `boot.jsx` / `editor-app` são legado — não assumir ficheiros OFMJ.

### `supabase/`

| Path | Função |
|------|--------|
| `config.toml` | Portas locais (API 54321, Studio 54323), seed, Auth `site_url` |
| `seed.sql` | Dev user + orgs `iar`, `igreja-teste`, `refugio` |
| `seed-assets/refugio/` | PNGs + `manifest.json` para o script de seed |
| `migrations/001_saas_mvp.sql` | `orgs`, `org_members`, `invites`, RLS, `accept_invite`, bucket `org-logos` |
| `migrations/002_api_grants.sql` | GRANTs PostgREST |
| `migrations/003_org_assets.sql` | `org_assets`, bucket `org-assets` |
| `migrations/004_org_assets_member_upload.sql` | Member upload `kind=upload`; gallery só superadmin |

**Tabela `orgs` (campos-chave):** `slug`, `name`, `handle`, `logo_url`, `catalog_id` (default `church-v1`), `theme` jsonb.

**Theme JSON (keys):** `paper`, `ink`, `marinho`, `accent`, `accentSoft`, `ambar`, `fontHeading`, `fontBody` → CSS vars em `org-skin.js` (`--papel`, `--grafite`, `--marinho`, `--estola`, …).

**Roles:** `superadmin` | `member`. Storage: `org-logos` (logo), `org-assets` (`{orgId}/{kind}/{uuid}.ext`).

### `scripts/`

| Script | Função |
|--------|--------|
| `seed-org-refugio.mjs` | Upsert org Refúgio + logo/galeria (`--local` auto-detecta service role; cloud precisa `SUPABASE_SERVICE_ROLE_KEY`) |
| `e2e-local-checklist.py` | Checklist API local (Auth, orgs, RLS, assets) |
| `e2e-browser.mjs` | Smoke Playwright no editor |

### `docs/superpowers/`

Specs/plans (design → implementação):

| Tema | Spec / Plan |
|------|-------------|
| White-label SaaS MVP | `2026-08-04-white-label-saas-mvp*` |
| Integração anglicana-rio | `2026-08-04-anglicana-rio-integration-design.md` |
| Dev local Supabase | `2026-08-07-local-supabase-dev*` |
| Isolamento assets por org | `2026-08-07-org-asset-isolation*` |
| Org Comunidade Anglicana Refúgio | `2026-08-07-org-comunidade-anglicana-refugio*` |

---

## Estado (`localStorage`)

| Chave | Uso |
|-------|-----|
| `ed:orgActiva` | UUID da org activa (SaaS) |
| `ed:{orgId}:state` | Conteúdo/tweaks do editor por org |
| `ed:marcaActiva` | Marca activa (legado) |
| `ed:iar:state` / `ed:ofmj:state` | Estado por marca (legado) |

---

## Orgs de referência

| Slug | Nome | Notas |
|------|------|-------|
| `iar` | Igreja Anglicana Rio | Tema azul-marinho default |
| `igreja-teste` | Igreja Anglicana Teste | Org de teste |
| `refugio` | Comunidade Anglicana Refúgio | Tema sage/oliva (`#A7CF9A` / `#4A5B45` / creme `#F5F1E4`); assets em `seed-assets/refugio/` |

No SaaS a galeria do editor mostra **só** `ORG_GALLERY` (não o catálogo IAR partilhado).

---

## Convenções de UI / código

- Prefixo CSS editor: `ed-*` (`ed-bar`, `ed-sidebar`, `ed-stage`, `ed-btn`, …).
- Skin de marca/post: `.marca-iar` + vars `--marinho`, `--estola`, `--papel`, …
- Export IAR: `pixelRatio: 1` (`manifest.js`).
- Sem imports de módulos ES no browser para JSX de marca — scripts Babel globais em `window.*`.
- Imports JS “core” em IIFE que escrevem em `window` (sem bundler).
- Commits: mensagem curta; não commitar `config.js`, `config.local.js`, `node_modules/`.

---

## Checklist agente (antes de mudar coisas)

1. **SaaS vs legado** — a maior parte do trabalho actual é SaaS; não reintroduzir catálogo IAR global na galeria SaaS.
2. **Isolamento por org** — galeria, logo, theme, state key `ed:{orgId}:state`.
3. **Ordem activateOrg / loadOrgGallery** — não limpar `ORG_GALLERY` em `activateOrg` depois do load; React deve ouvir `ed:gallery-loaded`.
4. **Migrations** — qualquer tabela nova em `public` precisa GRANT + RLS (lição `002`).
5. **Storage** — gallery write = superadmin; upload de campo = member + `kind=upload`.
6. **Testes locais** — `./dev.sh` ou `db reset` + `node scripts/seed-org-refugio.mjs --local`; E2E: `python3 scripts/e2e-local-checklist.py`, `node scripts/e2e-browser.mjs`.
7. **Cloud via MCP** — `execute_sql` ok para rows; **não há** upload Storage no MCP (usar script + service role ou URLs públicas).

---

## Referências rápidas

- README: setup cloud, magic link, publicar, checklist E2E manual.
- Specs em `docs/superpowers/specs/` — fonte de verdade de produto recentes.
- `.gitignore`: `config.js`, `config.local.js`, `node_modules/`, `graphify-out/`, artefatos `anglicana-rio*`.
