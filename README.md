# Editor unificado (IAR · OFMJ)

Um editor form-based para criar posts Instagram: escolhe marca, template, preenche, baixa PNG.

## Local

```bash
./start-editor.sh   # http://localhost:8080/index.html
./stop-editor.sh
```

Selector na top-bar alterna **IAR** e **OFMJ**. Estado guardado em `localStorage` por marca (`ed:iar:state`, `ed:ofmj:state`).

## Publicar (GitHub Pages)

```bash
./build.sh iar
./publicar.sh iar    # → editor-iar.github.io

./build.sh ofmj
./publicar.sh ofmj   # → editor-ofmj.github.io
```

Builds travam a marca via `window.MARCA_FORCADA` e omitem scripts da outra marca.

## Estrutura

- `core/` — UI, form, export
- `marcas/iar/` — templates, ícones, assets, registry
- `marcas/ofmj/` — templates, assets, uploads, registry + tweaks
- `marcas/ofmj/canvas.html` — canvas Figma-like (visão panorâmica dos templates OFMJ; botão "Canvas ↗" na top-bar quando marca activa = OFMJ)

Pastas legadas: [PASTOR/editor-iar](../PASTOR/editor-iar/) e [PRODUTOR-CONTEUDO/editor-posts](../PRODUTOR-CONTEUDO/editor-posts/) redireccionam para aqui.
