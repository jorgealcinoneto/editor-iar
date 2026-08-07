-- PostgREST roles need explicit table grants (Supabase local default: auto_expose off)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.orgs TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.org_members TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.invites TO authenticated, service_role;
