# Editor IAR — Publicação no GitHub Pages

Pacote contendo **somente** o Editor de Posts da Igreja Anglicana Rio, pronto pra publicar online de graça via GitHub Pages.

## Como publicar (passo-a-passo)

### 1. Criar o repositório

1. Acesse [github.com](https://github.com) e faça login (ou crie conta).
2. Clique em **"+" no topo direito → "New repository"**.
3. Nome: `editor-iar` (repositório: `jorgealcinoneto/editor-iar`).
4. Marque **"Public"** (necessário pra GitHub Pages gratuito).
5. **Não** marque "Add a README". Clique em **"Create repository"**.

### 2. Subir os arquivos

**Opção A · Via interface (mais simples, sem terminal):**

1. Na página do repositório recém-criado, clique em **"uploading an existing file"**.
2. Arraste **TODO o conteúdo desta pasta** (não a pasta em si — abra ela e selecione todos os arquivos + a subpasta `assets`).
3. Clique em **"Commit changes"** lá embaixo.

**Opção B · Via terminal:**

```bash
cd publish
git init
git add .
git commit -m "Editor IAR"
git branch -M main
git remote add origin https://github.com/jorgealcinoneto/editor-iar.git
git push -u origin main
```

### 3. Ativar GitHub Pages

1. No repositório, vá em **Settings** (engrenagem no topo).
2. Na barra lateral, clique em **Pages**.
3. Em **Source**, selecione **"Deploy from a branch"**.
4. Em **Branch**, selecione **`main`** e pasta **`/ (root)`**. Clique em **Save**.
5. Aguarde 1-2 minutos. URL pública: `https://jorgealcinoneto.github.io/editor-iar/`.

**Atualização rápida (vault MATS):** na pasta `PASTOR/editor-iar/`, rode `./publicar-editor.sh`.

### 4. Compartilhar com a equipe

Manda essa URL no grupo da equipe de comunicação. Eles podem:

- **Salvar como atalho** no celular (Safari → Compartilhar → Adicionar à tela de início; Chrome → "Instalar app")
- **Salvar nos favoritos** do navegador no computador

### 5. Atualizando o editor no futuro

Quando precisar adicionar/ajustar templates:

1. Atualizar os arquivos localmente.
2. Subir novos arquivos pelo botão **"Add file → Upload files"** no repositório (sobrescreve os antigos).
3. A página pública atualiza automaticamente em ~1 minuto.

## Conteúdo desta pasta

```
index.html                ← página principal (renomeado de "Editor IAR.html")
styles.css                ← tokens do sistema visual (cores, fontes, tipografia)
editor-styles.css         ← estilos específicos do editor
icons.jsx                 ← biblioteca de ícones IAR
templates.jsx             ← definição visual dos 14 templates
editor-app.jsx            ← lógica do editor (formulário, preview, download)
assets/                   ← logos + fotos da comunidade
```

## Dependências externas (carregam automaticamente da internet)

- Google Fonts: Cormorant Garamond + DM Sans
- React 18.3.1 + Babel (unpkg.com)
- html-to-image 1.11.13 (unpkg.com)

Estas funcionam sem nenhum setup extra — basta o usuário ter internet.

## Suporte

Se algo quebrar ou precisar de novos templates, fala comigo.
