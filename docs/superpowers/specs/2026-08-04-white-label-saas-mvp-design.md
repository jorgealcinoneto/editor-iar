# White-label SaaS — MVP (skin multi-org)

**Data:** 2026-08-04  
**Estado:** Aprovado (brainstorming)  
**Escopo:** Multi-tenant + auth + identidade por org; catálogo partilhado; sem builder

## Contexto

O editor unificado já é multi-marca estática (`marcas/iar`, `marcas/ofmj`, `MARCA_FORCADA`, `manifest.js`). O objectivo de produto é um **SaaS white-label**: um app, várias organizações, cada uma com a sua identidade.

### Decisões

| Questão | Decisão |
|---------|---------|
| Modelo de negócio | SaaS multi-org (não deploy por cliente) |
| Personalização alvo (visão) | Identidade + templates custom via kit UI (no-code) |
| Autoria de templates custom | Admin da org via kit de componentes (fase 2) |
| **MVP** | Auth + orgs + skin (logo/cores/nome/handle); catálogo fixo `church-v1` |
| Cloud | Supabase (free tier; Pro ~$25/mês se crescer) |
| Criação de orgs | Só superadmin; members por convite |
| OFMJ | Fora do SaaS MVP; fica no repo para uso local |

## Arquitectura

```
Utilizador → Editor estático (GitHub Pages)
                → Supabase Auth
                → Postgres (orgs, members, invites)
                → Storage (logos)
                → Catálogo church-v1 + ORG_SKIN → Export PNG (browser)
```

### Papéis

| Papel | Capacidades |
|-------|-------------|
| superadmin | Criar/editar orgs, upload logo, theme, convites |
| member | Editor da sua org; conteúdo de posts; sem admin |

### Stack

- Frontend: `core/` actual (React + Babel CDN)
- Supabase JS (cliente)
- Hosting: GitHub Pages
- Export: `html-to-image` no cliente (sem custo de backend)

## Modelo de dados

### `orgs`

| Campo | Tipo | Notas |
|-------|------|--------|
| id | uuid | PK |
| slug | text | único, ex. `iar` |
| name | text | Nome da igreja/marca |
| handle | text | ex. `@igrejaanglicanario` |
| logo_url | text | URL Storage |
| catalog_id | text | MVP: sempre `church-v1` |
| theme | jsonb | tokens de cor/fonte |
| created_at | timestamptz | |

**`theme` (jsonb) exemplo:**

```json
{
  "paper": "#F5EFE6",
  "ink": "#1C2A3A",
  "accent": "#1A52D6",
  "accentSoft": "#4978E3",
  "ambar": "#C99B6B",
  "marinho": "#0E2A47"
}
```

### `org_members`

| Campo | Tipo |
|-------|------|
| org_id | uuid FK |
| user_id | uuid FK (auth.users) |
| role | `superadmin` \| `member` |

Unique `(org_id, user_id)`.

### `invites`

| Campo | Tipo |
|-------|------|
| org_id | uuid |
| email | text |
| token | text |
| status | pending \| accepted \| expired |
| expires_at | timestamptz |

### Storage

- Bucket `org-logos`, path `{org_id}/logo.png`
- Leitura pública; escrita só superadmin

### RLS

- Member: `SELECT` apenas orgs onde é member
- Escrita em `orgs` / invites / logos: só superadmin
- Templates e código: estáticos no Pages (sem RLS)

## Skin em runtime

1. Login → lookup `org_members` → org activa (MVP: uma org por user; se várias, a mais recente / última usada em localStorage)
2. App define `window.ORG_SKIN = { name, handle, logoUrl, theme, catalogId }`
3. Aplicar `theme` em CSS variables (`--marinho`, `--estola`, `--papel`, …)
4. `PostHead`, `IconLogoMarca`, footers usam `ORG_SKIN` em vez de strings IAR hardcoded
5. Estado de formulário: `localStorage` key `ed:{orgId}:state`

### Tokenização do catálogo `church-v1`

- Cores: já via CSS vars em `marcas/iar/styles.css` — sobrescrever na org
- Logo: ler `ORG_SKIN.logoUrl` com fallback ao símbolo default do catálogo
- Nome/handle: constantes → `ORG_SKIN`
- Defaults litúrgicos no registry: mantêm-se; org edita no form
- Sem i18n automática no MVP

## Admin mínimo

Mesmo app (`admin.html` ou `?admin=1`):

- Lista orgs
- Criar/editar: nome, slug, handle, logo, theme picker
- Convidar email → `invites` + fluxo Auth Supabase

Members não acedem ao admin (guard por role).

## Erros

| Situação | UX |
|----------|-----|
| Não autenticado | Ecrã login |
| Sem membership | Pedir convite ao admin |
| Convite inválido | Mensagem; sem membership |
| Logo em falta | Fallback default do catálogo |
| Supabase offline | Mensagem; não corrompe localStorage |

## Fora de escopo (fase 2+)

- Builder no-code (kit de blocos)
- Templates 100% custom por org
- Self-serve signup / billing
- Sync cloud do estado dos posts (além de localStorage)
- Catálogo OFMJ no SaaS
- Multi-org switcher rico (só o necessário se um user tiver 2+ orgs)

## Verificação

1. Superadmin cria org B com logo/cores ≠ IAR
2. Convite → login → skin org B
3. PNG export reflecte logo + cores B
4. Isolamento: user org A não vê skin/dados B
5. Member sem acesso admin
6. Smoke free tier: 2 orgs, menos de 10 users

## Ordem de implementação

1. Projecto Supabase + schema + RLS + bucket
2. Login + resolução de org
3. Loader `ORG_SKIN` + CSS vars
4. Tokenizar PostHead / logo / handle no catálogo
5. Admin mínimo (CRUD org + invite)
6. Env no Pages (`SUPABASE_URL`, `ANON_KEY`) + deploy

## Custos

- MVP: Supabase free tier ($0) + GitHub Pages ($0)
- Escala: Pro ~$25/mês se ultrapassar limites free
- Export PNG: custo zero no backend (client-side)
