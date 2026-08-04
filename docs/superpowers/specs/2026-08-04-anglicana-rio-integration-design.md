# Integração anglicana-rio → editor-iar

**Data:** 2026-08-04  
**Estado:** Aprovado (brainstorming)  
**Escopo:** Novos templates de post + actualizações visuais in-place

## Contexto

A pasta `anglicana-rio/` é um handoff bundle do Claude Design: protótipos HTML/CSS/JS + editor standalone antigo. O editor de produção vive em `marcas/iar/` dentro do hub unificado (`core/`).

### Decisões do utilizador

| Questão | Decisão |
|---------|---------|
| Escopo | A) Novos templates + B) Actualizar visuais existentes |
| Templates exclusivos do editor (Mitos e Verdades) | Manter todos — integrar só o que veio do handoff |
| Template Evento | Dois templates: manter `event` actual + criar `event-v2` |
| Actualizações visuais | Híbrido: in-place onde campos batem; v2 só onde estrutura diverge |
| Abordagem técnica | Merge directo para `marcas/iar/` (sem refactor de módulos) |

## Arquitectura

### Inventário final de templates

| Acção | Template | ID | Dimensões | Grupo |
|-------|----------|-----|-----------|-------|
| Novo | Campanha / Comemorativo | `campaign` | 1080×1080 | Feed · Comunidade |
| Novo | Convite de evento v2 | `event-v2` | 1080×1350 | Feed · Evento |
| Novo | Story Spotify | `story-spotify` | 1080×1920 | Story · Spotify |
| Novo | Capa Spotify | `capa-spotify` | 1400×1400 | Spotify |
| Novo | Banner YouTube | `banner-youtube` | 2560×1440 | YouTube |
| In-place | Stories, community, lectionary, capas carrossel | ids actuais | — | — |
| Intocado | Mitos e Verdades (4), Evento v1 | ids actuais | — | — |

### Ficheiros afectados

```
marcas/iar/
  templates.jsx    ← componentes novos + actualizações visuais in-place
  registry.jsx     ← 5 entradas novas + PRESET_PHOTOS
  styles.css       ← classes .t-spotify-*, .t-youtube-*, .t-event-v2, .t-campaign
  assets/          ← photo-familia-construcao.jpg, photo-familia-espaco-novo.png
core/
  form-fields.jsx  ← tipos swatch e slider
```

### Pasta anglicana-rio/

Não commitar `uploads/`, `screenshots/`, `png/` (~200 ficheiros). Migrar apenas assets referenciados em templates. Após integração: remover pasta ou adicionar ao `.gitignore`.

### Preview e export

O editor suporta `w`/`h` por template via `registry.jsx`. Scale genérico em `editor-app.jsx` cobre 1400×1400 e 2560×1440. Export IAR mantém `pixelRatio: 1`.

## Componentes novos

### TplCampaign

Port de `anglicana-rio/project/templates.jsx`. Grid 2×2 de fotos de fundo quando `photo` é null; overlay gradiente; logo grande; CTA estola.

**Campos:** `photo`, `intro`, `kicker`, `title`, `titleEm`, `body`, `cta`

**Defaults:** conteúdo campanha "casa nova" do handoff.

### TplEventV2

Port do `TplEvent` do handoff. Data como destaque visual (140px serif); `title` = dia da semana; pílula CTA no rodapé.

**Campos:** `photo`, `kicker`, `kickerColor` (swatch), `title`, `date`, `time`, `place`, `cta`, `overlayOpacity` (slider 0.3–1.0)

### StorySpotify

Port de `Story Spotify IAR.html`. Foto fullbleed com grayscale + tint marinho + veil gradiente; moldura e cantos âmbar; CTA Spotify com ícone SVG inline.

**Campos:** `photo`, `eyebrow`, `title`, `titleEm`, `titleAccent` (palavra final em itálico âmbar, ex. "Cristus"), `speaker`, `refs` (textarea), `ctaText`, `handle`

### CapaSpotify

Port de `Capa Spotify IAR.html`. Sem foto; logo símbolo centrado; tipografia hero.

**Campos:** `eyebrow`, `title`, `titleEm`, `sub`, `tag`

### BannerYouTube

Port de `Banner YouTube IAR.html`. Layout horizontal: logo + divisor + texto dentro da safe area YouTube (1546×423 centrada em 2560×1440).

**Campos:** `eyebrow`, `title`, `titleEm`, `sub`

## Actualizações in-place

Mesmos `id`s e campos — layout substituído pelo handoff onde aplicável:

| Componente | Mudança |
|------------|---------|
| `TplCommunity` | Gradiente overlay; quote 64px itálico; autor em uppercase estola-claro |
| `TplLectionary` | Paleta verde litúrgico; header centralizado refinado |
| `StoryEvent` | Título 130px serif como herói; meta com ícones |
| `StoryQuote` | Foto circular 280px opcional |
| `TplCoverType`, `TplCoverPhoto`, `TplCoverIcon`, `TplBodyNum`, `TplBodyIcon`, `TplCloseCTA` | Spacing e gradientes alinhados ao handoff |

## Extensão do core

### form-fields.jsx

Dois tipos novos (port do handoff `editor-app.jsx`):

- **`swatch`** — botões circulares de cor com borda activa estola
- **`slider`** — `<input type="range">` com label mostrando percentagem

Usados exclusivamente por `event-v2` nesta fase.

## CSS

Classes em `marcas/iar/styles.css`:

- `.t-spotify-story` — halo, frame, corners, photo-tint, photo-veil, cta pill
- `.t-spotify-cover` — layout centrado 1400×1400
- `.t-youtube-banner` — halo + safe area flex
- `.t-event-v2` — gradiente dinâmico baseado em overlayOpacity
- `.t-campaign` — grid fotos + overlay

Tokens existentes (`--marinho`, `--ambar`, `--estola`, etc.) — sem alteração.

## Assets

Copiar de `anglicana-rio/project/assets/` para `marcas/iar/assets/`:

- `photo-familia-construcao.jpg`
- `photo-familia-espaco-novo.png`

Adicionar ao `PRESET_PHOTOS` em `registry.jsx` se relevante para campanha.

## Fluxo de dados

Sem mudanças estruturais. Novos templates registados em `IAR_TEMPLATES` via `registry.jsx` → `manifest.js`. Estado persistido em `localStorage` (`ed:iar:state`) keyed por `tplId`. Templates in-place mantêm compatibilidade com conteúdo guardado.

## Verificação

1. Servidor local → seleccionar cada template novo → preview sem overflow
2. Export PNG → dimensões exactas: 1080×1350, 1080×1920, 1400×1400, 2560×1440
3. Templates in-place → conteúdo `localStorage` anterior renderiza correctamente
4. Templates Mitos + Evento v1 → inalterados
5. Push → GitHub Pages actualiza

## Ordem de implementação

1. `core/form-fields.jsx` — swatch + slider
2. Assets → `marcas/iar/assets/`
3. Componentes novos em `templates.jsx`
4. Entradas em `registry.jsx`
5. Actualizações in-place em `templates.jsx`
6. CSS em `styles.css`
7. `.gitignore` para `anglicana-rio/` ou remoção da pasta

## Fora de escopo

- Folheto litúrgico completo (`Folheto Liturgico IAR.html`)
- Site / Landing (`Site IAR.html`, `Landing IAR.html`)
- Canvas Figma-like
- Marca OFMJ
- Refactor de `templates.jsx` em múltiplos ficheiros
