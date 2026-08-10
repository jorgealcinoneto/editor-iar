/* ============================================
   IAR — Templates de Post (todos em 1080×1080 ou 1080×1920)
   Cada componente renderiza o conteúdo interno do post.
   Wrappers <Post> / <Story> aplicam escala.
============================================ */

const {
  IconJanelaRio, IconLogoMarca, IconCruzCelta, IconCalice, IconPomba,
  IconOndas, IconCasa, IconLivro, IconVela, IconCoracao,
  IconMaos, IconComunidade, IconAurora, IconEvento, IconTestemunho, IconLocal, IconArco
} = window.IARIcons;

const RT = window.RT || (({ children }) => children);
const IAR_BRAND = { name: 'Igreja Anglicana Rio' };

function getBrandLines() {
  return (window.getSkinBrandLines || (() => ({ line1: 'Igreja Anglicana', line2: 'RIO' })))(
    window.ORG_SKIN || IAR_BRAND
  );
}

function getBrandHandle(handle) {
  return handle || window.ORG_SKIN?.handle || '@igrejaanglicanario';
}

function getBrandName(name) {
  return name || window.ORG_SKIN?.name || 'Igreja Anglicana Rio';
}

function getBrandLogo(logoSrc) {
  return window.ORG_SKIN?.logoUrl || logoSrc;
}

