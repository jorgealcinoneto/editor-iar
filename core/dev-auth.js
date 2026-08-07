(function () {
  window.devAutoLogin = async function (supabase) {
    if (!window.LOCAL_DEV || !window.DEV_AUTH) return null;
    const { data: s } = await supabase.auth.getSession();
    if (s?.session) return s.session;
    const { email, password } = window.DEV_AUTH;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error('Dev login falhou: ' + error.message + ' — corre supabase db reset');
    return data.session;
  };
})();
