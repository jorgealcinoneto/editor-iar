# Editor unificado (IAR · OFMJ)

Um editor form-based para criar posts Instagram: escolhe marca, template, preenche, baixa PNG.

## Modo SaaS (multi-org, Supabase)

`index.html` arranca com `window.SAAS_MODE = true`: login por magic link, skin por org (`ORG_SKIN`), catálogo `church-v1` (IAR). OFMJ fica fora do SaaS.

### Setup local

1. **Supabase** — criar projecto free → **SQL Editor** → colar e executar `supabase/migrations/001_saas_mvp.sql`. Confirmar tabelas `orgs`, `org_members`, `invites` e bucket `org-logos`.
2. **Config** — `cp config.example.js config.js` e preencher `SUPABASE_URL` / `SUPABASE_ANON_KEY` (Project Settings → API).
3. **Servidor** — `python3 -m http.server 8080` (ou `./start-editor.sh`).
4. **Primeiro login** — abrir `http://localhost:8080/index.html`, entrar com magic link (cria user em Auth).
5. **Seed superadmin** — no SQL Editor, substituir UUIDs:

```sql
insert into public.orgs (slug, name, handle)
values ('iar', 'Igreja Anglicana Rio', '@igrejaanglicanario')
returning id;

insert into public.org_members (org_id, user_id, role)
values ('ORG_UUID', 'USER_UUID', 'superadmin');
```

`USER_UUID` = `auth.users.id` do passo 4; `ORG_UUID` = id devolvido pelo `insert` em `orgs`.

6. **Admin** — `http://localhost:8080/admin.html`: CRUD de orgs, upload de logo, tema, convites. Link gerado: `{origin}/index.html?invite={token}`.
7. **Convite** — member abre o link → login com o mesmo email → RPC `accept_invite` → editor com skin da org.

### Dev local (Supabase)

Stack local com Docker — sem projecto cloud nem magic link.

**Pré-requisitos:** Docker Desktop, Supabase CLI (`brew install supabase/tap/supabase`) ou `npx supabase`.

```bash
./dev.sh        # supabase start + HTTP em 127.0.0.1:8080
./dev-stop.sh   # para HTTP server + supabase stop
```

Na primeira execução, `dev.sh` copia `config.local.example.js` → `config.local.js` (gitignored). Login automático com `LOCAL_DEV` + `DEV_AUTH`.

**Seed:** `npx supabase db reset` (ou `supabase db reset`) aplica migrations + `supabase/seed.sql`:
- User: `dev@local.test` / `dev123` (superadmin nas orgs IAR e igreja-teste)

**URLs** (sempre `127.0.0.1`, não `localhost` — evita mismatch de redirect Auth):
- Editor: `http://127.0.0.1:8080/index.html`
- Admin: `http://127.0.0.1:8080/admin.html`
- Studio: `http://127.0.0.1:54323`

### Magic link — Auth → URL Configuration

No Supabase, em **Authentication → URL Configuration**, configurar:

- **Site URL**: origem principal (ex.: `http://localhost:8080` em dev, ou a origem do GitHub Pages em produção).
- **Redirect URLs**: adicionar `http://localhost:8080/**` (dev) e `https://<org>.github.io/**` (Pages), para que o link do email de acesso redirecione de volta para o editor.

Sem isto, o magic link pode redirecionar para o Site URL errado e falhar o login.

O free tier do Supabase usa o SMTP partilhado deles, com limite baixo de emails/hora — suficiente para dev e poucas orgs, mas considerar SMTP próprio (Settings → Auth → SMTP) antes de escalar convites.

## Modo legado (offline, sem Supabase)

Para IAR/OFMJ local sem auth, desactivar SaaS:

- Em `index.html`, mudar `window.SAAS_MODE = true` para `false`.
- Com `SAAS_MODE` false, o boot usa `window.MARCA_FORCADA` e ignora Supabase; selector IAR/OFMJ e `localStorage` por marca como antes.

```bash
./start-editor.sh   # http://localhost:8080/index.html
./stop-editor.sh
```

Estado guardado em `localStorage` por marca (`ed:iar:state`, `ed:ofmj:state`); no SaaS, chave é `ed:{orgId}:state`.

## Publicar (GitHub Pages)

```bash
./build.sh iar
./publicar.sh iar    # → editor-iar.github.io

./build.sh ofmj
./publicar.sh ofmj   # → editor-ofmj.github.io
```

Builds legados travam a marca via `window.MARCA_FORCADA` e omitem scripts da outra marca.

**SaaS no Pages:** repositórios públicos não devem expor a **service role key**. A anon key é pública por desenho (RLS protege dados) — pode ir em `config.js` gerado no CI a partir de secrets, ou commitada se RLS estiver correcto. Nunca commitar service role key. `config.js` está no `.gitignore` para dev local.

## Checklist E2E (a verificar após projecto Supabase configurado)

Itens da spec — **não verificados neste repo**; validar manualmente quando `config.js` + migração + seed estiverem activos:

1. Superadmin cria org B com logo/cores ≠ IAR
2. Convite → login → skin org B
3. PNG export reflecte logo + cores B
4. Isolamento: user org A não vê skin/dados B
5. Member sem acesso admin
6. Smoke free tier: 2 orgs, menos de 10 users

## Estrutura

- `core/` — UI, form, export, auth (`auth-gate.jsx`), Supabase (`supabase-client.js`, `org-skin.js`)
- `admin.html` + `core/admin-app.jsx` — painel superadmin (orgs, logos, convites)
- `config.example.js` → `config.js` (gitignored) — credenciais Supabase
- `supabase/migrations/001_saas_mvp.sql` — schema, RLS, storage, `accept_invite`
- `marcas/iar/` — templates, ícones, assets, registry
- `marcas/ofmj/` — templates, assets, uploads, registry + tweaks
- `marcas/ofmj/canvas.html` — canvas Figma-like (visão panorâmica dos templates OFMJ; botão "Canvas ↗" na top-bar quando marca activa = OFMJ)

Pastas legadas: [PASTOR/editor-iar](../PASTOR/editor-iar/) e [PRODUTOR-CONTEUDO/editor-posts](../PRODUTOR-CONTEUDO/editor-posts/) redireccionam para aqui.
