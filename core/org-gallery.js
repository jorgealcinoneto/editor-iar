(function (global) {
  async function loadOrgGallery(supabase, orgId) {
    if (!orgId) { global.ORG_GALLERY = []; return []; }
    const { data, error } = await supabase
      .from('org_assets')
      .select('id, url, label, kind, storage_path')
      .eq('org_id', orgId)
      .eq('kind', 'gallery')
      .order('created_at', { ascending: false });
    if (error) throw error;
    global.ORG_GALLERY = data || [];
    return global.ORG_GALLERY;
  }

  async function uploadOrgAsset(supabase, orgId, file, kind) {
    const ext = (file.name.split('.').pop() || 'png').toLowerCase();
    const path = `${orgId}/${kind}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('org-assets')
      .upload(path, file, { upsert: false, contentType: file.type || 'image/png' });
    if (upErr) throw upErr;
    const { data: pub } = supabase.storage.from('org-assets').getPublicUrl(path);
    const url = pub?.publicUrl || '';
    const { data, error } = await supabase
      .from('org_assets')
      .insert({ org_id: orgId, kind, storage_path: path, url, label: file.name })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function deleteOrgAsset(supabase, asset) {
    await supabase.storage.from('org-assets').remove([asset.storage_path]);
    const { error } = await supabase.from('org_assets').delete().eq('id', asset.id);
    if (error) throw error;
  }

  global.loadOrgGallery = loadOrgGallery;
  global.uploadOrgAsset = uploadOrgAsset;
  global.deleteOrgAsset = deleteOrgAsset;
})(window);
