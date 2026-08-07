-- Members upload field assets; gallery remains superadmin-only
drop policy if exists org_assets_write_superadmin on public.org_assets;

create policy org_assets_insert_upload_member on public.org_assets
  for insert
  with check (
    kind = 'upload'
    and public.is_org_member(org_id)
  );

create policy org_assets_insert_gallery_superadmin on public.org_assets
  for insert
  with check (
    kind = 'gallery'
    and public.is_superadmin()
  );

create policy org_assets_update_superadmin on public.org_assets
  for update
  using (public.is_superadmin())
  with check (public.is_superadmin());

create policy org_assets_delete_superadmin on public.org_assets
  for delete
  using (public.is_superadmin());

drop policy if exists org_assets_storage_write on storage.objects;

create policy org_assets_storage_write_superadmin on storage.objects
  for all
  using (bucket_id = 'org-assets' and public.is_superadmin())
  with check (bucket_id = 'org-assets' and public.is_superadmin());

create policy org_assets_storage_write_member_upload on storage.objects
  for insert
  with check (
    bucket_id = 'org-assets'
    and public.is_org_member((split_part(name, '/', 1))::uuid)
    and split_part(name, '/', 2) = 'upload'
  );
