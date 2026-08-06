(function () {
  window.formatAuthLoginError = function formatAuthLoginError(err) {
    const raw = err?.message || String(err);
    if (/rate limit|over_email_send_rate_limit/i.test(raw)) {
      return {
        message: 'Limite de emails atingido no Supabase (SMTP partilhado do free tier).',
        hint: 'Espera 30–60 min antes de tentar outra vez. Em dev, usa sempre o mesmo host (localhost ou 127.0.0.1) — se já entraste no editor, abre o admin no mesmo endereço sem pedir novo email. Para produção, configura SMTP próprio em Supabase → Authentication → SMTP.',
      };
    }
    return { message: raw, hint: null };
  };
})();
