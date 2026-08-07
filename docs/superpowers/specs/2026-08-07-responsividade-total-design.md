# Spec: Responsividade total (editor + admin + login)

Data: 2026-08-07  
Estado: implementado (abordagem CSS-first + tabs leves)

## Objectivo

Tornar o chrome SaaS usável em telemóvel e tablet: editor form (`index.html`), ecrã de login (`auth-gate`) e painel admin — sem alterar dimensões de export dos posts nem o canvas panorâmico IAR.

## Decisões

| Tema | Escolha |
|------|---------|
| Escopo | Editor + login + admin; **fora:** `canvas.html` |
| Mobile editor | Tab bar inferior **Editar \| Preview** |
| Galeria | Dentro de Editar (como no desktop) |
| Abordagem | CSS media queries + estado `mobilePane` mínimo |
| Export | Canvas fixo em px; só UI adapta |

## Breakpoints

| Largura | Comportamento |
|---------|---------------|
| `> 1000px` | Desktop (sidebar 380px + stage) |
| `≤ 1000px` | Sidebar ~320px; bar mais compacta |
| `≤ 760px` | Shell mobile: um pane de cada vez + tab bar |

## Arquitectura

```
ed-bar (compacta; menu ⋯)
ed-main--pane-{edit|preview}
  ed-pane--edit   → sidebar (templates, form, galeria)
  ed-pane--preview → stage (tweaks + post scaled)
ed-mobile-tabs (fixa, safe-area)
```

- Estado React: `mobilePane: 'edit' | 'preview'`
- Em `≤760px`, `#root` usa `100dvh`, overflow hidden; scroll só no pane activo
- Bar: brand curto; org / canvas / repor no menu `⋯`; botão PNG sempre visível
- Stage remede `visibleScale` ao mudar de pane / resize

## Login

Card centrado com padding lateral, inputs `font-size: 16px` (evitar zoom iOS), botões full-width, `safe-area-inset`.

## Admin

Wrap com padding reduzido; tabela em `overflow-x: auto`; theme grid 2→1 colunas; campos full-width; touch targets ≥44px.

## Fora de escopo

- Canvas IAR panorâmico
- Redesenho de templates / tamanhos de export
- PWA

## Ficheiros

- `core/editor-app.jsx`
- `core/editor-styles.css`
- `core/auth-gate.jsx`
- `core/admin-app.jsx`

## Verificação

- [ ] 375px: tabs Editar/Preview; sem scroll de página; PNG exportável
- [ ] ≤1000px: sidebar estreita, sem tabs
- [ ] Desktop inalterado
- [ ] Login e admin usáveis a 375px
