# Editor unificado (IAR · OFMJ)

> Prioridade sobre `PASTOR/CLAUDE.md` e `PRODUTOR-CONTEUDO/CLAUDE.md` quando o trabalho é em `editor/`.

Hub form-based: escolher **marca** (IAR ou OFMJ) → template → campos → preview → PNG.

## SaaS (white-label MVP)

- **`index.html`:** `SAAS_MODE = true` → Auth Supabase, só catálogo IAR (`church-v1`), skin por org.
- **`admin.html`:** superadmin — CRUD orgs, logo, tema, convites (`core/admin-app.jsx`).
- **`config.js`** (gitignored, copiar de `config.example.js`): `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
- **Schema:** `supabase/migrations/001_saas_mvp.sql` — aplicar no SQL Editor; seed manual de superadmin após primeiro login.
- **Legado offline:** `SAAS_MODE = false` → `MARCA_FORCADA`, sem Supabase; IAR + OFMJ local.

Ver README § Modo SaaS, Modo legado, Checklist E2E.

## Estrutura

| Caminho | Função |
|---------|--------|
| `core/editor-app.jsx` | App React: selector de marca, sidebar, stage, export |
| `core/auth-gate.jsx` | Login magic link, resolução org, `accept_invite` |
| `core/admin-app.jsx` | Painel superadmin (orgs, logos, convites) |
| `core/supabase-client.js` / `core/org-skin.js` | Cliente Supabase, `ORG_SKIN` + CSS vars |
| `core/form-fields.jsx` | Campos text/textarea/number/photo/icon/image |
| `core/editor-styles.css` | UI neutra (`ed-*`) |
| `marcas/iar/` | Templates igreja, `icons.jsx`, `styles.css`, `registry.jsx`, `manifest.js` |
| `marcas/ofmj/` | Templates @ofantasticomundodejorge, `registry.jsx`, tweaks, `manifest.js` |
| `marcas/ofmj/canvas.html` | Canvas Figma-like (panorâmica · drag/rename/export PNG 3× por slide) |
| `build.sh` / `publicar.sh` | Build estático travado por marca → GitHub Pages |

## Marcas

- **IAR:** paleta travada, sem painel de tweaks, export 1× (`pixelRatio: 1`).
- **OFMJ:** paletas/acentos/layout em `templates.jsx`, export 3×. Fora do path SaaS.

Estado `localStorage`: `ed:iar:state`, `ed:ofmj:state`, `ed:marcaActiva`; com SaaS, chave IAR é `ed:{orgId}:state`.

## Comandos

```bash
./start-editor.sh      # local, ambas as marcas (legado) ou SaaS se index com SAAS_MODE
./publicar.sh iar      # → editor-iar.github.io
./publicar.sh ofmj     # → editor-ofmj.github.io
python3 -m http.server 8080   # SaaS: index.html + admin.html
```

Legado: `PASTOR/editor-iar/` e `PRODUTOR-CONTEUDO/editor-posts/` só têm shims + README.
