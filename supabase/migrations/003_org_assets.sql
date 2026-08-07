-- Org-scoped gallery/upload metadata + storage bucket
create table public.org_assets (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  kind text not null check (kind in ('gallery', 'upload')),
  storage_path text not null,
  url text not null,
  label text not null default '',
  created_at timestamptz not null default now()
);

create index org_assets_org_kind_idx on public.org_assets (org_id, kind);

alter table public.org_assets enable row level security;

create policy org_assets_select_member on public.org_assets for select
  using (public.is_org_member(org_id) or public.is_superadmin());

create policy org_assets_write_superadmin on public.org_assets for all
  using (public.is_superadmin())
  with check (public.is_superadmin());

grant select, insert, update, delete on table public.org_assets to authenticated, service_role;

insert into storage.buckets (id, name, public)
values ('org-assets', 'org-assets', true)
on conflict (id) do nothing;

create policy org_assets_storage_read on storage.objects for select
  using (
    bucket_id = 'org-assets'
    and (
      public.is_org_member((split_part(name, '/', 1))::uuid)
      or public.is_superadmin()
    )
  );

create policy org_assets_storage_write on storage.objects for all
  using (bucket_id = 'org-assets' and public.is_superadmin())
  with check (bucket_id = 'org-assets' and public.is_superadmin());
