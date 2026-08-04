-- White-label SaaS MVP schema
create extension if not exists "pgcrypto";

create table public.orgs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  handle text not null default '',
  logo_url text,
  catalog_id text not null default 'church-v1',
  theme jsonb not null default '{
    "paper":"#F5EFE6","ink":"#1C2A3A","accent":"#1A52D6",
    "accentSoft":"#4978E3","ambar":"#C99B6B","marinho":"#0E2A47"
  }'::jsonb,
  created_at timestamptz not null default now()
);

create table public.org_members (
  org_id uuid not null references public.orgs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('superadmin', 'member')),
  primary key (org_id, user_id)
);

create table public.invites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  email text not null,
  token text not null unique default encode(gen_random_bytes(16), 'hex'),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'expired')),
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now()
);

create index invites_email_idx on public.invites (lower(email));
create index org_members_user_idx on public.org_members (user_id);

create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.org_members m
    where m.user_id = auth.uid() and m.role = 'superadmin'
  );
$$;

create or replace function public.is_org_member(oid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.org_members m
    where m.user_id = auth.uid() and m.org_id = oid
  );
$$;

alter table public.orgs enable row level security;
alter table public.org_members enable row level security;
alter table public.invites enable row level security;

create policy orgs_select_member on public.orgs for select
  using (public.is_org_member(id) or public.is_superadmin());

create policy orgs_write_superadmin on public.orgs for all
  using (public.is_superadmin())
  with check (public.is_superadmin());

create policy members_select_own on public.org_members for select
  using (user_id = auth.uid() or public.is_superadmin());

create policy members_write_superadmin on public.org_members for all
  using (public.is_superadmin())
  with check (public.is_superadmin());

create policy invites_select_superadmin on public.invites for select
  using (public.is_superadmin());

create policy invites_write_superadmin on public.invites for all
  using (public.is_superadmin())
  with check (public.is_superadmin());

-- Storage bucket (run in SQL editor; create bucket org-logos as public read)
insert into storage.buckets (id, name, public)
values ('org-logos', 'org-logos', true)
on conflict (id) do nothing;

create policy org_logos_public_read on storage.objects for select
  using (bucket_id = 'org-logos');

create policy org_logos_superadmin_write on storage.objects for all
  using (bucket_id = 'org-logos' and public.is_superadmin())
  with check (bucket_id = 'org-logos' and public.is_superadmin());

create or replace function public.accept_invite(invite_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  inv public.invites%rowtype;
begin
  select * into inv from public.invites
  where token = invite_token and status = 'pending' and expires_at > now();
  if not found then raise exception 'invalid_invite'; end if;
  if lower(inv.email) <> lower(auth.jwt()->>'email') then raise exception 'email_mismatch'; end if;
  insert into public.org_members (org_id, user_id, role)
  values (inv.org_id, auth.uid(), 'member')
  on conflict do nothing;
  update public.invites set status = 'accepted' where id = inv.id;
  return inv.org_id;
end;
$$;
grant execute on function public.accept_invite(text) to authenticated;