/* ============================================
   Wrappers de escala
============================================ */
function Post({ children, dark = false, scale = 0.5, w = 1080, h = 1080, style = {} }) {
  return (
    <div
      className={`post ${dark ? "post--dark" : ""}`}
      style={{ width: w * scale, height: h * scale, ...style }}
    >
      <div
        className="post-inner"
        style={{
          width: w,
          height: h,
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Story({ children, scale = 0.2814 }) {
  return <Post w={1080} h={1920} scale={scale}>{children}</Post>;
}

function Print({ children, scale = 0.3387 }) {
  return <Post w={1240} h={1754} scale={scale}>{children}</Post>;
}

/* ============================================
   Componentes compartilhados — Topo / Rodapé
============================================ */
function PostHead({ category, dark = false, compact = false, logoWidth = 56, logoHeight = 64, textScale = 1, legible = false }) {
  const { line1, line2 } = getBrandLines();
  return (
    <div className={'t-head' + (legible ? ' t-head--legible' : '')} style={compact ? { marginBottom: 32 } : {}}>
      <div className="t-mark">
        <IconLogoMarca width={logoWidth} height={logoHeight} variant={dark ? 'light' : 'dark'} />
        <div className="t-mark__text" style={textScale !== 1 ? { fontSize: 18 * textScale } : {}}>
          <span style={textScale !== 1 ? { fontSize: 14 * textScale } : {}}>{line1}</span>
          {line2 || 'RIO'}
        </div>
      </div>
      {category && <div className="t-category">{category}</div>}
    </div>
  );
}

function PostFoot({ pages, handle, dark = false }) {
  const h = getBrandHandle(handle);
  return (
    <div className="t-foot">
      <div className="t-foot__handle">{h}</div>
      {pages && <div className="t-foot__pages">{pages}</div>}
    </div>
  );
}

function quoteFontSize(quote, max = 64, min = 40) {
  const len = (quote || "").replace(/<[^>]+>/g, "").trim().length;
  if (len > 72) return min;
  if (len > 58) return min + 6;
  if (len > 44) return min + 12;
  if (len > 32) return min + 18;
  return max;
}

function LectionaryBrand() {
  const { line1, line2 } = getBrandLines();
  return (
    <div className="t-lectionary-brand">
      <IconLogoMarca width={120} height={138} variant="dark" />
      <div className="t-lectionary-brand__text">
        <div className="t-lectionary-brand__line">{line1}</div>
        <div className="t-lectionary-brand__rio">{line2 || 'Rio'}</div>
      </div>
    </div>
  );
}

function PassagesList({ passages }) {
  const items = (passages || []).filter(Boolean);
  if (!items.length) return null;
  return (
    <div className="t-passages">
      {items.map((p, i) => (
        <div key={i} className="t-passages__item">
          {p}
        </div>
      ))}
    </div>
  );
}

/* Onda decorativa do rodapé */
function WaveFooter({ color = "currentColor", opacity = 0.12 }) {
  return (
    <svg
      className="t-wave"
      viewBox="0 0 1080 200"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 80 C 180 30, 360 130, 540 80 S 900 30, 1080 80 L 1080 200 L 0 200 Z"
        fill={color}
        opacity={opacity}
      />
      <path
        d="M0 130 C 180 80, 360 180, 540 130 S 900 80, 1080 130 L 1080 200 L 0 200 Z"
        fill={color}
        opacity={opacity * 1.5}
      />
    </svg>
  );
}

/* ============================================
   TEMPLATE A — Capa Tipográfica
============================================ */
function TplCoverType({ eyebrow = "Anglicanismo 101", title, titleEm, sub, category = "Carrossel" }) {
  return (
    <div className="t-post">
      <PostHead category={category} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="t-eyebrow">{eyebrow}</div>
        <div className="t-title">
          {title} {titleEm && <em>{titleEm}</em>}
        </div>
        {sub && <div className="t-sub"><RT>{sub}</RT></div>}
        <div className="t-rule-accent" />
      </div>
      <PostFoot pages="1 / 6" />
      <WaveFooter color="var(--estola)" opacity={0.08} />
    </div>
  );
}

/* ============================================
   TEMPLATE B — Capa com foto fullbleed
============================================ */
function TplCoverPhoto({ photo, eyebrow, title, titleEm, sub, category = "Comunidade" }) {
  return (
    <div className="t-post t-post--photo">
      <div className="t-photo-bg">
        <img src={photo} alt="" />
      </div>
      <div className="t-photo-overlay" />
      <div className="t-photo-inner">
        <PostHead category={category} dark legible />
        <div className="t-photo-bottom">
          <div className="t-eyebrow" style={{ color: "var(--estola-claro)" }}>{eyebrow}</div>
          <div className="t-title" style={{ color: "var(--papel)" }}>
            {title} {titleEm && <em style={{ color: "var(--papel)" }}>{titleEm}</em>}
          </div>
          {sub && <div className="t-sub" style={{ color: "var(--papel-3)" }}><RT>{sub}</RT></div>}
          <PostFoot pages="1 / 1" />
        </div>
      </div>
    </div>
  );
}

/* ============================================
   TEMPLATE C — Capa com ícone (clean)
============================================ */
function TplCoverIcon({ Icon, eyebrow, title, titleEm, sub, accent = "var(--estola)", category = "Liturgia" }) {
  return (
    <div className="t-post">
      <PostHead category={category} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ width: 200, height: 200, color: accent, marginBottom: 40 }}>
          <Icon width="100%" height="100%" />
        </div>
        <div className="t-eyebrow">{eyebrow}</div>
        <div className="t-title">
          {title} {titleEm && <em>{titleEm}</em>}
        </div>
        {sub && <div className="t-sub"><RT>{sub}</RT></div>}
      </div>
      <PostFoot pages="1 / 5" />
    </div>
  );
}

/* ============================================
   TEMPLATE D — Slide miolo (número grande)
============================================ */
function TplBodyNum({ num, title, body, page, category = "Anglicanismo 101" }) {
  return (
    <div className="t-post">
      <PostHead category={category} compact />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="t-bigNum">{num}</div>
        <div className="t-h2">{title}</div>
        <div className="t-body" dangerouslySetInnerHTML={{ __html: body }} />
      </div>
      <PostFoot pages={page} />
    </div>
  );
}

/* ============================================
   TEMPLATE E — Slide miolo (ícone + texto)
============================================ */
function TplBodyIcon({ Icon, eyebrow, title, body, page, accent = "var(--estola)", category = "Anglicanismo 101" }) {
  return (
    <div className="t-post">
      <PostHead category={category} compact />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ width: 140, height: 140, color: accent, marginBottom: 40 }}>
          <Icon width="100%" height="100%" />
        </div>
        {eyebrow && <div className="t-eyebrow" style={{ fontSize: 18 }}>{eyebrow}</div>}
        <div className="t-h2">{title}</div>
        <div className="t-body" dangerouslySetInnerHTML={{ __html: body }} />
      </div>
      <PostFoot pages={page} />
    </div>
  );
}

