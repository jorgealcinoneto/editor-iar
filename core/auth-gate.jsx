(function () {
  const { useState, useEffect, useCallback, useRef } = React;
  const LS_ORG = 'ed:orgActiva';

  function cleanInviteFromUrl() {
    const params = new URLSearchParams(window.location.search);
    params.delete('invite');
    const qs = params.toString();
    const clean = window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash;
    window.history.replaceState({}, '', clean);
  }

  function inviteErrorInfo(err) {
    const raw = err?.message || String(err);
    if (/invalid_invite/i.test(raw)) {
      return { reason: 'invalid_invite', message: 'Este convite é inválido ou já expirou.' };
    }
    if (/email_mismatch/i.test(raw)) {
      return { reason: 'email_mismatch', message: 'Este convite foi enviado para outro email. Inicia sessão com o email convidado.' };
    }
    return { reason: 'generic', message: 'Não foi possível aceitar o convite. Tenta novamente ou contacta o administrador.' };
  }

  function AuthGate({ onReady }) {
    const [state, setState] = useState({ phase: 'loading' });
    const processedRef = useRef(null);

    const loadMemberships = useCallback(async (supabase, user, inviteError) => {
      const { data, error } = await supabase
        .from('org_members')
        .select('org_id, role, orgs(*)')
        .eq('user_id', user.id);
      if (error) {
        setState({ phase: 'error', message: error.message, inviteError });
        return;
      }
      if (!data || data.length === 0) {
        setState({ phase: 'no-org', inviteError });
        return;
      }
      const savedId = localStorage.getItem(LS_ORG);
      const row = data.find((r) => r.org_id === savedId) || data[0];
      window.ORG_MEMBERSHIPS = data;
      window.activateOrg(row.orgs, row.role);
      if (window.SAAS_MODE && typeof window.loadOrgGallery === 'function') {
        try { await window.loadOrgGallery(supabase, row.orgs.id); } catch (e) { console.error('gallery', e); }
      }
      setState({ phase: 'ready', inviteError });
    }, []);

    const handleSession = useCallback(async (supabase, user) => {
      const params = new URLSearchParams(window.location.search);
      const inviteToken = params.get('invite');
      const sessionKey = `${user.id}:${inviteToken || ''}`;
      if (processedRef.current === sessionKey) return;
      processedRef.current = sessionKey;

      let inviteError = null;
      if (inviteToken) {
        try {
          const { error: rpcError } = await supabase.rpc('accept_invite', { invite_token: inviteToken });
          if (rpcError) {
            console.error('accept_invite falhou', rpcError);
            inviteError = inviteErrorInfo(rpcError);
          }
        } finally {
          cleanInviteFromUrl();
        }
      }
      await loadMemberships(supabase, user, inviteError);
    }, [loadMemberships]);

    useEffect(() => {
      let supabase;
      try {
        supabase = window.getSupabase();
      } catch (err) {
        setState({ phase: 'error', message: err.message || String(err) });
        return;
      }
      let sub;
      (async () => {
        try {
          await window.devAutoLogin(supabase);
        } catch (err) {
          setState({ phase: 'error', message: err.message });
          return;
        }
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
          if (!session) {
            processedRef.current = null;
            setState({ phase: 'login' });
            return;
          }
          setTimeout(() => handleSession(supabase, session.user), 0);
        });
        sub = data;
      })();
      return () => sub?.subscription?.unsubscribe();
    }, [handleSession]);

    useEffect(() => {
      if (state.phase === 'ready') onReady();
    }, [state.phase, onReady]);

    if (state.phase === 'ready') return null;

    return (
      <div className="ag-wrap">
        <style>{`
          .ag-wrap {
            min-height: 100dvh; min-height: 100vh;
            display: flex; align-items: center; justify-content: center;
            font-family: var(--ed-font-ui, Inter, sans-serif); background: var(--ed-paper, #f5f1e8);
            color: var(--ed-ink, #1a1612);
            padding: 24px 16px;
            padding-bottom: max(24px, env(safe-area-inset-bottom, 0px));
            box-sizing: border-box;
          }
          .ag-card {
            width: 100%; max-width: 360px; padding: 32px; border-radius: var(--ed-radius, 10px);
            background: var(--ed-card, #fff); border: 1px solid var(--ed-line, rgba(0,0,0,0.1));
            box-sizing: border-box;
          }
          .ag-title { font-family: var(--ed-font-serif, serif); font-size: 22px; margin: 0 0 4px; }
          .ag-sub { font-size: 13px; color: var(--ed-ink-soft, #5b524a); margin: 0 0 20px; line-height: 1.5; }
          .ag-label {
            display: block; font-family: var(--ed-font-mono, monospace); font-size: 10px;
            letter-spacing: 0.12em; text-transform: uppercase; color: var(--ed-ink-soft, #5b524a);
            margin-bottom: 6px;
          }
          .ag-input {
            width: 100%; padding: 12px 14px; font: inherit; font-size: 16px;
            border: 1px solid var(--ed-line, rgba(0,0,0,0.1)); border-radius: var(--ed-radius-sm, 6px);
            background: var(--ed-paper, #f5f1e8); color: var(--ed-ink, #1a1612); margin-bottom: 14px;
            box-sizing: border-box;
          }
          .ag-input:focus { outline: 0; border-color: var(--ed-accent, #722f37); }
          .ag-error { font-size: 12.5px; color: var(--ed-accent, #722f37); margin: 0 0 14px; line-height: 1.4; }
          .ag-hint { font-size: 12px; color: var(--ed-ink-soft, #5b524a); margin-top: 14px; line-height: 1.4; }
          .ag-card .ed-btn, .ag-card button[type="submit"] {
            width: 100%; min-height: 44px; justify-content: center;
          }
          @media (max-width: 420px) {
            .ag-card { padding: 24px 18px; }
            .ag-title { font-size: 20px; }
          }
        `}</style>
        <div className="ag-card">
          {state.phase === 'loading' && <p className="ag-sub">A verificar sessão…</p>}
          {state.phase === 'login' && <LoginForm />}
          {state.phase === 'no-org' && <NoOrgMessage inviteError={state.inviteError} />}
          {state.phase === 'error' && <ErrorMessage message={state.message} />}
        </div>
      </div>
    );
  }

  function LoginForm() {
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState(null);

    if (window.LOCAL_DEV) {
      return (
        <>
          <h1 className="ag-title">Modo dev</h1>
          <p className="ag-sub">Dev mode: recarrega — auto-login activo.</p>
        </>
      );
    }

    async function handleSubmit(e) {
      e.preventDefault();
      setError(null);
      setSending(true);
      try {
        const supabase = window.getSupabase();
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: window.location.href },
        });
        if (otpError) throw otpError;
        setSent(true);
      } catch (err) {
        setError(window.formatAuthLoginError?.(err) || { message: err.message || String(err), hint: null });
      } finally {
        setSending(false);
      }
    }

    if (sent) {
      return (
        <>
          <h1 className="ag-title">Verifica o teu email</h1>
          <p className="ag-sub">Enviámos um link de acesso para <strong>{email}</strong>.</p>
        </>
      );
    }

    return (
      <form onSubmit={handleSubmit}>
        <h1 className="ag-title">Entrar</h1>
        <p className="ag-sub">Recebe um link de acesso por email — sem palavra-passe.</p>
        {error && (
          <>
            <p className="ag-error">{error.message}</p>
            {error.hint && <p className="ag-hint">{error.hint}</p>}
          </>
        )}
        <label className="ag-label" htmlFor="ag-email">Email</label>
        <input
          id="ag-email"
          className="ag-input"
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@exemplo.com"
        />
        <button type="submit" className="ed-btn ed-btn--primary" disabled={sending || !email}>
          {sending ? 'A enviar…' : 'Enviar link de acesso'}
        </button>
      </form>
    );
  }

  function NoOrgMessage({ inviteError }) {
    async function handleSignOut() {
      try {
        await window.getSupabase().auth.signOut();
      } finally {
        window.location.reload();
      }
    }
    return (
      <>
        <h1 className="ag-title">Sem organização</h1>
        {inviteError && <p className="ag-error">{inviteError.message}</p>}
        <p className="ag-sub">A tua conta ainda não pertence a nenhuma organização. Pede um convite ao administrador.</p>
        <button type="button" className="ed-btn ed-btn--ghost" style={{ borderColor: 'var(--ed-line)', color: 'var(--ed-ink)' }} onClick={handleSignOut}>
          Sair
        </button>
      </>
    );
  }

  function ErrorMessage({ message }) {
    return (
      <>
        <h1 className="ag-title">Não foi possível iniciar</h1>
        <p className="ag-error">{message}</p>
        <p className="ag-hint">
          Confirma que <code>config.js</code> existe (copia de <code>config.example.js</code>) e que a sessão do Supabase está ativa.
        </p>
      </>
    );
  }

  window.mountAuthGate = function mountAuthGate() {
    const root = document.getElementById('root');
    if (!root || root.dataset.mounted) return;
    root.dataset.mounted = 'auth';
    const authRoot = ReactDOM.createRoot(root);
    function handleReady() {
      authRoot.unmount();
      delete root.dataset.mounted;
      window.startEditorAfterAuth();
    }
    authRoot.render(<AuthGate onReady={handleReady} />);
  };
})();
