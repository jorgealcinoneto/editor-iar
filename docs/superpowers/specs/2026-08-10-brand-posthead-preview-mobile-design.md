# Spec: Brand no PostHead + preview mobile (stories)

Data: 2026-08-10  
Estado: implementado em `develop` (commits `571d52a`, `01b8dd8`, `4ebf052`)

## Contexto

Relatos na org **Comunidade Anglicana Refúgio** (e risco igual noutras marcas com selo + wordmark em CSS):

1. Nome da igreja **sobreposto/ilegível** no canto do post (feed)
2. Nos **stories**, só o logo — sem nome ao lado
3. No telemóvel, o **Preview** de templates altos (1080×1920) não deixava ver a imagem toda

## 1. Nome sobreposto no PostHead (feed)

### Causa

`getSkinBrandLines` parte o nome em duas linhas (`Comunidade Anglicana` / `Refúgio`). No CSS de Refúgio e Reconciliador, `.t-mark__text` **não** tinha `white-space: nowrap` (o IAR tinha). Com letter-spacing e o mark a encolher no flex do header, a linha 1 partia e colidia com a linha 2.

### Correção

| Ficheiro | Mudança |
|----------|---------|
| `marcas/refugio/styles.css` | `nowrap`, `flex-shrink: 0` no mark, letter-spacing menor na linha 1, `.t-mark__line2` |
| `marcas/reconciliador/styles.css` | Idem |
| `marcas/refugio/templates.jsx` | Linha 2 em `<span className="t-mark__line2">` |
| `marcas/reconciliador/templates.jsx` | Idem |

## 2. Nome ausente nos stories

### Causa

`StoryEvent`, `StoryVerse` e `StoryQuote` renderizavam só o selo/`IconLogoMarca`, sem texto de marca. O Lecionário já centrava o nome; o Evento story não.

### Correção

Reutilizar `PostHead` (logo + `line1`/`line2`) em:

- `marcas/refugio/templates.jsx`
- `marcas/reconciliador/templates.jsx`
- `marcas/iar/templates.jsx`

Stories com foto usam `dark` + `legible` para contraste sobre o véu.

## 3. Preview mobile não mostra o post inteiro

### Causa

- Scale dos stories (1080×1920) usava sobretudo a **largura** (`stageSize.w / tpl.w`), ignorando a altura útil
- Medição era no stage inteiro (incluindo head/tweaks), não no board
- `.ed-stage__board` sem `min-height: 0` → o flex não encolhia e o conteúdo saía do ecrã sem scroll fiável

### Correção

| Ficheiro | Mudança |
|----------|---------|
| `core/editor-app.jsx` | `boardRef` + `ResizeObserver`; `visibleScale` = `min(cap, fitW, fitH)` |
| `core/editor-styles.css` | `min-height: 0` no board; pane preview `overflow: hidden`; head mobile `max-height: ~42%` com scroll; board scroll de reserva |

Export PNG continua em px fixos — só o chrome/preview adapta.

## Verificação

- [ ] Refúgio · Versículo (feed): `COMUNIDADE ANGLICANA` / `REFÚGIO` legíveis, sem overlap
- [ ] Refúgio · Story Evento: nome ao lado do logo no topo
- [ ] IAR / Reconciliador · Story Verse/Event/Quote: idem
- [ ] Telemóvel ≤760px · Preview · Lecionário/Story: post inteiro visível (ou scroll no board)
- [ ] Desktop preview inalterado em qualidade

## Relação com docs anteriores

Complementa `docs/superpowers/specs/2026-08-07-responsividade-total-design.md` (tabs Editar/Preview) com o fit vertical do board.
