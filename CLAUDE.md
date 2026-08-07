# CLAUDE.md — editor-iar

> Guia para agentes e humanos que trabalham neste repositório.  
> Prioridade sobre docs em pastas legadas (`PASTOR/`, `PRODUTOR-CONTEUDO/`) quando o trabalho é aqui.

Hub form-based multi-org (SaaS): **org** → `catalog_id` → marca (`window.MARCAS`) → template → campos → preview → PNG.  
Stack: HTML estático + React 18 UMD + Babel standalone + Supabase (Auth, Postgres, Storage, RLS). Sem bundler.

---

## Modos de execução

| Modo | Como | Auth | Marcas |
|------|------|------|--------|
| **SaaS (default)** | `index.html` com `SAAS_MODE = true` | Magic link (cloud) ou auto-login (`LOCAL_DEV`) | Catálogo por org (`church-v1` → IAR, `reconciliador-v1` → Reconciliador); skin/tema por org |
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

# Após db reset: assets das orgs (logo + galeria não vêm no seed.sql)
node scripts/seed-org.mjs reconciliador --local
node scripts/seed-org-refugio.mjs --local

# Cloud / Pages (com config.js)
python3 -m http.server 8080 --bind 127.0.0.1
```

| URL | Uso |
|-----|-----|
| `http://127.0.0.1:8080/index.html` | Editor (sempre `127.0.0.1`, não `localhost` — Auth redirect) |
| `http://127.0.0.1:8080/admin.html` | Admin |
| `http://127.0.0.1:54323` | Studio local |

**Seed local** (`npx supabase db reset`): user `dev@local.test` / `dev123`, superadmin nas orgs `iar`, `igreja-teste`, `refugio`, `reconciliador`.

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
  → startEditorAfterAuth → editor-app.jsx (marca via marcaIdForCatalog(ORG_SKIN.catalogId))
```

**Globals importantes:** `window.SAAS_MODE`, `ORG_SKIN`, `ORG_MEMBERSHIP`, `ORG_MEMBERSHIPS`, `ORG_GALLERY`, `MARCAS`, `IAR_TEMPLATES`, `RECONCILIADOR_TEMPLATES`, `RECON_TPL`, `marcaIdForCatalog`.

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

### `marcas/` — catálogos

Duas marcas no disco: `iar` e `reconciliador`. A org escolhe qual, via `orgs.catalog_id`
(ver "Selecção de catálogo" abaixo). Ambas as folhas de CSS estão no `index.html`;
`applyMarcaStyles` alterna `disabled` para que **só uma esteja activa** — os tokens de
`:root` e as regras `.post`/`.t-*` não são scoped e colidiriam.

### `marcas/iar/`

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

### `marcas/reconciliador/` — Igreja Anglicana do Reconciliador

| Ficheiro | Função |
|----------|--------|
| `manifest.js` | `window.MARCAS.reconciliador` — `catalogId: 'reconciliador-v1'`, `allowTweaks: false`, `hasCanvas: false` |
| `registry.jsx` | `RECONCILIADOR_TEMPLATES` (**14**) + `RECONCILIADOR_GALLERIES` |
| `templates.jsx` | Componentes dos posts; lê `ORG_SKIN` (nome, handle) |
| `icons.jsx` | `window.ReconciliadorIcons` (15 ícones; `IconSelo` é a marca nos posts) |
| `styles.css` | Tokens navy/gold **aliasados** sobre os que `applyOrgTheme` escreve |
| `assets/` | Logo símbolo + 4 fotos da comunidade (defaults dos templates) |

**Templates (ids):** `cover-type`, `cover-photo`, `cover-icon`, `body-num`, `body-icon`, `close-cta`, `verse`, `community`, `campaign`, `event`, `story-verse`, `story-event`, `story-quote`, `lectionary`.

**Duas armadilhas resolvidas — não desfazer:**

1. **`templates.jsx` e `registry.jsx` estão em IIFE**, exportando `window.RECON_TPL` /
   `window.RECONCILIADOR_TEMPLATES`. O IAR declara `Post`, `TplCoverType`, … como
   funções soltas que viram `window.*`, e `marcas/iar/registry.jsx` lê-as de volta de
   `window`. Sem o IIFE, o Reconciliador clobberava o IAR (a ordem dos scripts Babel
   não é garantida).
2. **Sem raster nos posts:** os logos são JPG com fundo chapado (sem transparência), por
   isso os posts usam o SVG `IconSelo`, recolorido por `currentColor`. O raster serve só
   para `orgs.logo_url` (chrome do admin/editor).

**Fontes:** Cinzel (`theme.fontHeading`, carregada por `loadOrgFonts`) + Cinzel Decorative
(`--font-script`; **estática 400/700/900**, rebentaria o `wght@400;500;600;700` que o
`loadOrgFonts` pede — por isso vem do `<link>` fixo do `index.html`).

### Selecção de catálogo (`catalog_id`)

```
orgs.catalog_id → ORG_SKIN.catalogId → marcaIdForCatalog() → window.MARCAS[marcaId]
   'church-v1'                                                 iar          (22 templates)
   'reconciliador-v1'                                          reconciliador (14 templates)
