# AGENTS.md

## Cursor Cloud specific instructions

Site estático (React + Babel CDN). Sem `package.json` / sem install de deps npm. Servir com `python3 -m http.server 8080` a partir da raiz do repo.

### Supabase (SaaS)

- Projecto cloud esperado: **editor-church** (`ftcefxhnadnxhqvuamqu`).
- `config.js` é gitignored — copiar de `config.example.js` e preencher URL + anon key (MCP: `get_project_url` / `get_publishable_keys`).
- Auth (dashboard): Site URL `http://127.0.0.1:8080` e Redirect URLs `http://127.0.0.1:8080/**`, `http://localhost:8080/**`.
- Sem `config.js`, o gate mostra erro; com SaaS ligado e sessão válida, `index.html` abre o editor IAR e `admin.html` o painel superadmin.
- Seed do primeiro superadmin: após o 1.º magic-link login, inserir em `org_members` com `role = 'superadmin'` (ver README). Schema em `supabase/migrations/001_saas_mvp.sql`.

### Comandos

- Teste unitário: `node core/org-skin.test.mjs`
- Não há lint/build npm. Dev = servidor estático + browser.
- Detalhe de produto/comandos: `README.md` e `CLAUDE.md`.

### Gotchas

- `SAAS_MODE = true` em `index.html` (commitado). Offline/legado: `false` (não commitices essa mudança).
- Export PNG corre no browser (`html-to-image`); CDNs (unpkg / jsdelivr / fonts) têm de estar acessíveis.
- `supabase/config.toml` serve para stack **local** opcional (`supabase start`); o caminho principal de cloud agents é o projecto remoto + `config.js`.
