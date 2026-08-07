# Isolamento de assets por organização

**Data:** 2026-08-07  
**Estado:** Aprovado (brainstorming)  
**Branch:** `develop`  
**Escopo:** Organizações SaaS não partilham imagens, galeria, logo, fontes nem paleta

## Contexto

No modo SaaS (`SAAS_MODE = true`), várias orgs usam o mesmo catálogo IAR. Hoje:

| Asset | Estado actual | Problema |
|-------|---------------|----------|
| Conteúdo templates | `localStorage` `ed:{orgId}:state` | ✅ Isolado |
| Logo | `orgs.logo_url` → `ORG_SKIN` | ✅ Por org |
| Cores CSS | `orgs.theme` → CSS vars | ✅ Parcial |
| Paleta/accento editor | `manifest.js` fixo IAR | ❌ Partilhado |
| Galeria preset | `IAR_GALLERIES` global | ❌ Partilhado |
| Uploads | `data:` URL no state | ✅ Por org (só browser) |
| Fontes | Google Fonts global + `fontScale` | ❌ Famílias partilhadas |

**Requisito:** orgs diferentes não devem partilhar imagens, galeria, logo, fontes, paleta.

### Decisões

| Questão | Decisão |
|---------|---------|
| Onde vivem assets | **C híbrido:** logo/tema na BD; galeria/uploads no Storage; presets IAR globais mas separados visualmente |
| Fontes | **B:** escolha Google Fonts no admin (`theme.fontHeading`, `theme.fontBody`); sem upload de font files |
| Abordagem backend | **B:** tabela `org_assets` + bucket `org-assets` |
| Quem gere galeria | Superadmin no admin (MVP) |
| Sync conteúdo texto templates | Fora de scope (mantém `localStorage`) |

## Arquitectura

```
Admin (superadmin)
  · CRUD org + theme (cores + fontes Google)
  · Upload galeria → Storage org-assets/{orgId}/gallery/
  · Metadata → org_assets (kind, url, label)

Editor (membro)
  activateOrg(org)
    · ORG_SKIN ← org row (logo, theme, fonts)
    · applyOrgTheme + inject Google Fonts link
    · loadOrgGallery(orgId) → window.ORG_GALLERY
    · reloadMarcaState(orgId)

  Galeria UI
    · "Galeria da org" ← ORG_GALLERY only
    · "Catálogo IAR" ← IAR_GALLERIES (colapsável, separado)

  TweaksPanel (SaaS)
    · Swatches derivados de ORG_SKIN.theme (não manifest.palettes)

  Upload campo foto
    · → Storage org-assets/{orgId}/upload/
    · → insert org_assets
    · URL nunca reutilizada cross-org
```

## Schema

### Extensão `orgs.theme`

```json
{
  "paper": "#F5EFE6",
  "ink": "#1C2A3A",
  "accent": "#1A52D6",
  "accentSoft": "#4978E3",
  "ambar": "#C99B6B",
  "marinho": "#0E2A47",
  "fontHeading": "Cormorant Garamond",
  "fontBody": "DM Sans"
}
```

Defaults iguais aos actuais; fontes default = famílias IAR actuais.

### Nova tabela `org_assets`

```sql
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
```

### Storage bucket `org-assets`

- Path: `{org_id}/{kind}/{filename}`
- Public read (URLs em posts PNG export)
- Write: superadmin only (RLS via `is_superadmin()`)
- Read: `is_org_member(org_id)`

Logo mantém bucket `org-logos` existente.

### RLS `org_assets`

- SELECT: membro da org ou superadmin
- INSERT/UPDATE/DELETE: superadmin

GRANTs explícitos para `authenticated`, `service_role` (padrão migration `002_api_grants`).

## Runtime — editor

### `core/org-skin.js`

- `buildOrgSkin`: incluir `fontHeading`, `fontBody` de `theme`
- `applyOrgTheme`: CSS vars existentes + `--font-heading`, `--font-body`
- Nova `loadOrgFonts(skin)`: inject/remove `<link>` Google Fonts só para famílias da org

### `core/org-gallery.js` (novo)

```javascript
window.loadOrgGallery = async function (supabase, orgId) {
  const { data, error } = await supabase
    .from('org_assets')
    .select('id, url, label, kind')
    .eq('org_id', orgId)
    .eq('kind', 'gallery')
    .order('created_at', { ascending: false });
  if (error) throw error;
  window.ORG_GALLERY = data || [];
  return window.ORG_GALLERY;
};
```

Chamado em `activateOrg` (ou listener `ed:org-change`).

### `core/editor-app.jsx`

- `GalleryBrowser`: duas secções — org gallery + catálogo IAR (colapsável)
- `TweaksPanel`: se `SAAS_MODE`, usar theme da org em vez de `marca.palettes`/`accents`
- `switchOrg`: await reload galeria + fonts
- Upload foto: helper `uploadOrgAsset(file, kind)` → Storage + `org_assets`

### `core/form-fields.jsx`

- Galeria inline em campos photo: org assets first, depois catálogo IAR separado
- Upload → `uploadOrgAsset` (não `data:` URL em SaaS)

### `marcas/iar/canvas.html`

- Mesmo fluxo: `loadOrgGallery` após auth

### Templates IAR

- Já usam `ORG_SKIN` para logo/nome — sem alteração estrutural
- CSS: `styles.css` usa vars `--font-heading`, `--font-body` onde aplicável

## Admin

### `core/admin-app.jsx`

Por org editada:

1. **Tema** — 6 cores (existente) + 2 dropdowns Google Fonts (lista curada ~15 famílias)
2. **Galeria** — upload múltiplo, lista com preview, botão apagar (remove Storage + row)

Lista curada fonts (MVP):

```
Cormorant Garamond, EB Garamond, Fraunces, Instrument Serif,
DM Sans, Inter, Space Grotesk, Syne, Bricolage Grotesque,
Unbounded, JetBrains Mono, Anton
```

## Comportamento ao trocar org

1. Guardar state org actual (`saveMarcaState`)
2. `activateOrg(novaOrg)` — theme, logo, fonts
3. `loadOrgGallery(novaOrgId)`
4. `reloadMarcaState(marcaId, novaOrgId)`
5. UI reflecte zero assets da org anterior

## Fora de scope

- Upload font files (.woff2)
- Galeria partilhada entre orgs
- Persistência cloud do conteúdo textual dos templates
- OFMJ SaaS (continua legado offline)

## Critérios de aceitação

1. Org A e Org B têm logo, galeria, paleta e fontes distintos
2. Switch org → preview actualiza sem flash de assets da org anterior
3. Upload na Org A não aparece na galeria da Org B
4. Catálogo IAR visível numa secção separada e claramente rotulada
5. Canvas herda isolamento (título, logo, galeria)
6. Admin: superadmin gere galeria e fontes por org
7. RLS impede leitura de `org_assets` de outra org

## Testes

- `core/org-skin.test.mjs` — fonts no skin, applyOrgTheme vars
- `scripts/e2e-local-checklist.py` — extend: duas orgs seed, assets distintos
- Manual: switch org no editor + canvas