/* ============================================
   TEMPLATE F — Encerramento + CTA
============================================ */
function TplCloseCTA({ title, sub, ctaText, page = "6 / 6", dark = true, category = "Vem com a gente" }) {
  return (
    <div className={`t-post ${dark ? "t-post--dark" : ""}`}>
      <PostHead category={category} dark={dark} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="t-h2" style={{ color: dark ? "var(--papel)" : "var(--marinho)", fontSize: 96 }}>
          {title}
        </div>
        {sub && (
          <div className="t-body" style={{ marginTop: 32, marginBottom: 56, fontSize: 32, maxWidth: "26ch" }}>
            <RT>{sub}</RT>
          </div>
        )}
        <div className="t-cta">
          {ctaText} <span style={{ fontSize: 30 }}>→</span>
        </div>
      </div>
      <PostFoot pages={page} />
      <WaveFooter color="var(--estola-claro)" opacity={0.18} />
    </div>
  );
}

/* ============================================
   TEMPLATE G — Versículo (post único, devocional)
============================================ */
function TplVerse({ verse, reference, eyebrow = "Palavra de hoje" }) {
  return (
    <div className="t-post">
      <PostHead category="Devocional" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="t-eyebrow">{eyebrow}</div>
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: -16,
              top: -56,
              fontFamily: "var(--font-serif)",
              fontSize: 220,
              lineHeight: 0.8,
              color: "var(--estola)",
              opacity: 0.3,
              fontStyle: "italic",
            }}
          >
            “
          </div>
          <div className="t-verse"><RT>{verse}</RT></div>
          <div className="t-verse__ref">{reference}</div>
        </div>
      </div>
      <PostFoot pages="" />
      <WaveFooter color="var(--estola)" opacity={0.08} />
    </div>
  );
}

/* ============================================
   TEMPLATE H — Evento / convite
============================================ */
function TplEvent({ kicker, title, date, time, place, sub, photo }) {
  return (
    <div className="t-post t-post--dark">
      {photo && (
        <>
          <div className="t-photo-bg">
            <img src={photo} alt="" style={{ opacity: 0.45 }} />
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(14,42,71,0.7), rgba(14,42,71,0.95))",
            }}
          />
        </>
      )}
      <div className="t-photo-inner" style={{ padding: 96 }}>
        <PostHead category="Evento" dark legible />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div className="t-eyebrow" style={{ color: "var(--estola-claro)" }}>{kicker}</div>
          <div className="t-title" style={{ color: "var(--papel)", fontSize: 116 }}>
            {title}
          </div>
          <div style={{ height: 56 }} />
          <div style={{ display: "grid", gap: 24, fontFamily: "var(--font-sans)" }}>
            <EventRow Icon={IconEvento} label="Quando" value={`${date} · ${time}`} />
            <EventRow Icon={IconLocal} label="Onde" value={place} />
          </div>
          {sub && (
            <div className="t-body" style={{ marginTop: 56, color: "var(--papel-3)", maxWidth: "24ch" }}>
              <RT>{sub}</RT>
            </div>
          )}
        </div>
        <PostFoot pages="" />
      </div>
    </div>
  );
}
function EventRow({ Icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, color: "var(--papel)" }}>
      <div style={{ width: 56, height: 56, color: "var(--estola-claro)", flexShrink: 0 }}>
        <Icon width="100%" height="100%" />
      </div>
      <div>
        <div
          style={{
            fontFamily: "var(--font-wide)",
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--estola-claro)",
            marginBottom: 4,
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: 36, fontWeight: 500, color: "var(--papel)" }}>{value}</div>
      </div>
    </div>
  );
}