```

`marcaIdForCatalog` vive em `core/org-skin.js` e varre `window.MARCAS` à procura do
`catalogId`; **fallback `'iar'`** para catálogo desconhecido/ausente, portanto orgs antigas
não quebram. Consumido em `core/boot.jsx` (`editorDepsReady`) e `core/editor-app.jsx`
(`forced`, recalculado a cada troca de org).

**Para acrescentar uma marca nova:** `marcas/<id>/{icons,templates,registry,manifest,styles.css}`
(templates/registry em IIFE) + no `index.html` um `<link id="marca-css-<id>" … disabled>` e os
4 `<script>` + o `manifest.js` no `admin.html`. Nada em `editor-app.jsx`/`boot.jsx` precisa de
mudar — tudo é derivado de `window.MARCAS`.

Chaves de manifest que o core lê: `catalogId`, `previewShell` (`'post'` | `'ofmj'`),
`hasCanvas`, `logoIcon` (getter), `barTheme`, `exportFilePrefix`, `exportBg`, `cssClass`.

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

**Tabela `orgs` (campos-chave):** `slug`, `name`, `handle`, `logo_url`, `catalog_id` (default `church-v1` — **escolhe o catálogo de templates em runtime**, ver acima), `theme` jsonb.

**Theme JSON (keys):** `paper`, `ink`, `marinho`, `accent`, `accentSoft`, `ambar`, `fontHeading`, `fontBody` → CSS vars em `org-skin.js` (`--papel`, `--grafite`, `--marinho`, `--estola`, …).

**Roles:** `superadmin` | `member`. Storage: `org-logos` (logo), `org-assets` (`{orgId}/{kind}/{uuid}.ext`).

### `scripts/`

| Script | Função |
|--------|--------|
| `seed-org.mjs` | **Genérico:** `node scripts/seed-org.mjs <slug> [--local]`. Lê tudo (name, handle, catalogId, theme, ficheiros) de `supabase/seed-assets/<slug>/manifest.json` |
| `seed-org-refugio.mjs` | Versão antiga só para o Refúgio (`--local` auto-detecta service role; cloud precisa `SUPABASE_SERVICE_ROLE_KEY`). Substituível por `seed-org.mjs refugio` quando o manifest do Refúgio ganhar name/handle/theme |
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
| `reconciliador` | Igreja Anglicana do Reconciliador | **Único com `catalog_id = 'reconciliador-v1'`** → catálogo `marcas/reconciliador/` (14 templates). Navy `#1F2B45` / gold `#B6956A` / papel `#F7F5F1`, Cinzel. Taguatinga Sul DF; assets em `seed-assets/reconciliador/` |

No SaaS a galeria do editor mostra **só** `ORG_GALLERY` (não o catálogo IAR partilhado).

---

## Convenções de UI / código

- Prefixo CSS editor: `ed-*` (`ed-bar`, `ed-sidebar`, `ed-stage`, `ed-btn`, …).
- Skin de marca/post: `.marca-iar` + vars `--marinho`, `--estola`, `--papel`, …
- Export IAR: `pixelRatio: 1` (`manifest.js`).
- Sem imports de módulos ES no browser para JSX de marca — scripts Babel globais em `window.*`.
- Imports JS “core” em IIFE que escrevem em `window` (sem bundler).
- **JSX de marca nova em IIFE**, exportando um único objecto em `window` (ex.: `RECON_TPL`).
  O `@babel/standalone` usa os presets `["react","env"]`, portanto `const` de topo vira `var`
  global — nomes soltos iguais entre marcas sobrescrevem-se em silêncio.
- Commits: mensagem curta; não commitar `config.js`, `config.local.js`, `node_modules/`.

---

## Checklist agente (antes de mudar coisas)

1. **SaaS vs legado** — a maior parte do trabalho actual é SaaS; não reintroduzir catálogo IAR global na galeria SaaS.
2. **Isolamento por org** — galeria, logo, theme, state key `ed:{orgId}:state`.
3. **Ordem activateOrg / loadOrgGallery** — não limpar `ORG_GALLERY` em `activateOrg` depois do load; React deve ouvir `ed:gallery-loaded`.
4. **Migrations** — qualquer tabela nova em `public` precisa GRANT + RLS (lição `002`).
5. **Storage** — gallery write = superadmin; upload de campo = member + `kind=upload`.
6. **Testes locais** — `./dev.sh` ou `db reset` + os seeds de assets; E2E: `node core/org-skin.test.mjs`, `python3 scripts/e2e-local-checklist.py`, `node scripts/e2e-browser.mjs` (este precisa de `npx playwright install chromium` uma vez).
7. **Cloud via MCP** — `execute_sql` ok para rows; **não há** upload Storage no MCP (usar script + service role ou URLs públicas).
8. **Mexer numa marca?** Testar **as duas orgs** — IAR (22 templates) e Reconciliador (14). O erro fácil é uma marca clobberar globais da outra; só se vê ao trocar de org.
9. **Export PNG** — não se verifica no browser embutido do agente (o inlining de fontes do `html-to-image` pendura lá). Usar Playwright headless.

---

## Referências rápidas

- README: setup cloud, magic link, publicar, checklist E2E manual.
- Specs em `docs/superpowers/specs/` — fonte de verdade de produto recentes.
- `.gitignore`: `config.js`, `config.local.js`, `node_modules/`, `graphify-out/`, artefatos `anglicana-rio*`.
