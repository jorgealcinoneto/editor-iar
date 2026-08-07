-- Dev user: dev@local.test / dev123
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) VALUES (
  'a0000000-0000-4000-8000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'dev@local.test',
  crypt('dev123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  'a0000000-0000-4000-8000-000000000002',
  'a0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  '{"sub":"a0000000-0000-4000-8000-000000000001","email":"dev@local.test"}'::jsonb,
  'email', NOW(), NOW(), NOW()
) ON CONFLICT DO NOTHING;

-- catalog_id escolhe o catálogo de templates em runtime (core/org-skin.js:
-- marcaIdForCatalog). 'church-v1' → marcas/iar, 'reconciliador-v1' → marcas/reconciliador,
-- 'refugio-v1' → marcas/refugio.
INSERT INTO public.orgs (id, slug, name, handle, catalog_id, theme) VALUES
  (
    'b0000000-0000-4000-8000-000000000001',
    'iar',
    'Igreja Anglicana Rio',
    '@igrejaanglicanario',
    'church-v1',
    '{"paper":"#F5EFE6","ink":"#1C2A3A","accent":"#1A52D6","accentSoft":"#4978E3","ambar":"#C99B6B","marinho":"#0E2A47","fontHeading":"Cormorant Garamond","fontBody":"DM Sans"}'::jsonb
  ),
  (
    'b0000000-0000-4000-8000-000000000002',
    'igreja-teste',
    'Igreja Anglicana Teste',
    '@igreja.teste',
    'church-v1',
    '{"paper":"#F5EFE6","ink":"#1C2A3A","accent":"#1A52D6","accentSoft":"#4978E3","ambar":"#C99B6B","marinho":"#0E2A47","fontHeading":"Cormorant Garamond","fontBody":"DM Sans"}'::jsonb
  ),
  (
    'b0000000-0000-4000-8000-000000000003',
    'refugio',
    'Comunidade Anglicana Refúgio',
    '@anglicana_refugio',
    'refugio-v1',
    '{"paper":"#F5F1E4","ink":"#4A5B45","marinho":"#4A5B45","accent":"#A7CF9A","accentSoft":"#C5E0BB","ambar":"#E0A85E","fontHeading":"Fraunces","fontBody":"Space Grotesk"}'::jsonb
  ),
  (
    'b0000000-0000-4000-8000-000000000004',
    'reconciliador',
    'Igreja Anglicana do Reconciliador',
    '@anglicanadoreconciliador',
    'reconciliador-v1',
    '{"paper":"#F7F5F1","ink":"#1C232F","marinho":"#1F2B45","accent":"#B6956A","accentSoft":"#D0B591","ambar":"#93744E","fontHeading":"Cinzel","fontBody":"DM Sans"}'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.org_members (org_id, user_id, role) VALUES
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'superadmin'),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'superadmin'),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'superadmin'),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'superadmin')
ON CONFLICT DO NOTHING;

-- GoTrue scans token columns as non-null strings
UPDATE auth.users SET
  confirmation_token = COALESCE(confirmation_token, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  recovery_token = COALESCE(recovery_token, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, '')
WHERE id = 'a0000000-0000-4000-8000-000000000001';