function TplEventV2({ kicker, title, date, time, place, cta, photo, overlayOpacity, kickerColor }) {
  const ov = overlayOpacity ?? 0.75;
  return (
    <div className="t-post t-post--dark t-post--photo t-event-v2">
      {photo && (
        <div className="t-photo-bg">
          <img src={photo} alt="" style={{ objectPosition: 'center 26%' }} />
        </div>
      )}
      <div
        className="t-event-v2__veil"
        style={{
          background: `linear-gradient(180deg, rgba(14,42,71,${Math.max(0.10, 0.10 * ov)}) 0%, rgba(14,42,71,${Math.max(0.28, 0.20 * ov)}) 32%, rgba(14,42,71,${0.70 * ov}) 58%, rgba(14,42,71,${0.95 * ov}) 82%, rgba(14,42,71,${0.98 * ov}) 100%)`,
        }}
      />
      <div className="t-photo-inner t-event-v2__inner">
        <PostHead category="Evento" dark logoWidth={80} logoHeight={92} textScale={1.3} legible />
        <div className="t-eyebrow t-event-v2__kicker" style={{ color: kickerColor || 'var(--ambar)' }}>{kicker}</div>
        <div className="t-event-v2__date">{date}</div>
        <div className="t-event-v2__meta">
          {title}{title && time ? ' · ' : ''}{time}
        </div>
        {place && (
          <div className="t-event-v2__place">
            <div className="t-event-v2__place-icon">
              <IconLocal width="100%" height="100%" />
            </div>
            <div>{place}</div>
          </div>
        )}
        {cta && <div className="t-event-v2__cta">{cta}</div>}
      </div>
    </div>
  );
}

/* ============================================
   TEMPLATE I — Bastidores / comunidade (foto fullbleed minimal)
============================================ */
function TplCommunity({ photo, quote, who }) {
  return (
    <div className="t-post t-post--photo">
      <div className="t-photo-bg">
        <img src={photo} alt="" />
      </div>
      <div
        className="t-photo-overlay"
        style={{
          background: 'linear-gradient(180deg, rgba(14,42,71,0.0) 30%, rgba(14,42,71,0.92) 95%)',
        }}
      />
      <div className="t-photo-inner">
        <PostHead category="Bastidores" dark legible />
        <div style={{ flex: 1 }} />
        <blockquote className="t-community-quote t-community-quote--feed">
          “<RT>{quote}</RT>”
        </blockquote>
        {who && <div className="t-community-who">— {who}</div>}
        <div style={{ height: 56 }} />
        <PostFoot pages="" />
      </div>
    </div>
  );
}

function TplCampaign({ photo, photos, intro, kicker, title, titleEm, body, cta }) {
  const imgs = photo ? [photo] : (photos || []);
  return (
    <div className="t-post t-post--dark t-campaign">
      <div
        className="t-campaign__grid"
        style={{
          gridTemplateColumns: imgs.length > 1 ? '1fr 1fr' : '1fr',
          gridTemplateRows: imgs.length > 2 ? '1fr 1fr' : '1fr',
        }}
      >
        {imgs.map((src, i) => (
          <img key={i} src={src} alt="" className="t-campaign__photo" />
        ))}
      </div>
      <div className="t-campaign__overlay" />
      <div className="t-photo-inner t-campaign__inner">
        <PostHead category="" dark logoWidth={80} logoHeight={92} textScale={1.5} legible />
        <div className="t-campaign__content">
          {intro && <div className="t-campaign__intro">{intro}</div>}
          {kicker && <div className="t-eyebrow t-campaign__kicker">{kicker}</div>}
          <div className="t-title t-campaign__title">
            {title} {titleEm && <em>{titleEm}</em>}
          </div>
          {body && <div className="t-body t-campaign__body"><RT>{body}</RT></div>}
          {cta && <div className="t-campaign__cta">{cta}</div>}
        </div>
        <PostFoot pages="" />
      </div>
    </div>
  );
}

