const { useState, useRef, useEffect, useCallback, useMemo } = React;
const Field = window.EditorField;
const { IconLogoMarca } = window.IARIcons || {};

const MARCA_IDS = ['iar', 'ofmj'];
const LS_MARCA = 'ed:marcaActiva';

function getMarca(id) {
  return window.MARCAS?.[id] || null;
}

function loadMarcaState(marcaId) {
  try {
    const raw = localStorage.getItem(`ed:${marcaId}:state`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveMarcaState(marcaId, state) {
  try {
    localStorage.setItem(`ed:${marcaId}:state`, JSON.stringify(state));
  } catch {}
}

function seedContents(marca) {
  const seed = {};
  marca.templates.forEach((t) => { seed[t.id] = { ...t.defaults }; });
  return seed;
}

function applyMarcaStyles(marcaId) {
  const iarCss = document.getElementById('marca-css-iar');
  const fmjCss = document.getElementById('fmj-styles');
  if (iarCss) iarCss.disabled = marcaId !== 'iar';
  if (fmjCss) fmjCss.disabled = marcaId !== 'ofmj';
}

function PreviewIar({ tpl, content, scale }) {
  return (
    <div className="post" style={{ width: tpl.w * scale, height: tpl.h * scale }}>
      <div
        className="post-inner"
        data-export="root"
        style={{ width: tpl.w, height: tpl.h, transform: `scale(${scale})`, transformOrigin: 'top left' }}
      >
        {tpl.render(content)}
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
  const palettes = ['pergaminho', 'vigilia', 'quaresma', 'tintaNua'];
  const accents = ['borgonha', 'ouro', 'vermelhoSeco', 'indigo'];
  const layouts = [
    { v: 'left', label: 'Esq.' },
    { v: 'centered', label: 'Centro' },
    { v: 'grid', label: 'Grade' },
  ];
  const swatchFor = (k) => {
    const p = marca.palettes[k];
    return [p.paper, p.ink, marca.accents[tweak.accent]?.color || '#722f37'];
  };
  return (
    <div className="ed-tweaks">
      <div className="ed-tweaks__title">Acabamento</div>
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
      <div className="ed-tweaks__group">
        <label className="ed-toggle">
          <input type="checkbox" checked={!!tweak.showGrid} onChange={(e) => onChange('showGrid', e.target.checked)} />
          <span>Grid</span>
        </label>
        <label className="ed-toggle">
          <input type="checkbox" checked={!!tweak.watermark} onChange={(e) => onChange('watermark', e.target.checked)} />
          <span>Marca d&apos;água</span>
        </label>
      </div>
    </div>
  );
}

function App() {
  const forced = window.MARCA_FORCADA;
  const showSelector = !forced;

  const [marcaId, setMarcaId] = useState(() => {
    if (forced && getMarca(forced)) return forced;
    const saved = localStorage.getItem(LS_MARCA);
    return saved && getMarca(saved) ? saved : 'iar';
  });

  const marca = getMarca(marcaId);
  const templates = marca?.templates || [];

  const [tplId, setTplId] = useState(() => templates[0]?.id || '');
  const [contentsByMarca, setContentsByMarca] = useState(() => {
    const out = {};
    MARCA_IDS.forEach((id) => {
      const m = getMarca(id);
      if (!m) return;
      const stored = loadMarcaState(id);
      const seed = seedContents(m);
      out[id] = stored?.contents ? { ...seed, ...stored.contents } : seed;
    });
    return out;
  });
  const [tweaksByMarca, setTweaksByMarca] = useState(() => {
    const out = {};
    MARCA_IDS.forEach((id) => {
      const m = getMarca(id);
      if (!m?.allowTweaks) return;
      const stored = loadMarcaState(id);
      out[id] = stored?.tweak || { ...m.tweakDefaults };
    });
    return out;
  });
  const [tplIdByMarca, setTplIdByMarca] = useState(() => {
    const out = {};
    MARCA_IDS.forEach((id) => {
      const m = getMarca(id);
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
    const tpl = templates.find((t) => t.id === tplId);
    if (!tpl && templates[0]) setTplId(templates[0].id);
  }, [marcaId, templates, tplId]);

  useEffect(() => {
    if (!marca) return;
    saveMarcaState(marcaId, {
      contents: contentsByMarca[marcaId],
      tweak: tweaksByMarca[marcaId],
      tplId,
    });
  }, [marcaId, contentsByMarca, tweaksByMarca, tplId, marca]);

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

  const tpl = useMemo(() => templates.find((t) => t.id === tplId) || templates[0], [templates, tplId]);
  const content = contentsByMarca[marcaId]?.[tpl?.id] || tpl?.defaults || {};
  const tweak = tweaksByMarca[marcaId] || marca?.tweakDefaults || {};

  const visibleScale = useMemo(() => {
    if (!tpl) return 0.5;
    if (marcaId === 'iar') {
      if (tpl.w === 1080 && tpl.h === 1920) return Math.min(720 / tpl.h, stageSize.w / tpl.w);
      if (tpl.w === 1240) return 540 / tpl.w;
      return Math.min(600 / tpl.w, stageSize.w / tpl.w, stageSize.h / tpl.h);
    }
    const sx = stageSize.w / tpl.w;
    const sy = stageSize.h / tpl.h;
    return Math.min(sx, sy, 1);
  }, [tpl, marcaId, stageSize]);

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
          {marcaId === 'iar' ? (
            <>
              {IconLogoMarca && <IconLogoMarca width={36} height={42} variant="light" />}
              <div className="ed-bar__brand ed-bar__brand--iar">
                <span className="ed-bar__kicker">Igreja Anglicana</span>
                <span className="ed-bar__name">Rio</span>
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
            {MARCA_IDS.map((id) => {
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
        <div className="ed-bar__actions">
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
                />
              ))}
            </div>
          </section>
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
            {marcaId === 'iar' ? (
              <PreviewIar tpl={tpl} content={content} scale={visibleScale} />
            ) : (
              <PreviewOfmj tpl={tpl} content={content} tweak={tweak} scale={visibleScale} />
            )}
          </div>

          {marcaId === 'iar' && (
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

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
