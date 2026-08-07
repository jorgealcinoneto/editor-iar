# Dev local — Supabase + auth bypass

**Data:** 2026-08-07  
**Estado:** Aprovado (brainstorming)  
**Branch:** `develop`  
**Escopo:** Ambiente de desenvolvimento local com Supabase CLI/Docker, Postgres, Auth e Storage; auto-login sem magic link; produção inalterada

## Contexto

O editor SaaS (`SAAS_MODE = true`) depende do Supabase cloud: magic link, rate limit de SMTP, confusão `localhost` vs `127.0.0.1`, e dados partilhados com produção. O objectivo é um fluxo dev **fluido e isolado**, mantendo paridade com o stack de produção (RLS, Auth JWT, Storage).

### Decisões

| Questão | Decisão |
|---------|---------|
| Stack local | **Supabase local completo** (`supabase start` via Docker) |
| Auth em dev | **C + auto-login:** `signInWithPassword` com user seed; JWT real |
| Postgres | Incluído no stack Supabase local (porta 54322) |
| Produção | GitHub Pages + `config.js` cloud — **sem alterações** |
| Branch | Trabalho em `develop`; merge para `main` quando estável |

## Arquitectura

```
Browser (http://127.0.0.1:8080)
  index.html / admin.html
  config.local.js → LOCAL_DEV=true
        │
        ▼ supabase-js
Supabase local (Docker — supabase start)
  · API     :54321
  · Postgres :54322
  · Studio  :54323
  · Auth (password, sem SMTP)
  · Storage (org-logos)
  · RLS activo

Produção (Pages) → config.js → Supabase cloud (inalterado)
```

## Componentes novos

| Ficheiro | Função |
|----------|--------|
| `supabase/config.toml` | Ports, auth (email confirm off), site URL local |
| `supabase/seed.sql` | User dev, orgs, memberships superadmin |
| `config.local.example.js` | Template: URL, anon key, `LOCAL_DEV`, `DEV_AUTH` |
| `core/config-loader.js` | Carrega `config.local.js` se existir, senão `config.js` |
| `dev.sh` | Sobe Supabase + HTTP server |
| `dev-stop.sh` | Para Supabase + servidor |
| `README.md` § Dev local | Setup, checklist, troubleshooting |

## Config

### `config.local.example.js`

```javascript
window.LOCAL_DEV = true;
window.SUPABASE_URL = 'http://127.0.0.1:54321';
window.SUPABASE_ANON_KEY = '<anon key de supabase status>';
window.DEV_AUTH = { email: 'dev@local.test', password: 'dev123' };
```

- `config.local.js` — gitignored (copiar do example)
- `config.js` — continua a apontar ao cloud (Pages / fallback)

### Loader

`index.html` e `admin.html` passam a carregar `core/config-loader.js` antes de `supabase-client.js`. O loader tenta `fetch('config.local.js')`; se 200, injecta; senão carrega `config.js`.

## Auth gate (LOCAL_DEV)

Em `core/auth-gate.jsx` (e fluxo equivalente no admin):

1. Se `!window.LOCAL_DEV` → comportamento actual (magic link)
2. Se `LOCAL_DEV`:
   - `getSession()` — sessão válida → continua
   - Senão → `signInWithPassword(DEV_AUTH)` automático (sem UI de login)
   - Falha → mensagem: “Corre `supabase db reset` ou `./dev.sh`”
   - **Nunca** chama `signInWithOtp` quando `LOCAL_DEV`

Sessão real → `auth.uid()` e RLS funcionam como em produção.

## Seed (`supabase/seed.sql`)

Executado após migrations via `supabase db reset`:

| Entidade | Valor |
|----------|--------|
| Auth user | `dev@local.test` / `dev123`, email confirmado |
| Org 1 | slug `iar`, Igreja Anglicana Rio |
| Org 2 | slug `igreja-teste`, Igreja Anglicana Teste |
| Membership | dev user = `superadmin` em ambas |

Seed idempotente onde possível (`on conflict do nothing`).

## Supabase `config.toml` (dev)

- `site_url = "http://127.0.0.1:8080"`
- `additional_redirect_urls` inclui `http://127.0.0.1:8080/**`
- Signup permitido; confirmação de email desactivada para dev
- Storage: bucket `org-logos` via migration existente

## Scripts

| Script | Acção |
|--------|--------|
| `./dev.sh` | Verifica Docker → `supabase start` (se necessário) → imprime hint de keys → `python3 -m http.server 8080` |
| `./dev-stop.sh` | `supabase stop` + termina servidor HTTP |
| `supabase db reset` | Recria DB + migrations + seed |

**Pré-requisitos:** Docker Desktop, Supabase CLI (`brew install supabase/tap/supabase`).

## Erros comuns

| Situação | Resposta |
|----------|----------|
| Docker parado | `dev.sh` aborta com mensagem clara |
| Supabase parado | `dev.sh` corre `supabase start` |
| User seed em falta | Auth gate: pede `supabase db reset` |
| `config.local.js` ausente | README: copiar example + keys de `supabase status` |
| Misturar hosts | Documentar: usar sempre `127.0.0.1:8080` em dev |

## Checklist de verificação

1. `./dev.sh` → editor abre logado como superadmin, sem magic link
2. Dropdown Org lista IAR + teste
3. Admin: CRUD org + upload logo (storage local)
4. Convite gera link com path correcto (`127.0.0.1:8080/...`)
5. Canvas reflecte org activa
6. `main` + `config.js` cloud → fluxo produção intacto

## Fora de scope

- CI com Supabase local
- Sync cloud → local
- SMTP / Inbucket (fase posterior opcional)
- Backend Node separado
- Alterações ao deploy GitHub Pages

## Entregáveis (implementação)

1. `supabase init` scaffold + `config.toml` ajustado
2. `supabase/seed.sql`
3. `core/config-loader.js` + `config.local.example.js`
4. Auth gate + admin: auto-login LOCAL_DEV
5. `dev.sh`, `dev-stop.sh`
6. README § Dev local
7. `.gitignore`: `config.local.js`
