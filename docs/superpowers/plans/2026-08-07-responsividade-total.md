# Responsividade total Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chrome SaaS usável em telemóvel/tablet (editor + login + admin) sem alterar export PNG nem o canvas IAR.

**Architecture:** CSS-first com breakpoints 1000/760; no editor, estado mínimo `mobilePane` ('edit'|'preview') e tab bar inferior; bar com menu overflow `⋯`.

**Tech Stack:** HTML estático, React 18 UMD + Babel, CSS em `editor-styles.css` + estilos inline em auth/admin.

## Global Constraints

- Escopo: `index.html` editor, `auth-gate`, `admin.html` — **não** `canvas.html`
- Posts mantêm tamanho Instagram; só o chrome adapta
- Sem PWA
- Spec: `docs/superpowers/specs/2026-08-07-responsividade-total-design.md`

---

## File map

| Ficheiro | Responsabilidade |
|----------|------------------|
| `core/editor-app.jsx` | `mobilePane`, panes, tabs, menu `⋯`, label PNG curto |
| `core/editor-styles.css` | Media queries, tab bar, safe-area, panes |
| `core/auth-gate.jsx` | Card/login mobile |
| `core/admin-app.jsx` | Table wrap + CSS responsivo |

---

### Task 1: Editor tabs + bar compacta

**Files:** `core/editor-app.jsx`

- [x] Estado `mobilePane` default `'edit'`
- [x] `ed-main--pane-{edit|preview}` + panes `ed-pane--edit|preview`
- [x] `ed-mobile-tabs` Editar | Preview
- [x] Menu `⋯` com org switch / canvas / repor; PNG sempre na bar
- [x] `renderSecondaryActions` (não reutilizar o mesmo fragmento React)

### Task 2: CSS editor

**Files:** `core/editor-styles.css`

- [x] `≤1000px`: sidebar ~320px
- [x] `≤760px`: `#root` 100dvh; um pane visível; tab bar fixa + safe-area
- [x] Touch targets ≥44px nos tabs/botões relevantes

### Task 3: Login + admin

**Files:** `core/auth-gate.jsx`, `core/admin-app.jsx`

- [x] Auth: padding, inputs 16px, full-width, safe-area
- [x] Admin: `adm-table-wrap`, grids 2→1, forms full-width

### Task 4: Spec + plan

- [x] Spec design em `docs/superpowers/specs/2026-08-07-responsividade-total-design.md`
- [x] Este plan em `docs/superpowers/plans/2026-08-07-responsividade-total.md`

## Verificação

1. 375px: Editar scroll interno; Preview scaled (largura **e** altura do board); PNG na bar; menu `⋯`
2. 900px: duas colunas, sem tabs
3. Desktop inalterado
4. Login + admin a 375px

## Follow-up (2026-08-10)

Brand PostHead + stories + fit vertical do preview: ver `docs/superpowers/specs/2026-08-10-brand-posthead-preview-mobile-design.md`.