/* ============================================
   TEMPLATE J — Lecionário Diário (STORY 9:16)
   Body usa auto-shrink: o texto bíblico do dia pode variar entre 1 versículo
   (Lucas 24:36) e uma perícope inteira (Mateus 5:1-12). O hook abaixo reduz
   o font-size do corpo até caber no espaço disponível, sem o pastor ter de
   pensar em formatação. min-height:0 + overflow:hidden no body são pré-
   requisitos para que scrollHeight > clientHeight detecte overflow real.
============================================ */
function TplLectionary({
  title = "Lecionário Diário",
  date,
  passages = [],
  body,
  handle,
  fontScale = 1,
}) {
  const brandHandle = getBrandHandle(handle);
  const bodyRef = React.useRef(null);
  React.useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const MAX = 36 * fontScale, MIN = 22 * fontScale;
    let s = MAX;
    el.style.fontSize = s + "px";
    let guard = Math.ceil(MAX - MIN) + 2;
    while (el.scrollHeight > el.clientHeight + 1 && s > MIN && guard-- > 0) {
      s -= 1;
      el.style.fontSize = s + "px";
    }
  }, [body, title, date, passages, fontScale]);

  return (
    <div className="t-story t-lectionary t-lectionary--liturgical">
      <LectionaryBrand />

      {/* Título */}
      <div style={{ textAlign: "center", marginTop: 48, marginBottom: 32, flexShrink: 0 }}>
        <div className="t-lectionary__title">{title}</div>
        {date && <div className="t-lectionary__date">{date}</div>}
      </div>

      <PassagesList passages={passages} />

      {/* Corpo (texto bíblico ou comentário) — auto-shrink */}
      <div
        ref={bodyRef}
        className="t-lectionary__body"
        dangerouslySetInnerHTML={{ __html: body || "" }}
      />

      {/* Rodapé */}
      <div
        style={{
          marginTop: 24,
          paddingTop: 20,
          fontFamily: "var(--font-wide)",
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: "0.1em",
          color: "var(--marinho)",
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        {brandHandle}
      </div>

      <WaveFooter color="var(--estola)" opacity={0.08} />
    </div>
  );
}

/* ============================================
   STORIES
============================================ */
function StoryVerse({ verse, reference }) {
  const brandHandle = getBrandHandle();
  return (
    <div className="t-story">
      <PostHead category="" logoWidth={72} logoHeight={84} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="t-eyebrow" style={{ fontSize: 24 }}>Palavra de hoje</div>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 80,
            lineHeight: 1.25,
            color: "var(--marinho)",
            textWrap: "balance",
          }}
        >
          <RT>{verse}</RT>
        </div>
        <div
          style={{
            marginTop: 48,
            fontFamily: "var(--font-wide)",
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--estola)",
          }}
        >
          {reference}
        </div>
      </div>
      <div
        style={{
          fontFamily: "var(--font-wide)",
          fontSize: 24,
          fontWeight: 500,
          letterSpacing: "0.1em",
          color: "var(--grafite-3)",
        }}
      >
        {brandHandle}
      </div>
      <WaveFooter color="var(--estola)" opacity={0.1} />
    </div>
  );
}

function StoryEvent({ kicker, title, date, time, place, photo }) {
  return (
    <div className="t-story t-story--photo">
      <div className="t-photo-bg">
        <img src={photo} alt="" />
      </div>
      <div className="t-story-event__veil" />
      <div className="t-story-event__inner">
        <PostHead category="" dark logoWidth={80} logoHeight={92} textScale={1.2} legible />
        <div style={{ flex: 1 }} />
        <div className="t-story-event-kicker">{kicker}</div>
        <div className="t-story-event-title t-story-event-title--hero">{title}</div>
        <div className="t-story-event-meta">
          <div className="t-story-event-row">
            <span className="t-story-event-row__icon">
              <IconEvento width="100%" height="100%" />
            </span>
            <span className="t-story-event-row__text">{date} · {time}</span>
          </div>
          <div className="t-story-event-row">
            <span className="t-story-event-row__icon">
              <IconLocal width="100%" height="100%" />
            </span>
            <span className="t-story-event-row__text">{place}</span>
          </div>
        </div>
        <div className="t-story-event-cta">Toca aqui pra confirmar →</div>
      </div>
    </div>
  );
}

