# Spec: Org Comunidade Anglicana Refúgio

Data: 2026-08-07  
Estado: aprovado em brainstorming (abordagem script one-shot)

## Objectivo

Criar a organização SaaS **Comunidade Anglicana Refúgio** (cloud + seed local) com identidade visual própria: paleta sage/oliva/creme, logo principal, galeria de fotos e variantes de logo, e barra do editor (`ed-bar`) a seguir `theme.marinho` da org activa.

## Decisões

| Decisão | Escolha |
|---------|---------|
| Destino | Cloud (`ftcefxhnadnxhqvuamqu`) **e** seed local |
| Slug / nome / handle | `refugio` / `Comunidade Anglicana Refúgio` / `@anglicana_refugio` |
| Relação com `igreja-teste` | Manter; org nova |
| Logo | Um `logo_url` (símbolo circular cálice+casa sage) + variantes na galeria |
| Galeria | Fotos de culto/comunidade + variantes de logo; **excluir** artes finalizadas (PRINCÍPIOS, QUEM SOMOS) |
| Tipografia | Cormorant Garamond + DM Sans |
| Abordagem | Script one-shot + assets em `supabase/seed-assets/refugio/` |
| Barra do editor | CSS: `.ed-bar--iar` usa `var(--marinho)` / `var(--papel)` / `var(--estola)` (não azul IAR hardcoded) |

## Theme JSON

```json
{
  "paper": "#F5F1E4",
  "ink": "#4A5B45",
  "marinho": "#4A5B45",
  "accent": "#A7CF9A",
  "accentSoft": "#C5E0BB",
  "ambar": "#E0A85E",
  "fontHeading": "Cormorant Garamond",
  "fontBody": "DM Sans"
}
```

Nota: terracota `#C46B4A` fica fora do schema de 6 cores; não entra no `theme` nesta iteração.

## Assets

### Logo principal
- Bucket `org-logos`, path `{orgId}/logo.png`
- Fonte: símbolo circular (cálice+casa), sage `#A7CF9A`, sem wordmark — melhor legibilidade no `PostHead`

### Galeria (`org_assets`, `kind=gallery`)
1. Variantes de logo: emblema com texto arqueado; wordmark REFÚGIO; símbolo em fundo oliva e em fundo preto
2. Fotos: reunião (parede sage + cruz); comunhão (hóstia nas mãos); elevação no altar; celebrante a sorrir no altar

Ficheiros versionados em `supabase/seed-assets/refugio/` (manifest JSON opcional com labels).

## Fluxo de implementação

### Cloud
1. `INSERT` em `orgs` com slug/name/handle/theme (UUID estável ou gerado)
2. `INSERT` membership `superadmin` para o mesmo user já superadmin em `iar` / `igreja-teste`
3. Script `scripts/seed-org-refugio.mjs`: upload logo + gallery assets; update `logo_url`; insert `org_assets`

### Local
1. Actualizar `supabase/seed.sql` com a mesma org (UUID fixo), theme e membership de `dev@local.test`
2. Após `supabase db reset` / `./dev.sh`, correr o script com `--local` (lê `config.local.js`)

### Código editor
1. Em `core/editor-styles.css`, `.ed-bar--iar` (e botões/seletores relacionados hardcoded `#0E2A47` / `#1A52D6`) passam a CSS vars do tema (`--marinho`, `--papel`, `--estola`, `--estola-claro`)
2. Sem alteração de schema; `activateOrg` / `applyOrgTheme` já injectam as vars

## Critérios de sucesso

- [ ] Org `refugio` visível no admin e no switcher do index (cloud e local)
- [ ] Tema aplicado: posts e UI usam oliva/sage/creme
- [ ] Logo no cabeçalho dos templates
- [ ] Galeria com fotos + variantes de logo (sem artes PRINCÍPIOS/QUEM SOMOS)
- [ ] Com org Refúgio activa, barra superior do editor é oliva `#4A5B45` (não azul IAR)
- [ ] Com org IAR activa, barra continua azul-marinho via theme IAR

## Fora de escopo

- Templates ou `catalog_id` novos
- Campo `theme.terracotta`
- Apagar/renomear `igreja-teste`
- Logo por template no schema (picker manual na galeria basta)
- Deploy Pages além do necessário para o CSS do `ed-bar`

## Riscos

- Upload Storage na cloud exige credenciais com permissão de write (service role no script ou sessão superadmin)
- Assets binários no repo: manter pasta enxuta (só ficheiros escolhidos, PNG/WebP optimizados)
