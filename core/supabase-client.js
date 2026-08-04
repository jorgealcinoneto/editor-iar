(function (global) {
  let client = null;
  function getSupabase() {
    if (client) return client;
    const url = global.SUPABASE_URL;
    const key = global.SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Falta config.js (SUPABASE_URL / SUPABASE_ANON_KEY)');
    if (!global.supabase?.createClient) throw new Error('SDK Supabase não carregado');
    client = global.supabase.createClient(url, key);
    return client;
  }
  global.getSupabase = getSupabase;
})(typeof window !== 'undefined' ? window : globalThis);