function StoryQuote({ quote, who, photo }) {
  const brandHandle = getBrandHandle();
  return (
    <div className="t-story t-story-quote">
      <PostHead category="" logoWidth={72} logoHeight={84} />
      <div className="t-story-quote-body">
        {photo && (
          <div className="t-story-quote-photo t-story-quote-photo--lg">
            <img src={photo} alt="" />
          </div>
        )}
        <blockquote className="t-community-quote t-story-quote-text">
          “<RT>{quote}</RT>”
        </blockquote>
        {who && <div className="t-community-who">{who}</div>}
      </div>
      <div className="t-story-quote-handle">{brandHandle}</div>
    </div>
  );
}

function IconSpotify() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 1.5A10.5 10.5 0 1 0 22.5 12A10.51 10.51 0 0 0 12 1.5Zm4.63 15.4a.85.85 0 0 1-1.17.28c-3.2-1.96-7.23-2.4-11.98-1.31a.85.85 0 1 1-.38-1.66c5.2-1.19 9.66-.68 13.25 1.51a.85.85 0 0 1 .28 1.18Zm1.24-3.1a1.06 1.06 0 0 1-1.46.35c-3.66-2.25-9.24-2.9-13.57-1.59a1.06 1.06 0 1 1-.62-2.04c4.94-1.5 11.09-.77 15.3 1.82a1.06 1.06 0 0 1 .35 1.46Zm.11-3.23C13.62 7.97 6.4 7.72 2.72 8.84a1.28 1.28 0 1 1-.74-2.45C6.2 5.11 14.17 5.4 19.1 8.33a1.28 1.28 0 1 1-1.3 2.2Z" />
    </svg>
  );
}

function StorySpotify({
  photo,
  logoSrc,
  eyebrow = 'Palavra & Liturgia',
  title,
  titleEm,
  titleAccent,
  speaker,
  refs,
  ctaText = 'Ouça no Spotify',
  handle = '@igrejaanglicanario',
}) {
  const { line1, line2 } = getBrandLines();
  const brandLogo = getBrandLogo(logoSrc);
  const brandName = getBrandName();
  const brandHandle = getBrandHandle(handle);
  return (
    <div className="t-story t-spotify-story">
      <div className="t-spotify-story__halo" />
      {photo && <img className="t-spotify-story__photo" src={photo} alt="" />}
      <div className="t-spotify-story__tint" />
      <div className="t-spotify-story__veil" />
      <div className="t-spotify-story__frame" />
      <span className="t-spotify-story__corner t-spotify-story__corner--tl" />
      <span className="t-spotify-story__corner t-spotify-story__corner--tr" />
      <span className="t-spotify-story__corner t-spotify-story__corner--bl" />
      <span className="t-spotify-story__corner t-spotify-story__corner--br" />
      <div className="t-spotify-story__inner">
        <div className="t-spotify-story__brand">
          {brandLogo && <img src={brandLogo} alt={brandName} className="t-spotify-story__logo" />}
          <div className="t-spotify-story__brand-text">
            <span>{line1}</span>
            {line2 || 'RIO'}
          </div>
        </div>
        <div className="t-spotify-story__body">
          <div className="t-spotify-story__eyebrow">{eyebrow}</div>
          <div className="t-spotify-story__rule" />
          <h1 className="t-spotify-story__title">
            {title}{' '}
            {titleEm && <em>{titleEm}</em>}
            {' '}homo{' '}
            {titleAccent && <em className="t-spotify-story__accent">{titleAccent}</em>}
          </h1>
          {speaker && <div className="t-spotify-story__speaker">{speaker}</div>}
          {refs && <div className="t-spotify-story__refs">{refs}</div>}
        </div>
        <div className="t-spotify-story__foot">
          {ctaText && (
            <div className="t-spotify-story__cta">
              <IconSpotify />
              {ctaText}
            </div>
          )}
          <div className="t-spotify-story__handle">{brandHandle}</div>
        </div>
      </div>
    </div>
  );
}

