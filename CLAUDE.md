# Editor unificado (IAR · OFMJ)

> Prioridade sobre `PASTOR/CLAUDE.md` e `PRODUTOR-CONTEUDO/CLAUDE.md` quando o trabalho é em `editor/`.

Hub form-based: escolher **marca** (IAR ou OFMJ) → template → campos → preview → PNG.

## Estrutura

| Caminho | Função |
|---------|--------|
| `core/editor-app.jsx` | App React: selector de marca, sidebar, stage, export |
| `core/form-fields.jsx` | Campos text/textarea/number/photo/icon/image |
| `core/editor-styles.css` | UI neutra (`ed-*`) |
| `marcas/iar/` | Templates igreja, `icons.jsx`, `styles.css`, `registry.jsx`, `manifest.js` |
| `marcas/ofmj/` | Templates @ofantasticomundodejorge, `registry.jsx`, tweaks, `manifest.js` |
| `marcas/ofmj/canvas.html` | Canvas Figma-like (panorâmica · drag/rename/export PNG 3× por slide) |
| `build.sh` / `publicar.sh` | Build estático travado por marca → GitHub Pages |

## Marcas

- **IAR:** paleta travada, sem painel de tweaks, export 1× (`pixelRatio: 1`).
- **OFMJ:** paletas/acentos/layout em `templates.jsx`, export 3×.

Estado `localStorage`: `ed:iar:state`, `ed:ofmj:state`, `ed:marcaActiva`.

## Comandos

```bash
./start-editor.sh      # local, ambas as marcas
./publicar.sh iar      # → editor-iar.github.io
./publicar.sh ofmj     # → editor-ofmj.github.io
```

Legado: `PASTOR/editor-iar/` e `PRODUTOR-CONTEUDO/editor-posts/` só têm shims + README.
