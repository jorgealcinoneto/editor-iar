(function () {
  const { useState, useEffect, useCallback } = React;

  const GOOGLE_FONTS = [
    'Cormorant Garamond', 'EB Garamond', 'Fraunces', 'Instrument Serif', 'Cinzel',
    'DM Sans', 'Inter', 'Space Grotesk', 'Syne', 'Bricolage Grotesque',
    'Unbounded', 'JetBrains Mono', 'Anton',
  ];

  const DEFAULT_CATALOG = 'church-v1';

  /* Catálogos disponíveis vêm dos manifest.js carregados em admin.html.
     Sem eles (ou se um deles falhar) resta o default, e nenhuma org
     fica presa a um catalog_id que o editor não saiba resolver. */
  function catalogOptions() {
    const marcas = Object.values(window.MARCAS || {});
    const opts = marcas
      .filter((m) => m?.catalogId)
      .map((m) => ({ value: m.catalogId, label: `${m.name} (${m.catalogId})` }));
    return opts.length ? opts : [{ value: DEFAULT_CATALOG, label: DEFAULT_CATALOG }];
  }

  const THEME_FIELDS = [
    { key: 'paper', label: 'Papel' },
    { key: 'ink', label: 'Tinta' },
    { key: 'accent', label: 'Destaque' },
    { key: 'accentSoft', label: 'Destaque suave' },
    { key: 'ambar', label: 'Âmbar' },
    { key: 'marinho', label: 'Marinho' },
  ];

  const DEFAULT_THEME = {
    paper: '#F5EFE6', ink: '#1C2A3A', accent: '#1A52D6',
    accentSoft: '#4978E3', ambar: '#C99B6B', marinho: '#0E2A47',
    fontHeading: 'Cormorant Garamond', fontBody: 'DM Sans',
  };

  function emptyOrgForm() {
    return { id: null, slug: '', name: '', handle: '', catalogId: DEFAULT_CATALOG, theme: { ...DEFAULT_THEME } };
  }

  function orgToForm(org) {
    return {
      id: org.id,
      slug: org.slug || '',
      name: org.name || '',
      handle: org.handle || '',
      catalogId: org.catalog_id || DEFAULT_CATALOG,
      theme: { ...DEFAULT_THEME, ...(org.theme || {}) },
    };
  }

  function AdminApp() {
    const [state, setState] = useState({ phase: 'loading' });
    const [orgs, setOrgs] = useState([]);
    const [form, setForm] = useState(emptyOrgForm());
    const [logoFile, setLogoFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [inviteOrgId, setInviteOrgId] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteUrl, setInviteUrl] = useState('');
    const [invitingBusy, setInvitingBusy] = useState(false);
    const [gallery, setGallery] = useState([]);
    const [galleryBusy, setGalleryBusy] = useState(false);

    const loadOrgs = useCallback(async (supabase) => {
      const { data, error } = await supabase.from('orgs').select('*').order('created_at', { ascending: true });
      if (error) { setMessage({ type: 'error', text: error.message }); return; }
      setOrgs(data || []);
      setInviteOrgId((prev) => prev || data?.[0]?.id || '');
    }, []);

    const checkAccess = useCallback(async (supabase, user) => {
      const { data, error } = await supabase
        .from('org_members')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'superadmin')
        .limit(1);
      if (error) { setState({ phase: 'error', message: error.message }); return; }
      if (!data || data.length === 0) { setState({ phase: 'denied' }); return; }
      await loadOrgs(supabase);
      setState({ phase: 'ready', user });
    }, [loadOrgs]);

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
          if (!session) { setState({ phase: 'login' }); return; }
          setTimeout(() => checkAccess(supabase, session.user), 0);
        });
        sub = data;
      })();
      return () => sub?.subscription?.unsubscribe();
    }, [checkAccess]);

    async function startEdit(org) {
      setForm(orgToForm(org));
      setLogoFile(null);
      setMessage(null);
      if (!org.id || typeof window.loadOrgGallery !== 'function') {
        setGallery([]);
        return;
      }
      try {
        const supabase = window.getSupabase();
        const items = await window.loadOrgGallery(supabase, org.id);
        setGallery(items || []);
      } catch (err) {
        setGallery([]);
        setMessage({ type: 'error', text: err.message || String(err) });
      }
    }

    function startNew() {
      setForm(emptyOrgForm());
      setLogoFile(null);
      setMessage(null);
      setGallery([]);
    }

    function updateField(key, value) {
      setForm((f) => ({ ...f, [key]: value }));
    }

    function updateTheme(key, value) {
      setForm((f) => ({ ...f, theme: { ...f.theme, [key]: value } }));
    }

    async function handleSave(e) {
      e.preventDefault();
      setSaving(true);
      setMessage(null);
      try {
        const supabase = window.getSupabase();
        const payload = {
          slug: form.slug.trim(),
          name: form.name.trim(),
          handle: form.handle.trim(),
          catalog_id: form.catalogId || DEFAULT_CATALOG,
          theme: form.theme,
        };
        if (form.id) payload.id = form.id;
        const { data: saved, error } = await supabase.from('orgs').upsert(payload).select().single();
        if (error) throw error;
        let org = saved;
        if (logoFile) {
          const path = `${org.id}/logo.png`;
          const { error: upErr } = await supabase.storage
            .from('org-logos')
            .upload(path, logoFile, { upsert: true, contentType: logoFile.type || 'image/png' });
          if (upErr) throw upErr;
          const { data: pub } = supabase.storage.from('org-logos').getPublicUrl(path);
          const { data: updated, error: updErr } = await supabase
            .from('orgs')
            .update({ logo_url: pub?.publicUrl })
            .eq('id', org.id)
            .select()
            .single();
          if (updErr) throw updErr;
          org = updated;
        }
        setMessage({ type: 'success', text: `Organização "${org.name}" guardada.` });
        setForm(orgToForm(org));
        setLogoFile(null);
        await loadOrgs(supabase);
      } catch (err) {
        setMessage({ type: 'error', text: err.message || String(err) });
      } finally {
        setSaving(false);
      }
    }

    async function handleInvite(e) {
      e.preventDefault();
      if (!inviteOrgId) return;
      setInvitingBusy(true);
      setInviteUrl('');
      setMessage(null);
      try {
        const supabase = window.getSupabase();
        const { data, error } = await supabase
          .from('invites')
          .insert({ org_id: inviteOrgId, email: inviteEmail.trim() })
          .select()
          .single();
        if (error) throw error;
        setInviteUrl(window.editorAppUrl(`invite=${data.token}`));
      } catch (err) {
        setMessage({ type: 'error', text: err.message || String(err) });
      } finally {
        setInvitingBusy(false);
      }
    }

    async function handleSignOut() {
      try { await window.getSupabase().auth.signOut(); } finally { window.location.reload(); }
    }

    async function handleGalleryUpload(e) {
      const files = Array.from(e.target.files || []);
      if (!files.length || !form.id || typeof window.uploadOrgAsset !== 'function') return;
      setGalleryBusy(true);
      setMessage(null);
      try {
        const supabase = window.getSupabase();
        for (const file of files) {
          await window.uploadOrgAsset(supabase, form.id, file, 'gallery');
        }
        const items = await window.loadOrgGallery(supabase, form.id);
        setGallery(items || []);
      } catch (err) {
        setMessage({ type: 'error', text: err.message || String(err) });
      } finally {
        setGalleryBusy(false);
        e.target.value = '';
      }
    }

    async function handleGalleryDelete(asset) {
      if (!form.id || typeof window.deleteOrgAsset !== 'function') return;
      setGalleryBusy(true);
      setMessage(null);
      try {
        const supabase = window.getSupabase();
        await window.deleteOrgAsset(supabase, asset);
        const items = await window.loadOrgGallery(supabase, form.id);
        setGallery(items || []);
      } catch (err) {
        setMessage({ type: 'error', text: err.message || String(err) });
      } finally {
        setGalleryBusy(false);
      }
    }

    return (
      <div className="adm-wrap">
        <AdminStyles />
        {state.phase === 'loading' && <p className="adm-hint">A verificar sessão…</p>}
        {state.phase === 'login' && <LoginForm />}
        {state.phase === 'denied' && <DeniedMessage onSignOut={handleSignOut} />}
        {state.phase === 'error' && <ErrorMessage message={state.message} />}
        {state.phase === 'ready' && (
          <>
            <header className="adm-header">
              <h1>Admin · Organizações</h1>
              <div className="adm-header__right">
                <span className="adm-hint">{state.user.email}</span>
                <button type="button" className="adm-btn adm-btn--ghost" onClick={handleSignOut}>Sair</button>
              </div>
            </header>

            {message && <p className={`adm-msg adm-msg--${message.type}`}>{message.text}</p>}

            <section className="adm-card">
              <h2>Organizações</h2>
              {orgs.length === 0 && <p className="adm-hint">Nenhuma organização ainda.</p>}
              {orgs.length > 0 && (
                <table className="adm-table">
                  <thead>
                    <tr><th>Logo</th><th>Nome</th><th>Slug</th><th>Handle</th><th></th></tr>
                  </thead>
                  <tbody>
                    {orgs.map((org) => (
                      <tr key={org.id}>
                        <td>{org.logo_url ? <img className="adm-logo" src={org.logo_url} alt="" /> : '—'}</td>
                        <td>{org.name}</td>
                        <td>{org.slug}</td>
                        <td>{org.handle}</td>
                        <td><button type="button" className="adm-btn adm-btn--ghost" onClick={() => startEdit(org)}>Editar</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section className="adm-card">
              <div className="adm-card__head">
                <h2>{form.id ? 'Editar organização' : 'Nova organização'}</h2>
                {form.id && <button type="button" className="adm-btn adm-btn--ghost" onClick={startNew}>+ Nova</button>}
              </div>
              <form onSubmit={handleSave} className="adm-form">
                <div className="adm-row">
                  <label className="adm-field">
                    <span>Slug</span>
                    <input type="text" required value={form.slug} onChange={(e) => updateField('slug', e.target.value)} placeholder="minha-igreja" />
                  </label>
                  <label className="adm-field">
                    <span>Nome</span>
                    <input type="text" required value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Igreja Exemplo" />
                  </label>
                  <label className="adm-field">
                    <span>Handle</span>
                    <input type="text" value={form.handle} onChange={(e) => updateField('handle', e.target.value)} placeholder="@exemplo" />
                  </label>
                  <label className="adm-field">
                    <span>Catálogo</span>
                    <select value={form.catalogId} onChange={(e) => updateField('catalogId', e.target.value)}>
                      {catalogOptions().map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="adm-theme-grid">
                  {THEME_FIELDS.map(({ key, label }) => (
                    <label key={key} className="adm-field adm-field--color">
                      <span>{label}</span>
                      <div className="adm-color-row">
                        <input
                          type="color"
                          value={/^#[0-9a-fA-F]{6}$/.test(form.theme[key]) ? form.theme[key] : '#000000'}
                          onChange={(e) => updateTheme(key, e.target.value)}
                        />
                        <input type="text" value={form.theme[key] || ''} onChange={(e) => updateTheme(key, e.target.value)} />
                      </div>
                    </label>
                  ))}
                </div>

                <div className="adm-row">
                  <label className="adm-field">
                    <span>Fonte títulos</span>
                    <select value={form.theme.fontHeading || DEFAULT_THEME.fontHeading} onChange={(e) => updateTheme('fontHeading', e.target.value)}>
                      {GOOGLE_FONTS.map((font) => <option key={font} value={font}>{font}</option>)}
                    </select>
                  </label>
                  <label className="adm-field">
                    <span>Fonte corpo</span>
                    <select value={form.theme.fontBody || DEFAULT_THEME.fontBody} onChange={(e) => updateTheme('fontBody', e.target.value)}>
                      {GOOGLE_FONTS.map((font) => <option key={font} value={font}>{font}</option>)}
                    </select>
                  </label>
                </div>

                <label className="adm-field">
                  <span>Logo (PNG)</span>
                  <input type="file" accept="image/png,image/jpeg" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                </label>

                {form.id && (
                  <div className="adm-gallery">
                    <h3>Galeria</h3>
                    <label className="adm-field">
                      <span>Adicionar imagens</span>
                      <input type="file" accept="image/*" multiple disabled={galleryBusy} onChange={handleGalleryUpload} />
                    </label>
                    {gallery.length === 0 && <p className="adm-hint">Nenhuma imagem na galeria.</p>}
                    {gallery.length > 0 && (
                      <ul className="adm-gallery-list">
                        {gallery.map((asset) => (
                          <li key={asset.id} className="adm-gallery-item">
                            <img className="adm-gallery-thumb" src={asset.url} alt={asset.label || ''} />
                            <span className="adm-gallery-label">{asset.label || asset.url}</span>
                            <button type="button" className="adm-btn adm-btn--ghost" disabled={galleryBusy} onClick={() => handleGalleryDelete(asset)}>Remover</button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <button type="submit" className="adm-btn adm-btn--primary" disabled={saving}>
                  {saving ? 'A guardar…' : 'Guardar organização'}
                </button>
              </form>
            </section>

            <section className="adm-card">
              <h2>Convidar</h2>
              <form onSubmit={handleInvite} className="adm-form adm-form--inline">
                <label className="adm-field">
                  <span>Organização</span>
                  <select value={inviteOrgId} onChange={(e) => setInviteOrgId(e.target.value)}>
                    {orgs.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
                  </select>
                </label>
                <label className="adm-field">
                  <span>Email</span>
                  <input type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="pessoa@exemplo.com" />
                </label>
                <button type="submit" className="adm-btn adm-btn--primary" disabled={invitingBusy || !inviteOrgId}>
                  {invitingBusy ? 'A convidar…' : 'Convidar'}
                </button>
              </form>
              {inviteUrl && (
                <p className="adm-invite-url">
                  Link do convite: <code>{inviteUrl}</code>
                </p>
              )}
            </section>
          </>
        )}
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
        <div className="adm-card adm-card--narrow">
          <h1>Modo dev</h1>
          <p className="adm-hint">Dev mode: recarrega — auto-login activo.</p>
        </div>
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
        <div className="adm-card adm-card--narrow">
          <h1>Verifica o teu email</h1>
          <p className="adm-hint">Enviámos um link de acesso para <strong>{email}</strong>.</p>
        </div>
      );
    }

    return (
      <div className="adm-card adm-card--narrow">
        <form onSubmit={handleSubmit} className="adm-form">
          <h1>Admin · Entrar</h1>
          <p className="adm-hint">
            Já tens sessão no editor? Abre o admin no <strong>mesmo host</strong> (só <code>localhost</code> ou só <code>127.0.0.1</code> — não mistures).
          </p>
          {error && (
            <>
              <p className="adm-msg adm-msg--error">{error.message}</p>
              {error.hint && <p className="adm-hint">{error.hint}</p>}
            </>
          )}
          <label className="adm-field">
            <span>Email</span>
            <input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@exemplo.com" />
          </label>
          <button type="submit" className="adm-btn adm-btn--primary" disabled={sending || !email}>
            {sending ? 'A enviar…' : 'Enviar link de acesso'}
          </button>
        </form>
      </div>
    );
  }

  function DeniedMessage({ onSignOut }) {
    return (
      <div className="adm-card adm-card--narrow">
        <h1>Acesso negado</h1>
        <p className="adm-hint">A tua conta não tem permissão de superadmin.</p>
        <button type="button" className="adm-btn adm-btn--ghost" onClick={onSignOut}>Sair</button>
      </div>
    );
  }

  function ErrorMessage({ message }) {
    return (
      <div className="adm-card adm-card--narrow">
        <h1>Não foi possível iniciar</h1>
        <p className="adm-msg adm-msg--error">{message}</p>
        <p className="adm-hint">Confirma que <code>config.js</code> existe (copia de <code>config.example.js</code>).</p>
      </div>
    );
  }

  function AdminStyles() {
    return (
      <style>{`
        .adm-wrap { max-width: 920px; margin: 0 auto; padding: 32px 24px 60px; }
        .adm-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .adm-header h1 { font-size: 20px; margin: 0; }
        .adm-header__right { display: flex; align-items: center; gap: 12px; }
        .adm-hint { font-size: 13px; color: #5b524a; }
        .adm-card { background: #fff; border: 1px solid rgba(26,22,18,0.1); border-radius: 10px; padding: 22px; margin-bottom: 20px; }
        .adm-card--narrow { max-width: 380px; margin: 60px auto; }
        .adm-card h1 { font-size: 20px; margin: 0 0 12px; }
        .adm-card h2 { font-size: 15px; margin: 0 0 14px; }
        .adm-card__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .adm-card__head h2 { margin: 0; }
        .adm-msg { padding: 10px 14px; border-radius: 8px; font-size: 13px; margin: 0 0 16px; }
        .adm-msg--success { background: rgba(16,120,60,0.1); color: #10783c; }
        .adm-msg--error { background: rgba(114,47,55,0.1); color: #722f37; }
        .adm-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .adm-table th, .adm-table td { text-align: left; padding: 8px 10px; border-bottom: 1px solid rgba(26,22,18,0.08); }
        .adm-logo { width: 28px; height: 28px; object-fit: cover; border-radius: 4px; display: block; }
        .adm-form { display: flex; flex-direction: column; gap: 14px; }
        .adm-form--inline { flex-direction: row; align-items: flex-end; flex-wrap: wrap; gap: 12px; }
        .adm-row { display: flex; gap: 12px; flex-wrap: wrap; }
        .adm-row .adm-field { flex: 1; min-width: 160px; }
        .adm-field { display: flex; flex-direction: column; gap: 5px; font-size: 12px; color: #5b524a; }
        .adm-field input[type="text"], .adm-field input[type="email"], .adm-field select {
          font: inherit; font-size: 13.5px; padding: 8px 11px; border: 1px solid rgba(26,22,18,0.1);
          border-radius: 6px; background: #f5f1e8; color: #1a1612;
        }
        .adm-field input:focus, .adm-field select:focus { outline: 0; border-color: #722f37; }
        .adm-theme-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .adm-color-row { display: flex; gap: 6px; align-items: center; }
        .adm-color-row input[type="color"] { width: 32px; height: 32px; padding: 0; border: 1px solid rgba(26,22,18,0.1); border-radius: 6px; }
        .adm-color-row input[type="text"] { flex: 1; font: inherit; font-size: 13px; padding: 7px 9px; border: 1px solid rgba(26,22,18,0.1); border-radius: 6px; background: #f5f1e8; color: #1a1612; }
        .adm-invite-url { font-size: 13px; margin-top: 12px; word-break: break-all; }
        .adm-gallery h3 { font-size: 14px; margin: 0 0 10px; }
        .adm-gallery-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
        .adm-gallery-item { display: flex; align-items: center; gap: 10px; font-size: 13px; }
        .adm-gallery-thumb { width: 48px; height: 48px; object-fit: cover; border-radius: 4px; flex-shrink: 0; }
        .adm-gallery-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .adm-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 999px; font: inherit; font-weight: 500; font-size: 13px; border: 1px solid transparent; cursor: pointer; }
        .adm-btn:disabled { opacity: 0.55; cursor: progress; }
        .adm-btn--primary { background: #722f37; color: #fff; }
        .adm-btn--primary:hover:not(:disabled) { background: #5e242b; }
        .adm-btn--ghost { background: transparent; color: #1a1612; border-color: rgba(26,22,18,0.2); }
        .adm-btn--ghost:hover { background: rgba(26,22,18,0.05); }
      `}</style>
    );
  }

  (async function () {
    if (window.__configReady) await window.__configReady;
    ReactDOM.createRoot(document.getElementById('root')).render(<AdminApp />);
  })();
})();