function CapaSpotify({
  logoSrc,
  eyebrow = 'Podcast',
  title,
  titleEm,
  titleLine2,
  sub,
  tag = 'Sacramental · Litúrgica · Carioca',
}) {
  const brandLogo = getBrandLogo(logoSrc);
  const brandName = getBrandName();
  return (
    <div className="t-spotify-cover">
      <div className="t-spotify-cover__halo" />
      <div className="t-spotify-cover__frame" />
      <span className="t-spotify-cover__corner t-spotify-cover__corner--tl" />
      <span className="t-spotify-cover__corner t-spotify-cover__corner--tr" />
      <span className="t-spotify-cover__corner t-spotify-cover__corner--bl" />
      <span className="t-spotify-cover__corner t-spotify-cover__corner--br" />
      <div className="t-spotify-cover__inner">
        {brandLogo && <img className="t-spotify-cover__logo" src={brandLogo} alt={brandName} />}
        <div className="t-spotify-cover__eyebrow">{eyebrow}</div>
        <div className="t-spotify-cover__rule" />
        <h1 className="t-spotify-cover__title">
          {title} {titleEm && <em>{titleEm}</em>}
          {titleLine2 && <><br />{titleLine2}</>}
        </h1>
        {sub && <p className="t-spotify-cover__sub">{sub}</p>}
      </div>
      {tag && <div className="t-spotify-cover__tag">{tag}</div>}
    </div>
  );
}

function BannerYouTube({
  logoSrc,
  eyebrow = 'Igreja Anglicana Rio',
  title,
  titleEm,
  sub = 'Sacramental · Litúrgica · Carioca',
}) {
  const brandLogo = getBrandLogo(logoSrc);
  const brandName = getBrandName(eyebrow);
  return (
    <div className="t-youtube-banner">
      <div className="t-youtube-banner__halo" />
      <div className="t-youtube-banner__safe">
        {brandLogo && <img className="t-youtube-banner__logo" src={brandLogo} alt={brandName} />}
        <div className="t-youtube-banner__divider" />
        <div className="t-youtube-banner__txt">
          <div className="t-youtube-banner__eyebrow">{brandName}</div>
          <h1 className="t-youtube-banner__title">
            {title} {titleEm && <em>{titleEm}</em>}
          </h1>
          {sub && <div className="t-youtube-banner__sub">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

/* ============================================
   IMPRESSO — Capa de boletim/folheto A4
============================================ */
function PrintFolder({ title, subtitle, date, photo, clergy = '', tagline = '' }) {
  const { line1, line2 } = getBrandLines();
  const brandName = getBrandName();
  const brandHandle = getBrandHandle();
  return (
    <div className="t-print">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="t-mark">
          <IconLogoMarca width={72} height={84} />
          <div className="t-mark__text">
            <span>{line1}</span>
            {line2 || 'RIO'}
          </div>
        </div>
        <div
          style={{
            fontFamily: "var(--font-wide)",
            fontSize: 18,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--grafite-3)",
          }}
        >
          {date}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 32 }}>
        <div
          style={{
            fontFamily: "var(--font-wide)",
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "var(--estola)",
          }}
        >
          Boletim Litúrgico
        </div>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 140,
            lineHeight: 0.96,
            fontWeight: 500,
            color: "var(--marinho)",
            letterSpacing: "-0.02em",
            textWrap: "balance",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 36,
            color: "var(--grafite-2)",
            maxWidth: "30ch",
            textWrap: "pretty",
          }}
        >
          {subtitle}
        </div>
      </div>

      {photo && (
        <div
          style={{
            height: 480,
            borderRadius: 8,
            overflow: "hidden",
            margin: "32px 0",
          }}
        >
          <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          paddingTop: 24,
          borderTop: "1px solid var(--linha)",
          fontFamily: "var(--font-sans)",
          fontSize: 18,
          color: "var(--grafite-2)",
        }}
      >
        <div>
          <div style={{ fontWeight: 600, color: "var(--marinho)" }}>{brandName}</div>
          {clergy && <div>{clergy}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          <div>{brandHandle}</div>
          {tagline && <div style={{ color: "var(--grafite-3)" }}>{tagline}</div>}
        </div>
      </div>
    </div>
  );
}

