/* ============================================
   Refúgio — Templates de Post (1080×1080, 1080×1350, 1080×1920, 1240×1754)

   Namespaced em window.REFUGIO_TPL — NÃO escrever nomes soltos em window:
   marcas/iar/templates.jsx declara Post/TplCoverType/... como globais e
   marcas/iar/registry.jsx lê-os de volta de window. A ordem dos scripts
   Babel não é garantida, portanto nomes soltos aqui destruiriam o IAR.
============================================ */

(function () {
  const { IconSelo, IconLocal } = window.RefugioIcons;

  const REFUGIO_BASE = 'marcas/refugio/';
  const refugioAsset = (p) => `${REFUGIO_BASE}${p}`;

  const FALLBACK_NAME = 'Comunidade Anglicana Refúgio';
  const FALLBACK_HANDLE = '@anglicana_refugio';

  /* Marca vem do ORG_SKIN (white-label); os fallbacks só valem fora do SaaS. */
  function getBrandLines() {
    return (window.getSkinBrandLines || (() => ({ line1: 'Comunidade Anglicana', line2: 'Refúgio' })))(
      window.ORG_SKIN || { name: FALLBACK_NAME }
    );
  }
  function getBrandHandle(handle) {
    return handle || window.ORG_SKIN?.handle || FALLBACK_HANDLE;
  }
  function getBrandName(name) {
    return name || window.ORG_SKIN?.name || FALLBACK_NAME;
  }

  const fs = (px) => `calc(${px}px * var(--fscale, 1))`;

  function Post({ children, dark = false, scale = 0.5, w = 1080, h = 1080, style = {} }) {
    return (
      <div className={`post ${dark ? 'post--dark' : ''}`} style={{ width: w * scale, height: h * scale, ...style }}>
        <div className="post-inner" style={{ width: w, height: h, transform: `scale(${scale})` }}>
          {children}
        </div>
      </div>
    );
  }
  function Story({ children, scale = 0.2814 }) { return <Post w={1080} h={1920} scale={scale}>{children}</Post>; }
  function Print({ children, scale = 0.3387 }) { return <Post w={1240} h={1754} scale={scale}>{children}</Post>; }

  function PostHead({ category, dark = false, compact = false, iconSize = 48, legible = false }) {
    const { line1, line2 } = getBrandLines();
    return (
      <div className={'t-head' + (legible ? ' t-head--legible' : '')} style={compact ? { marginBottom: 32 } : {}}>
        <div className="t-mark">
          <div style={{ width: iconSize, height: iconSize, color: dark ? 'var(--gold-claro)' : 'var(--navy)' }}>
            <IconSelo width="100%" height="100%" />
          </div>
          <div className="t-mark__text">
            <span>{line1}</span>
            <span className="t-mark__line2">{line2 || 'Refúgio'}</span>
          </div>
        </div>
        {category && <div className="t-category">{category}</div>}
      </div>
    );
  }

  function PostFoot({ pages, handle }) {
    return (
      <div className="t-foot">
        <div className="t-foot__handle">{getBrandHandle(handle)}</div>
        {pages && <div className="t-foot__pages">{pages}</div>}
      </div>
    );
  }

  function WaveFooter({ color = 'currentColor', opacity = 0.1 }) {
    return (
      <svg className="t-wave" viewBox="0 0 1080 200" preserveAspectRatio="none">
        <path d="M0 80 C 180 30, 360 130, 540 80 S 900 30, 1080 80 L 1080 200 L 0 200 Z" fill={color} opacity={opacity} />
        <path d="M0 130 C 180 80, 360 180, 540 130 S 900 80, 1080 130 L 1080 200 L 0 200 Z" fill={color} opacity={opacity * 1.5} />
      </svg>
    );
  }

  /* —— Capa tipográfica —— */
  function TplCoverType({ eyebrow = 'Refúgio', title, titleEm, sub }) {
    return (
      <div className="t-post">
        <PostHead category="Carrossel" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="t-eyebrow">{eyebrow}</div>
          <div className="t-title">{title} {titleEm && <em>{titleEm}</em>}</div>
          {sub && <div className="t-sub">{sub}</div>}
          <div className="t-rule-accent" />
        </div>
        <PostFoot pages="1 / 6" />
        <WaveFooter color="var(--gold)" opacity={0.08} />
      </div>
    );
  }

  /* —— Capa com foto —— */
  function TplCoverPhoto({ photo, eyebrow, title, titleEm, sub }) {
    return (
      <div className="t-post t-post--photo">
        <div className="t-photo-bg"><img src={photo} alt="" /></div>
        <div className="t-photo-overlay" />
        <div className="t-photo-inner">
          <PostHead category="Comunidade" dark legible />
          <div style={{ flex: 1 }} />
          <div className="t-eyebrow" style={{ color: 'var(--gold-claro)' }}>{eyebrow}</div>
          <div className="t-title" style={{ color: 'var(--papel)' }}>{title} {titleEm && <em style={{ color: 'var(--papel)' }}>{titleEm}</em>}</div>
          {sub && <div className="t-sub" style={{ color: 'var(--papel-3)' }}>{sub}</div>}
          <div style={{ height: 64 }} />
          <PostFoot pages="1 / 1" />
        </div>
      </div>
    );
  }

  /* —— Capa com ícone —— */
  function TplCoverIcon({ Icon, eyebrow, title, titleEm, sub, accent = 'var(--gold-escuro)' }) {
    return (
      <div className="t-post">
        <PostHead category="Liturgia" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ width: 180, height: 180, color: accent, marginBottom: 40 }}><Icon width="100%" height="100%" /></div>
          <div className="t-eyebrow">{eyebrow}</div>
          <div className="t-title">{title} {titleEm && <em>{titleEm}</em>}</div>
          {sub && <div className="t-sub">{sub}</div>}
        </div>
        <PostFoot pages="1 / 5" />
      </div>
    );
  }

  /* —— Miolo número —— */
  function TplBodyNum({ num, title, body, page }) {
    return (
      <div className="t-post">
        <PostHead category={getBrandName()} compact />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="t-bigNum">{num}</div>
          <div className="t-h2">{title}</div>
          <div className="t-body" dangerouslySetInnerHTML={{ __html: body }} />
        </div>
        <PostFoot pages={page} />
      </div>
    );
  }

  /* —— Miolo ícone —— */
  function TplBodyIcon({ Icon, eyebrow, title, body, page, accent = 'var(--gold-escuro)' }) {
    return (
      <div className="t-post">
        <PostHead category={getBrandName()} compact />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ width: 130, height: 130, color: accent, marginBottom: 40 }}><Icon width="100%" height="100%" /></div>
          {eyebrow && <div className="t-eyebrow" style={{ fontSize: fs(18) }}>{eyebrow}</div>}
          <div className="t-h2">{title}</div>
          <div className="t-body" dangerouslySetInnerHTML={{ __html: body }} />
        </div>
        <PostFoot pages={page} />
      </div>
    );
  }

  /* —— Encerramento CTA —— */
  function TplCloseCTA({ title, sub, ctaText, page = '6 / 6', dark = true }) {
    return (
      <div className={`t-post ${dark ? 't-post--dark' : ''}`}>
        <PostHead category="Vem com a gente" dark={dark} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="t-h2" style={{ color: dark ? 'var(--papel)' : 'var(--navy)', fontSize: fs(84) }}>{title}</div>
          {sub && <div className="t-body" style={{ marginTop: 32, marginBottom: 56, fontSize: fs(32), maxWidth: '26ch' }}>{sub}</div>}
          <div className="t-cta">{ctaText} <span style={{ fontSize: fs(30) }}>→</span></div>
        </div>
        <PostFoot pages={page} />
        <WaveFooter color="var(--gold-claro)" opacity={0.18} />
      </div>
    );
  }

  /* —— Versículo —— */
  function TplVerse({ verse, reference, eyebrow = 'Palavra de hoje' }) {
    return (
      <div className="t-post">
        <PostHead category="Devocional" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="t-eyebrow">{eyebrow}</div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: -16, top: -40, fontFamily: 'var(--font-script)', fontSize: fs(180), lineHeight: 0.8, color: 'var(--gold)', opacity: 0.3 }}>“</div>
            <div className="t-verse">{verse}</div>
            <div className="t-verse__ref">{reference}</div>
          </div>
        </div>
        <PostFoot pages="" />
        <WaveFooter color="var(--gold)" opacity={0.08} />
      </div>
    );
  }

  /* —— Evento —— */
  function TplEvent({ kicker, title, date, time, place, cta, photo, overlayOpacity, kickerColor }) {
    const ov = overlayOpacity ?? 0.75;
    return (
      <div className="t-post t-post--dark t-post--photo">
        {photo && <div className="t-photo-bg"><img src={photo} alt="" style={{ objectPosition: 'center 26%' }} /></div>}
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(15,22,38,${Math.max(0.1, 0.1 * ov)}) 0%, rgba(15,22,38,${Math.max(0.28, 0.2 * ov)}) 32%, rgba(15,22,38,${0.7 * ov}) 58%, rgba(15,22,38,${0.95 * ov}) 82%, rgba(15,22,38,${0.98 * ov}) 100%)` }} />
        <div className="t-photo-inner" style={{ padding: '104px 96px 108px', display: 'flex', flexDirection: 'column' }}>
          <PostHead category="Evento" dark iconSize={68} legible />
          <div className="t-eyebrow" style={{ color: kickerColor || 'var(--gold)', marginBottom: 22, marginTop: 'auto', textShadow: '0 2px 10px rgba(15,22,38,0.85)' }}>{kicker}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: fs(116), lineHeight: 1, color: 'var(--papel)', textWrap: 'balance' }}>{date}</div>
          <div style={{ fontFamily: 'var(--font-wide)', fontSize: fs(36), fontWeight: 600, letterSpacing: '0.04em', color: 'var(--papel-3)', marginTop: 20 }}>{title}{title && time ? ' · ' : ''}{time}</div>
          {place && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 44, marginBottom: 'auto', color: 'var(--papel)' }}>
              <div style={{ width: 40, height: 40, color: 'var(--gold-claro)', flexShrink: 0 }}><IconLocal width="100%" height="100%" /></div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: fs(34), fontWeight: 500 }}>{place}</div>
            </div>
          )}
          {cta && (
            <div style={{ marginTop: 56 }}>
              <span style={{ display: 'inline-block', background: 'var(--papel)', color: 'var(--navy)', fontFamily: 'var(--font-wide)', fontSize: fs(26), fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '22px 44px', borderRadius: 999 }}>{cta}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* —— Comunidade —— */
  function TplCommunity({ photo, quote, who }) {
    return (
      <div className="t-post t-post--photo">
        <div className="t-photo-bg"><img src={photo} alt="" /></div>
        <div className="t-photo-overlay" style={{ background: 'linear-gradient(180deg, rgba(15,22,38,0.0) 30%, rgba(15,22,38,0.92) 95%)' }} />
        <div className="t-photo-inner">
          <PostHead category="Bastidores" dark legible />
          <div style={{ flex: 1 }} />
          <div style={{ fontFamily: 'var(--font-script)', fontSize: fs(56), lineHeight: 1.25, color: 'var(--papel)', textWrap: 'balance', maxWidth: '20ch', marginBottom: 24 }}>"{quote}"</div>
          {who && <div style={{ fontFamily: 'var(--font-wide)', fontSize: fs(20), fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold-claro)' }}>— {who}</div>}
          <div style={{ height: 56 }} />
          <PostFoot pages="" />
        </div>
      </div>
    );
  }

  /* —— Campanha —— */
  function TplCampaign({ photo, photos = [refugioAsset('assets/photo-elevacao.png'), refugioAsset('assets/photo-comunhao.png')], intro, kicker, title, titleEm, body, cta }) {
    const imgs = photo ? [photo] : photos;
    return (
      <div className="t-post t-post--dark">
        <div className="t-photo-bg" style={{ display: 'grid', gridTemplateColumns: imgs.length > 1 ? '1fr 1fr' : '1fr' }}>
          {imgs.map((src, i) => <img key={i} src={src} alt="" style={{ opacity: 0.4, width: '100%', height: '100%', objectFit: 'cover' }} />)}
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,22,38,0.55), rgba(15,22,38,0.96))' }} />
        <div className="t-photo-inner" style={{ padding: '36px 96px 64px' }}>
          <PostHead category="" dark iconSize={68} legible />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <div style={{ color: 'var(--papel)', fontSize: fs(28), fontWeight: 600, marginBottom: 16 }}>{intro}</div>
            <div className="t-eyebrow" style={{ color: 'var(--gold)', marginBottom: 8 }}>{kicker}</div>
            <div className="t-title" style={{ color: 'var(--papel)', fontSize: fs(84), lineHeight: 1.1 }}>{title} {titleEm && <em style={{ color: 'var(--gold-claro)' }}>{titleEm}</em>}</div>
            {body && <div className="t-body" style={{ marginTop: 32, color: 'var(--papel-3)', maxWidth: '32ch', fontSize: fs(28), lineHeight: 1.45 }}>{body}</div>}
            {cta && <div style={{ marginTop: 44, display: 'inline-flex', alignSelf: 'flex-start', padding: '18px 30px', background: 'var(--gold)', color: 'var(--navy)', fontFamily: 'var(--font-wide)', fontSize: fs(22), fontWeight: 700, letterSpacing: '0.04em', borderRadius: 8 }}>{cta}</div>}
          </div>
          <PostFoot pages="" />
        </div>
      </div>
    );
  }

  /* —— Lecionário (Story) —— */
  function TplLectionary({ title = 'Lecionário Diário', date, passages = [], body }) {
    const { line1, line2 } = getBrandLines();
    return (
      <div className="t-story t-lectionary" style={{ backgroundColor: 'var(--papel-2)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24 }}>
          <div style={{ width: 90, height: 90, color: 'var(--navy)' }}><IconSelo width="100%" height="100%" /></div>
          <div style={{ marginTop: 18, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-wide)', fontSize: fs(15), fontWeight: 400, letterSpacing: '0.28em', textTransform: 'uppercase', opacity: 0.65, marginBottom: 6, color: 'var(--navy)' }}>{line1}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: fs(26), fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--navy)' }}>{line2 || 'Refúgio'}</div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 56, marginBottom: 40 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: fs(80), fontWeight: 700, lineHeight: 1.1, color: 'var(--gold-escuro)' }}>{title}</div>
          {date && <div style={{ marginTop: 18, fontFamily: 'var(--font-wide)', fontSize: fs(22), fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold-escuro)' }}>{date}</div>}
        </div>
        {passages.filter(Boolean).length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingBlock: 36, borderTop: '1px solid var(--linha)', borderBottom: '1px solid var(--linha)', marginBottom: 48 }}>
            {passages.filter(Boolean).map((p, i) => <div key={i} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--navy)', lineHeight: 1.15, fontSize: fs(46) }}>{p}</div>)}
          </div>
        )}
        <div style={{ flex: 1, fontFamily: 'var(--font-sans)', lineHeight: 1.5, color: 'var(--grafite)', textAlign: 'left', fontSize: fs(40) }} dangerouslySetInnerHTML={{ __html: body || '' }} />
        <div style={{ marginTop: 32, paddingTop: 24, fontFamily: 'var(--font-wide)', fontSize: fs(24), fontWeight: 600, letterSpacing: '0.1em', color: 'var(--navy)', textAlign: 'center' }}>{getBrandHandle()}</div>
        <WaveFooter color="var(--gold)" opacity={0.08} />
      </div>
    );
  }

  /* —— STORIES —— */
  function StoryVerse({ verse, reference }) {
    return (
      <div className="t-story">
        <div style={{ width: 96, height: 96, color: 'var(--navy)', marginBottom: 64 }}><IconSelo width="100%" height="100%" /></div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="t-eyebrow" style={{ fontSize: fs(24) }}>Palavra de hoje</div>
          <div style={{ fontFamily: 'var(--font-script)', fontSize: fs(72), lineHeight: 1.3, color: 'var(--navy)', textWrap: 'balance' }}>{verse}</div>
          <div style={{ marginTop: 48, fontFamily: 'var(--font-wide)', fontSize: fs(28), fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold-escuro)' }}>{reference}</div>
        </div>
        <div style={{ fontFamily: 'var(--font-wide)', fontSize: fs(24), fontWeight: 500, letterSpacing: '0.1em', color: 'var(--grafite-3)' }}>{getBrandHandle()}</div>
        <WaveFooter color="var(--gold)" opacity={0.1} />
      </div>
    );
  }

  function StoryEvent({ kicker, title, date, time, place, photo }) {
    return (
      <div className="t-story t-story--photo">
        <div className="t-photo-bg"><img src={photo} alt="" /></div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,22,38,0.4) 0%, rgba(15,22,38,0.5) 40%, rgba(15,22,38,0.95) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%', padding: '120px 96px', display: 'flex', flexDirection: 'column', color: 'var(--papel)' }}>
          <div style={{ width: 84, height: 84, color: 'var(--gold-claro)' }}><IconSelo width="100%" height="100%" /></div>
          <div style={{ flex: 1 }} />
          <div style={{ fontFamily: 'var(--font-wide)', fontSize: fs(28), fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold-claro)', marginBottom: 32 }}>{kicker}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: fs(108), lineHeight: 1.1, fontWeight: 700, color: 'var(--papel)', marginBottom: 56, textWrap: 'balance' }}>{title}</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: fs(36), fontWeight: 500, color: 'var(--papel)', lineHeight: 1.4 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
              <span style={{ width: 34, height: 34, color: 'var(--gold-claro)' }}><IconSelo width="100%" height="100%" /></span>
              {date} · {time}
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <span style={{ width: 34, height: 34, color: 'var(--gold-claro)' }}><IconLocal width="100%" height="100%" /></span>
              {place}
            </div>
          </div>
          <div style={{ height: 96 }} />
          <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 16, padding: '20px 32px', background: 'var(--gold)', color: 'var(--navy)', fontFamily: 'var(--font-wide)', fontSize: fs(26), fontWeight: 700, letterSpacing: '0.06em', borderRadius: 999 }}>
            Toca aqui pra confirmar →
          </div>
        </div>
      </div>
    );
  }

  function StoryQuote({ quote, who, photo }) {
    return (
      <div className="t-story">
        <div style={{ width: 84, height: 84, color: 'var(--navy)' }}><IconSelo width="100%" height="100%" /></div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 48 }}>
          {photo && <div style={{ width: 280, height: 280, borderRadius: '50%', overflow: 'hidden', border: '8px solid var(--vela)', boxShadow: '0 8px 32px rgba(15,22,38,0.2)' }}><img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
          <div style={{ fontFamily: 'var(--font-script)', fontSize: fs(60), lineHeight: 1.3, color: 'var(--navy)', textWrap: 'balance' }}>"{quote}"</div>
          <div style={{ fontFamily: 'var(--font-wide)', fontSize: fs(24), fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold-escuro)' }}>{who}</div>
        </div>
        <div style={{ fontFamily: 'var(--font-wide)', fontSize: fs(22), fontWeight: 500, letterSpacing: '0.1em', color: 'var(--grafite-3)' }}>{getBrandHandle()}</div>
      </div>
    );
  }

  /* —— Impresso: capa de boletim A4 (não listado no catálogo; mantido para reuso) —— */
  function PrintFolder({ title, subtitle, date, photo }) {
    const { line1, line2 } = getBrandLines();
    return (
      <div className="t-print">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="t-mark">
            <div style={{ width: 60, height: 60, color: 'var(--navy)' }}><IconSelo width="100%" height="100%" /></div>
            <div className="t-mark__text"><span>{line1}</span><span className="t-mark__line2">{line2 || 'Refúgio'}</span></div>
          </div>
          <div style={{ fontFamily: 'var(--font-wide)', fontSize: fs(18), letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--grafite-3)' }}>{date}</div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 32 }}>
          <div style={{ fontFamily: 'var(--font-wide)', fontSize: fs(18), fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--gold-escuro)' }}>Boletim Litúrgico</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: fs(120), lineHeight: 1, fontWeight: 700, color: 'var(--navy)', textWrap: 'balance' }}>{title}</div>
          <div style={{ fontFamily: 'var(--font-script)', fontSize: fs(34), color: 'var(--gold-escuro)', maxWidth: '30ch', textWrap: 'pretty' }}>{subtitle}</div>
        </div>
        {photo && <div style={{ height: 480, borderRadius: 8, overflow: 'hidden', margin: '32px 0' }}><img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 24, borderTop: '1px solid var(--linha)', fontFamily: 'var(--font-sans)', fontSize: fs(18), color: 'var(--grafite-2)' }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{getBrandName()}</div>
            <div>Taguatinga Sul, Brasília DF</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div>{getBrandHandle()}</div>
            <div style={{ color: 'var(--grafite-3)' }}>REB · Rede Episcopal Brasileira</div>
          </div>
        </div>
      </div>
    );
  }

  window.REFUGIO_TPL = {
    Post, Story, Print,
    TplCoverType, TplCoverPhoto, TplCoverIcon,
    TplBodyNum, TplBodyIcon, TplCloseCTA,
    TplVerse, TplEvent, TplCommunity, TplCampaign, TplLectionary,
    StoryVerse, StoryEvent, StoryQuote, PrintFolder,
  };
})();
