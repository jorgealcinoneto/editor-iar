const { useState, useRef, useEffect, useCallback, useMemo } = React;
const Field = window.EditorField;

const LS_MARCA = 'ed:marcaActiva';

function getMarca(id) {
  return window.MARCAS?.[id] || null;
}

/* Chamado dentro dos inicializadores de estado (1.º render), altura em que
   os manifest.js já correram — não pode ser uma const de topo. */
function getMarcaIds() {
  return Object.keys(window.MARCAS || {});
}

function saasOrgId() {
  return window.SAAS_MODE ? window.ORG_MEMBERSHIP?.orgId : null;
}

function stateKey(marcaId, orgId) {
  const oid = orgId ?? saasOrgId();
  return oid ? `ed:${oid}:state` : `ed:${marcaId}:state`;
}

function loadMarcaState(marcaId, orgId) {
  try {
    const raw = localStorage.getItem(stateKey(marcaId, orgId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveMarcaState(marcaId, state, orgId) {
  try {
    localStorage.setItem(stateKey(marcaId, orgId), JSON.stringify(state));
  } catch {}
}

function seedContents(marca) {
  const seed = {};
  marca.templates.forEach((t) => { seed[t.id] = { ...t.defaults }; });
  return seed;
}

function buildMarcaContents(marcaId, orgId) {
  const m = getMarca(marcaId);
  if (!m) return {};
  const seed = seedContents(m);
  const stored = loadMarcaState(marcaId, orgId);
  if (!stored?.contents) return seed;
  const base = m.assetBase || `marcas/${marcaId}/`;
  const merged = { ...seed };
  Object.keys(stored.contents).forEach((tplId) => {
    const c = stored.contents[tplId];
    if (!c || typeof c !== 'object') return;
    const next = { ...seed[tplId], ...c };
    Object.keys(next).forEach((k) => {
      const v = next[k];
      if (typeof v === 'string' && /marcas\/[^/]+\//.test(v) && !v.includes(base)) {
        next[k] = seed[tplId]?.[k];
      }
    });
    merged[tplId] = next;
  });
  return merged;
}

function buildMarcaTweaks(marcaId, orgId) {
  const m = getMarca(marcaId);
  if (!m?.allowTweaks) return null;
  const stored = loadMarcaState(marcaId, orgId);
  return { ...m.tweakDefaults, ...(stored?.tweak || {}) };
}

/* Só uma folha de marca activa de cada vez: os tokens de :root e as regras
   .post/.t-* não são scoped, portanto duas em simultâneo colidem. */
function applyMarcaStyles(marcaId) {
  getMarcaIds().forEach((id) => {
    const link = document.getElementById(`marca-css-${id}`);
    if (link) link.disabled = marcaId !== id;
  });
  const fmjCss = document.getElementById('fmj-styles');
  if (fmjCss) fmjCss.disabled = marcaId !== 'ofmj';
}

function PreviewIar({ tpl, content, tweak, scale, marca }) {
  const tweakClasses = [
    !window.SAAS_MODE && tweak?.palette ? `paleta-${tweak.palette}` : '',
    !window.SAAS_MODE && tweak?.accent ? `acento-${tweak.accent}` : '',
  ].filter(Boolean).join(' ');
  const org = window.SAAS_MODE ? window.ORG_SKIN?.theme : null;
  const pal = marca?.palettes?.[tweak?.palette];
  const acc = marca?.accents?.[tweak?.accent];
  const paper = pal?.paper || org?.paper;
  const ink = pal?.ink || org?.ink || org?.marinho;
  const accent = acc?.color || org?.accent;
  const themeVars = {
    ...(paper ? { '--papel': paper } : {}),
    ...(ink ? { '--grafite': ink, '--marinho': ink, '--navy': ink } : {}),
    ...(accent ? {
      '--estola': accent,
      '--gold': accent,
      '--estola-claro': accent,
      '--gold-claro': accent,
      '--ambar': accent,
      '--gold-escuro': accent,
    } : {}),
    ...(org?.fontHeading ? {
      '--font-serif': org.fontHeading,
      '--font-display': org.fontHeading,
      '--font-script': org.fontHeading,
    } : {}),
    ...(org?.fontBody ? { '--font-sans': org.fontBody, '--font-wide': org.fontBody } : {}),
  };
  return (
    <div className={`post ${tweakClasses}`} style={{ width: tpl.w * scale, height: tpl.h * scale }}>
      <div
        className="post-inner"
        data-export="root"
        style={{
          width: tpl.w,
          height: tpl.h,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          '--fscale': tweak?.fontScale || 1,
          ...themeVars,
        }}
      >
        {tpl.render(content, tweak)}
      </div>
    </div>
  );
}

function PreviewOfmj({ tpl, content, tweak, scale }) {
  return (
    <div className="ed-preview-frame" style={{ width: tpl.w * scale, height: tpl.h * scale }}>
      <div
        className="ed-preview-inner"
        data-export="root"
        style={{
          width: tpl.w,
          height: tpl.h,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {tpl.render(content, tweak)}
      </div>
    </div>
  );
}

function TweaksPanel({ tweak, onChange, marca }) {
  const controls = marca.tweakControls || ['palette', 'accent', 'layout', 'grid', 'watermark'];
  const has = (c) => controls.includes(c);
  const palettes = Object.keys(marca.palettes || {});
  const accents = Object.keys(marca.accents || {});
  const layouts = [
    { v: 'left', label: 'Esq.' },
    { v: 'centered', label: 'Centro' },
    { v: 'grid', label: 'Grade' },
  ];
  const fontScales = [
    { v: 0.9, label: 'A−' },
    { v: 1, label: 'A' },
    { v: 1.1, label: 'A+' },
    { v: 1.25, label: 'A++' },
  ];
  const swatchFor = (k) => {
    const p = marca.palettes[k];
    return [p.paper, p.ink, marca.accents[tweak.accent]?.color || Object.values(marca.accents || {})[0]?.color || '#722f37'];
  };
  return (
    <div className="ed-tweaks">
      <div className="ed-tweaks__title">Acabamento</div>
      {has('palette') && palettes.length > 0 && (
        <div className="ed-tweaks__group">
          <div className="ed-tweaks__label">Paleta</div>
          <div className="ed-swatches">
            {palettes.map((k) => {
              const sw = swatchFor(k);
              return (
                <button
                  key={k}
                  type="button"
                  className={tweak.palette === k ? 'is-active' : ''}
                  onClick={() => onChange('palette', k)}
                  title={marca.palettes[k].label}
                >
                  <span style={{ background: sw[0] }} />
                  <span style={{ background: sw[1] }} />
                  <span style={{ background: sw[2] }} />
                </button>
              );
            })}
          </div>
        </div>
      )}
      {has('accent') && accents.length > 0 && (
        <div className="ed-tweaks__group">
          <div className="ed-tweaks__label">Acento</div>
          <div className="ed-swatches ed-swatches--single">
            {accents.map((k) => (
              <button
                key={k}
                type="button"
                className={tweak.accent === k ? 'is-active' : ''}
                onClick={() => onChange('accent', k)}
                title={marca.accents[k].label}
                style={{ background: marca.accents[k].color }}
              />
            ))}
          </div>
        </div>
      )}
      {has('fontScale') && (
        <div className="ed-tweaks__group">
          <div className="ed-tweaks__label">Fonte</div>
          <div className="ed-radio">
            {fontScales.map((opt) => (
              <button
                key={opt.v}
                type="button"
                className={(tweak.fontScale || 1) === opt.v ? 'is-active' : ''}
                onClick={() => onChange('fontScale', opt.v)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {has('layout') && (
        <div className="ed-tweaks__group">
          <div className="ed-tweaks__label">Layout</div>
          <div className="ed-radio">
            {layouts.map((opt) => (
              <button
                key={opt.v}
                type="button"
                className={tweak.layout === opt.v ? 'is-active' : ''}
                onClick={() => onChange('layout', opt.v)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {(has('grid') || has('watermark')) && (
        <div className="ed-tweaks__group">
          {has('grid') && (
            <label className="ed-toggle">
              <input type="checkbox" checked={!!tweak.showGrid} onChange={(e) => onChange('showGrid', e.target.checked)} />
              <span>Grid</span>
            </label>
          )}
          {has('watermark') && (
            <label className="ed-toggle">
              <input type="checkbox" checked={!!tweak.watermark} onChange={(e) => onChange('watermark', e.target.checked)} />
              <span>Marca d&apos;água</span>
            </label>
          )}
        </div>
      )}
    </div>
  );
}

function GalleryGrid({ photos, currentValue, onPick }) {
  if (!photos.length) return null;
  return (
    <div className="ed-preset">
      {photos.map((src) => (
        <button
          key={src}
          type="button"
          className={currentValue === src ? 'is-active' : ''}
          onClick={() => onPick(src)}
          title={src.split('/').pop()}
        >
          <img src={src} alt="" loading="lazy" />
        </button>
      ))}
    </div>
  );
}

function GalleryBrowser({ marca, tpl, content, onPick, orgGallery }) {
  const galleries = marca.galleries;
  const iarPhotos = Array.isArray(galleries) ? galleries : (galleries?.photos || []);
  const orgPhotos = window.SAAS_MODE
    ? (orgGallery || window.ORG_GALLERY || []).map((a) => (typeof a === 'string' ? a : a.url)).filter(Boolean)
    : [];
  const photoField = tpl.fields.find((f) => f.type === 'photo' || f.type === 'image');
  const currentValue = photoField ? content[photoField.name] : null;
  const hint = photoField
    ? `Clica para aplicar em "${photoField.label}"`
    : 'Sem campo de foto · clica para copiar URL';

  if (!window.SAAS_MODE) {
    if (!iarPhotos.length) return null;
    return (
      <section className="ed-section">
        <div className="ed-section__label">
          3 · Galeria
          <span className="ed-section__hint">{hint}</span>
        </div>
        <GalleryGrid photos={iarPhotos} currentValue={currentValue} onPick={onPick} />
      </section>
    );
  }

  if (!orgPhotos.length) {
    return (
      <section className="ed-section">
        <div className="ed-section__label">
          3 · Galeria
          <span className="ed-section__hint">Sem imagens nesta org — adiciona no admin</span>
        </div>
      </section>
    );
  }

  return (
    <section className="ed-section">
      <div className="ed-section__label">
        3 · Galeria
        <span className="ed-section__hint">{hint}</span>
      </div>
      <GalleryGrid photos={orgPhotos} currentValue={currentValue} onPick={onPick} />
    </section>
  );
}

function App() {
  const [activeOrgId, setActiveOrgId] = useState(() => window.ORG_MEMBERSHIP?.orgId || null);
  const [orgGallery, setOrgGallery] = useState(() => window.ORG_GALLERY || []);
  const skin = useMemo(() => window.ORG_SKIN, [activeOrgId]);
  // No SaaS a marca vem do catálogo da org; recalculada a cada troca de org.
  const forced = useMemo(
    () => (window.SAAS_MODE ? window.marcaIdForCatalog(skin?.catalogId) : window.MARCA_FORCADA),
    [skin],
  );
  const showSelector = !forced;
  const [isSuperadmin, setIsSuperadmin] = useState(() => window.isSuperadmin?.() ?? false);
  const [orgOptions, setOrgOptions] = useState([]);

  useEffect(() => {
    setIsSuperadmin(window.isSuperadmin?.() ?? false);
  }, [activeOrgId]);

  useEffect(() => {
    if (!window.SAAS_MODE || !isSuperadmin) return;
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await window.getSupabase().from('orgs').select('*').order('name');
        if (error) throw error;
        if (!cancelled) setOrgOptions(data || []);
      } catch (err) {
        console.error('orgs', err);
      }
    })();
    return () => { cancelled = true; };
  }, [isSuperadmin]);

  useEffect(() => {
    const onOrgChange = (e) => setActiveOrgId(e.detail?.orgId || window.ORG_MEMBERSHIP?.orgId);
    const onGallery = (e) => setOrgGallery(e.detail || window.ORG_GALLERY || []);
    window.addEventListener('ed:org-change', onOrgChange);
    window.addEventListener('ed:gallery-loaded', onGallery);
    return () => {
      window.removeEventListener('ed:org-change', onOrgChange);
      window.removeEventListener('ed:gallery-loaded', onGallery);
    };
  }, []);

  const [marcaId, setMarcaId] = useState(() => {
    if (forced && getMarca(forced)) return forced;
    const saved = localStorage.getItem(LS_MARCA);
    return saved && getMarca(saved) ? saved : 'iar';
  });

  // marcaId tem init preguiçoso, portanto não reage sozinho à troca de org.
  useEffect(() => {
    if (forced && getMarca(forced) && forced !== marcaId) setMarcaId(forced);
  }, [forced]);

  const marca = useMemo(() => {
    const baseMarca = getMarca(marcaId);
    if (!window.SAAS_MODE || !skin || !baseMarca) return baseMarca;
    return {
      ...baseMarca,
      id: skin.catalogId || baseMarca.catalogId || baseMarca.id,
      name: skin.name,
      handle: skin.handle,
    };
  }, [marcaId, skin]);
  const templates = marca?.templates || [];

  const [tplId, setTplId] = useState(() => templates[0]?.id || '');
  const [contentsByMarca, setContentsByMarca] = useState(() => {
    const out = {};
    const activeMarca = window.SAAS_MODE
      ? (window.marcaIdForCatalog?.(window.ORG_SKIN?.catalogId) || null)
      : null;
    getMarcaIds().forEach((id) => {
      const m = getMarca(id);
      if (!m) return;
      if (window.SAAS_MODE && activeMarca && id !== activeMarca) {
        out[id] = seedContents(m);
        return;
      }
      out[id] = buildMarcaContents(id);
    });
    return out;
  });
  const [tweaksByMarca, setTweaksByMarca] = useState(() => {
    const out = {};
    const activeMarca = window.SAAS_MODE
      ? (window.marcaIdForCatalog?.(window.ORG_SKIN?.catalogId) || null)
      : null;
    getMarcaIds().forEach((id) => {
      const m = getMarca(id);
      if (!m?.allowTweaks) return;
      if (window.SAAS_MODE && activeMarca && id !== activeMarca) {
        out[id] = { ...m.tweakDefaults };
        return;
      }
      out[id] = buildMarcaTweaks(id);
    });
    return out;
  });
  const [tplIdByMarca, setTplIdByMarca] = useState(() => {
    const out = {};
    const activeMarca = window.SAAS_MODE
      ? (window.marcaIdForCatalog?.(window.ORG_SKIN?.catalogId) || null)
      : null;
    getMarcaIds().forEach((id) => {
      const m = getMarca(id);
      if (window.SAAS_MODE && activeMarca && id !== activeMarca) {
        out[id] = m?.templates[0]?.id || '';
        return;
      }
      const stored = loadMarcaState(id);
      out[id] = stored?.tplId || m?.templates[0]?.id || '';
    });
    return out;
  });

  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState('');
  const stageRef = useRef(null);
  const [stageSize, setStageSize] = useState({ w: 720, h: 720 });

  useEffect(() => {
    if (!marca) return;
    document.documentElement.className = marca.cssClass;
    applyMarcaStyles(marcaId);
    if (showSelector) localStorage.setItem(LS_MARCA, marcaId);
  }, [marcaId, marca, showSelector]);

  useEffect(() => {
    if (skin) document.title = `Editor — ${skin.name}`;
  }, [skin]);

  useEffect(() => {
    const tpl = templates.find((t) => t.id === tplId);
    if (!tpl && templates[0]) setTplId(templates[0].id);
  }, [marcaId, templates, tplId]);

  useEffect(() => {
    if (!marca) return;
    if (window.SAAS_MODE) {
      if (!activeOrgId) return;
      const expected = window.marcaIdForCatalog?.(skin?.catalogId);
      if (expected && expected !== marcaId) return;
    }
    saveMarcaState(marcaId, {
      contents: contentsByMarca[marcaId],
      tweak: tweaksByMarca[marcaId],
      tplId,
    }, activeOrgId);
  }, [marcaId, contentsByMarca, tweaksByMarca, tplId, marca, activeOrgId, skin]);

  useEffect(() => {
    const measure = () => {
      const el = stageRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setStageSize({ w: r.width - 64, h: r.height - 64 });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [marcaId]);

  const brandLines = useMemo(
    () => window.getSkinBrandLines(skin || { name: marca?.name }),
    [skin, marca],
  );
  // Cada marca expõe o seu ícone de topo (getter preguiçoso no manifest).
  const LogoIcon = marca?.logoIcon || null;

  const tpl = useMemo(() => templates.find((t) => t.id === tplId) || templates[0], [templates, tplId]);
  const content = contentsByMarca[marcaId]?.[tpl?.id] || tpl?.defaults || {};
  const tweak = { ...(marca?.tweakDefaults || {}), ...(tweaksByMarca[marcaId] || {}) };

  const visibleScale = useMemo(() => {
    if (!tpl) return 0.5;
    if (marca?.previewShell !== 'ofmj') {
      if (tpl.w === 1080 && tpl.h === 1920) return Math.min(720 / tpl.h, stageSize.w / tpl.w);
      if (tpl.w === 1240) return 540 / tpl.w;
      return Math.min(600 / tpl.w, stageSize.w / tpl.w, stageSize.h / tpl.h);
    }
    const sx = stageSize.w / tpl.w;
    const sy = stageSize.h / tpl.h;
    return Math.min(sx, sy, 1);
  }, [tpl, marca, stageSize]);

  const grouped = useMemo(() => {
    const out = [];
    const seen = new Map();
    templates.forEach((t) => {
      if (!seen.has(t.group)) {
        const list = [];
        seen.set(t.group, list);
        out.push({ group: t.group, list });
      }
      seen.get(t.group).push(t);
    });
    return out;
  }, [templates]);

  const update = (field, val) => {
    setContentsByMarca((prev) => ({
      ...prev,
      [marcaId]: { ...prev[marcaId], [tpl.id]: { ...prev[marcaId][tpl.id], [field]: val } },
    }));
  };

  const updateTweak = (k, v) => {
    setTweaksByMarca((prev) => ({
      ...prev,
      [marcaId]: { ...prev[marcaId], [k]: v },
    }));
  };

  const switchMarca = (id) => {
    setTplIdByMarca((prev) => ({ ...prev, [marcaId]: tplId }));
    setMarcaId(id);
    setTplId(tplIdByMarca[id] || getMarca(id)?.templates[0]?.id || '');
  };

  const switchOrg = async (org) => {
    if (!org || org.id === activeOrgId) return;
    const prevOrgId = activeOrgId;
    const prevMarcaId = marcaId;
    saveMarcaState(prevMarcaId, {
      contents: contentsByMarca[prevMarcaId],
      tweak: tweaksByMarca[prevMarcaId],
      tplId,
    }, prevOrgId);

    const newMarcaId = window.marcaIdForCatalog?.(org.catalog_id) || 'iar';
    const membership = window.ORG_MEMBERSHIPS?.find((m) => m.org_id === org.id);
    window.activateOrg(org, membership?.role || window.ORG_MEMBERSHIP?.role);

    setContentsByMarca((prev) => ({
      ...prev,
      [newMarcaId]: buildMarcaContents(newMarcaId, org.id),
    }));
    const nextTweak = buildMarcaTweaks(newMarcaId, org.id);
    if (nextTweak) {
      setTweaksByMarca((prev) => ({
        ...prev,
        [newMarcaId]: nextTweak,
      }));
    }
    const stored = loadMarcaState(newMarcaId, org.id);
    const nextTpl = stored?.tplId || getMarca(newMarcaId)?.templates[0]?.id || '';
    setTplId(nextTpl);
    setMarcaId(newMarcaId);
    setActiveOrgId(org.id);

    if (window.SAAS_MODE && typeof window.loadOrgGallery === 'function') {
      try {
        const items = await window.loadOrgGallery(window.getSupabase(), org.id);
        setOrgGallery(items || []);
      } catch (e) {
        console.error(e);
        setOrgGallery([]);
      }
    } else {
      setOrgGallery([]);
    }
  };

  const resetTemplate = () => {
    if (!window.confirm('Repor conteúdo padrão deste template?')) return;
    setContentsByMarca((prev) => ({
      ...prev,
      [marcaId]: { ...prev[marcaId], [tpl.id]: { ...tpl.defaults } },
    }));
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2400);
  };

  const onDownload = useCallback(async () => {
    const node = stageRef.current?.querySelector('[data-export="root"]');
    if (!node || !tpl) return;
    setDownloading(true);
    try {
      try { await document.fonts.ready; } catch {}
      const imgs = Array.from(node.querySelectorAll('img'));
      await Promise.all(imgs.map((im) => (im.complete && im.naturalWidth
        ? Promise.resolve()
        : new Promise((res) => {
          im.addEventListener('load', res, { once: true });
          im.addEventListener('error', res, { once: true });
        }))));

      const bg = marca.exportBg
        ?? (marca.allowTweaks && marca.palettes ? marca.palettes[tweak.palette]?.paper : null);

      const dataUrl = await window.htmlToImage.toPng(node, {
        width: tpl.w,
        height: tpl.h,
        pixelRatio: marca.exportPixelRatio || 1,
        cacheBust: true,
        backgroundColor: bg,
        style: {
          transform: 'none',
          transformOrigin: 'top left',
          width: `${tpl.w}px`,
          height: `${tpl.h}px`,
        },
      });
      const a = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 10);
      a.download = `${marca.exportFilePrefix}-${tpl.id}-${stamp}.png`;
      a.href = dataUrl;
      a.click();
      showToast(marca.exportPixelRatio > 1 ? 'PNG exportado em alta resolução' : 'PNG baixado');
    } catch (err) {
      console.error(err);
      showToast('Falhou — vê o console (F12)');
    } finally {
      setDownloading(false);
    }
  }, [tpl, marca, tweak]);

  if (!marca || !tpl) return null;

  return (
    <>
      <header className={`ed-bar ed-bar--${marca.barTheme}`}>
        <div className="ed-bar__left">
          {window.SAAS_MODE || marcaId === 'iar' ? (
            <>
              {LogoIcon && <LogoIcon width={36} height={42} variant="light" />}
              <div className={`ed-bar__brand ed-bar__brand--${marcaId}`}>
                <span className="ed-bar__kicker">{brandLines.line1 || 'Igreja Anglicana'}</span>
                <span className="ed-bar__name">{brandLines.line2 || 'Rio'}</span>
              </div>
              <div className="ed-bar__title">· editor de posts</div>
            </>
          ) : (
            <>
              <span className="ed-bar__mark">§</span>
              <div className="ed-bar__brand ed-bar__brand--ofmj">
                <span className="ed-bar__name">ofantasticomundodejorge</span>
                <span className="ed-bar__sub">· editor</span>
              </div>
            </>
          )}
        </div>
        {showSelector && (
          <div className="ed-marca-tabs" role="tablist" aria-label="Marca">
            {getMarcaIds().map((id) => {
              const m = getMarca(id);
              if (!m) return null;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={marcaId === id}
                  className={`ed-marca-tab ${marcaId === id ? 'is-active' : ''}`}
                  onClick={() => switchMarca(id)}
                >
                  {m.shortName}
                </button>
              );
            })}
          </div>
        )}
        {window.SAAS_MODE && isSuperadmin && (
          <label className="ed-org-switch">
            <span className="ed-org-switch__label">Org</span>
            <select
              className="ed-org-switch__select"
              value={activeOrgId || ''}
              disabled={!orgOptions.length}
              onChange={(e) => {
                const org = orgOptions.find((o) => o.id === e.target.value);
                if (org) switchOrg(org);
              }}
              aria-label="Organização"
            >
              {orgOptions.length === 0 ? (
                <option value="">A carregar…</option>
              ) : (
                orgOptions.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))
              )}
            </select>
          </label>
        )}
        <div className="ed-bar__actions">
          {marca.hasCanvas && (
            <a
              href={`marcas/${marcaId}/canvas.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="ed-btn ed-btn--ghost"
              title={`Visão panorâmica de todos os templates ${marca.shortName}`}
            >
              Canvas ↗
            </a>
          )}
          {marca.allowTweaks && (
            <button type="button" className="ed-btn ed-btn--ghost" onClick={resetTemplate}>
              Repor defaults
            </button>
          )}
          <button
            type="button"
            className="ed-btn ed-btn--primary"
            onClick={onDownload}
            disabled={downloading}
          >
            {downloading ? 'A exportar…' : marca.exportPixelRatio > 1 ? 'Baixar PNG (3×)' : 'Baixar PNG'}
          </button>
        </div>
      </header>

      <main className="ed-main">
        <aside className="ed-sidebar">
          <section className="ed-section">
            <div className="ed-section__label">1 · Template</div>
            <div className="ed-tplpicker">
              {grouped.map(({ group, list }) => (
                <div key={group} className="ed-tplgroup">
                  <div className="ed-tplgroup__label">{group}</div>
                  <div className="ed-tplgroup__list">
                    {list.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className={`ed-tplopt ${tplId === t.id ? 'is-active' : ''}`}
                        onClick={() => setTplId(t.id)}
                      >
                        <span className="ed-tplopt__name">{t.name}</span>
                        <span className="ed-tplopt__dim">{t.w}×{t.h}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="ed-section">
            <div className="ed-section__label">2 · Conteúdo</div>
            <div className="ed-form">
              {tpl.fields.map((f) => (
                <Field
                  key={f.name}
                  field={f}
                  value={content[f.name]}
                  onChange={(v) => update(f.name, v)}
                  marca={marca}
                  orgGallery={orgGallery}
                />
              ))}
            </div>
          </section>

          <GalleryBrowser
            key={activeOrgId || 'org'}
            marca={marca}
            tpl={tpl}
            content={content}
            orgGallery={orgGallery}
            onPick={(src) => {
              const photoField = tpl.fields.find((f) => f.type === 'photo' || f.type === 'image');
              if (photoField) {
                update(photoField.name, src);
                showToast(`Aplicado em "${photoField.label}"`);
              } else {
                navigator.clipboard?.writeText(src).then(
                  () => showToast('URL copiado'),
                  () => showToast('Sem campo de foto neste template'),
                );
              }
            }}
          />
        </aside>

        <section className="ed-stage" ref={stageRef}>
          <header className="ed-stage__head">
            <div>
              <h2 className="ed-stage__title">{tpl.name}</h2>
              <div className="ed-stage__meta">
                {tpl.w} × {tpl.h} px · {tpl.group} · {marca.handle}
              </div>
            </div>
            {marca.allowTweaks && (
              <TweaksPanel tweak={tweak} onChange={updateTweak} marca={marca} />
            )}
          </header>

          <div className={`ed-stage__board ${marca.cssClass}`}>
            {marca.previewShell === 'ofmj' ? (
              <PreviewOfmj tpl={tpl} content={content} tweak={tweak} scale={visibleScale} />
            ) : (
              <PreviewIar tpl={tpl} content={content} tweak={tweak} scale={visibleScale} marca={marca} />
            )}
          </div>

          {marca.previewShell !== 'ofmj' && (
            <div className="ed-help">
              <div className="ed-help__icon">i</div>
              <div className="ed-help__text">
                Escolhe o template, preenche os campos e baixa o PNG. Fontes, cores e logo já estão travados.
              </div>
            </div>
          )}
        </section>
      </main>

      <div className={`ed-toast ${toast ? 'is-show' : ''}`}>{toast}</div>
    </>
  );
}

// Montagem em core/boot.jsx (aguarda scripts Babel assíncronos).