/* ============================================
   SÉRIE — Mitos e Verdades sobre o Anglicanismo
============================================ */
function MitoSeriesTag({ num }) {
  return (
    <div className="t-mito-tag">
      <span>Mitos e Verdades</span>
      {num && <span className="t-mito-tag__num">#{num}</span>}
    </div>
  );
}

function TplMitoCover({ num = "1", question, sub, category = "Mitos e Verdades" }) {
  return (
    <div className="t-post">
      <PostHead category={category} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <MitoSeriesTag num={num} />
        <div className="t-title t-title--sm"><RT>{question}</RT></div>
        <div className="t-rule-accent" />
        {sub && <div className="t-sub" style={{ maxWidth: "24ch" }}><RT>{sub}</RT></div>}
      </div>
      <PostFoot pages="1" />
      <WaveFooter color="var(--estola)" opacity={0.08} />
    </div>
  );
}

function TplMitoVerdict({ verdict = "mito", claim, body, page, category = "" }) {
  const isMito = verdict !== "verdade";
  return (
    <div className="t-post">
      <PostHead category={category} compact />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className={`t-mito-badge ${isMito ? "t-mito-badge--mito" : "t-mito-badge--verdade"}`}>
          <span className="t-mito-badge__icon">{isMito ? "✕" : "✓"}</span>
          {isMito ? "Mito" : "Verdade"}
        </div>
        {claim && <div className="t-mito-claim"><RT>{claim}</RT></div>}
        {body && <div className="t-body" style={{ maxWidth: "26ch" }}><RT>{body}</RT></div>}
      </div>
      <PostFoot pages={page} />
    </div>
  );
}

function TplMitoArg({ symbol = "📜", body, punch, page, category = "" }) {
  return (
    <div className="t-post">
      <PostHead category={category} compact />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {symbol && <div className="t-mito-symbol">{symbol}</div>}
        {body && <div className="t-body" style={{ maxWidth: "26ch" }}><RT>{body}</RT></div>}
        {punch && <div className="t-mito-punch"><RT>{punch}</RT></div>}
      </div>
      <PostFoot pages={page} />
    </div>
  );
}

function TplMitoCta({ symbol = "💬", title, body, page, category = "" }) {
  return (
    <div className="t-post t-post--dark">
      <PostHead category={category} dark compact />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {symbol && <div className="t-mito-symbol">{symbol}</div>}
        {title && <div className="t-h2" style={{ color: "var(--papel)" }}><RT>{title}</RT></div>}
        {body && <div className="t-body" style={{ maxWidth: "26ch" }}><RT>{body}</RT></div>}
      </div>
      <PostFoot pages={page} dark />
      <WaveFooter color="var(--estola-claro)" opacity={0.16} />
    </div>
  );
}

/* exporta para o app */
Object.assign(window, {
  Post,
  Story,
  Print,
  TplCoverType,
  TplCoverPhoto,
  TplCoverIcon,
  TplBodyNum,
  TplBodyIcon,
  TplCloseCTA,
  TplVerse,
  TplEvent,
  TplEventV2,
  TplCommunity,
  TplCampaign,
  StoryVerse,
  StoryEvent,
  StoryQuote,
  StorySpotify,
  CapaSpotify,
  BannerYouTube,
  PrintFolder,
  TplLectionary,
  TplMitoCover,
  TplMitoVerdict,
  TplMitoArg,
  TplMitoCta,
});
