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
function PostHead({ category, dark = false, compact = false }) {
  return (
    <div className="t-head" style={compact ? { marginBottom: 32 } : {}}>
      <div className="t-mark">
        <IconLogoMarca width={56} height={64} variant={dark ? "light" : "dark"} />
        <div className="t-mark__text">
          <span>Igreja Anglicana</span>
          RIO
        </div>
      </div>
      {category && <div className="t-category">{category}</div>}
    </div>
  );
}

function PostFoot({ pages, handle = "@igrejaanglicanario", dark = false }) {
  return (
    <div className="t-foot">
      <div className="t-foot__handle">{handle}</div>
      {pages && <div className="t-foot__pages">{pages}</div>}
    </div>
  );
}

function quoteFontSize(quote, max = 64, min = 40) {
  const len = (quote || "").trim().length;
  if (len > 72) return min;
  if (len > 58) return min + 6;
  if (len > 44) return min + 12;
  if (len > 32) return min + 18;
  return max;
}

function LectionaryBrand() {
  return (
    <div className="t-lectionary-brand">
      <IconLogoMarca width={120} height={138} variant="dark" />
      <div className="t-lectionary-brand__text">
        <div className="t-lectionary-brand__line">Igreja Anglicana</div>
        <div className="t-lectionary-brand__rio">Rio</div>
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
function TplCoverType({ eyebrow = "Anglicanismo 101", title, titleEm, sub }) {
  return (
    <div className="t-post">
      <PostHead category="Carrossel" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="t-eyebrow">{eyebrow}</div>
        <div className="t-title">
          {title} {titleEm && <em>{titleEm}</em>}
        </div>
        {sub && <div className="t-sub">{sub}</div>}
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
function TplCoverPhoto({ photo, eyebrow, title, titleEm, sub }) {
  return (
    <div className="t-post t-post--photo">
      <div className="t-photo-bg">
        <img src={photo} alt="" />
      </div>
      <div className="t-photo-overlay" />
      <div className="t-photo-inner">
        <PostHead category="Comunidade" dark />
        <div className="t-photo-bottom">
          <div className="t-eyebrow" style={{ color: "var(--estola-claro)" }}>{eyebrow}</div>
          <div className="t-title" style={{ color: "var(--papel)" }}>
            {title} {titleEm && <em style={{ color: "var(--papel)" }}>{titleEm}</em>}
          </div>
          {sub && <div className="t-sub" style={{ color: "var(--papel-3)" }}>{sub}</div>}
          <PostFoot pages="1 / 1" />
        </div>
      </div>
    </div>
  );
}

/* ============================================
   TEMPLATE C — Capa com ícone (clean)
============================================ */
function TplCoverIcon({ Icon, eyebrow, title, titleEm, sub, accent = "var(--estola)" }) {
  return (
    <div className="t-post">
      <PostHead category="Liturgia" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ width: 200, height: 200, color: accent, marginBottom: 40 }}>
          <Icon width="100%" height="100%" />
        </div>
        <div className="t-eyebrow">{eyebrow}</div>
        <div className="t-title">
          {title} {titleEm && <em>{titleEm}</em>}
        </div>
        {sub && <div className="t-sub">{sub}</div>}
      </div>
      <PostFoot pages="1 / 5" />
    </div>
  );
}

/* ============================================
   TEMPLATE D — Slide miolo (número grande)
============================================ */
function TplBodyNum({ num, title, body, page }) {
  return (
    <div className="t-post">
      <PostHead category="Anglicanismo 101" compact />
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
function TplBodyIcon({ Icon, eyebrow, title, body, page, accent = "var(--estola)" }) {
  return (
    <div className="t-post">
      <PostHead category="Anglicanismo 101" compact />
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
function TplCloseCTA({ title, sub, ctaText, page = "6 / 6", dark = true }) {
  return (
    <div className={`t-post ${dark ? "t-post--dark" : ""}`}>
      <PostHead category="Vem com a gente" dark={dark} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="t-h2" style={{ color: dark ? "var(--papel)" : "var(--marinho)", fontSize: 96 }}>
          {title}
        </div>
        {sub && (
          <div className="t-body" style={{ marginTop: 32, marginBottom: 56, fontSize: 32, maxWidth: "26ch" }}>
            {sub}
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
          <div className="t-verse">{verse}</div>
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
        <PostHead category="Evento" dark />
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
              {sub}
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

/* ============================================
   TEMPLATE I — Bastidores / comunidade (foto fullbleed minimal)
============================================ */
function TplCommunity({ photo, quote, who }) {
  const quoteSize = quoteFontSize(quote);
  return (
    <div className="t-post t-post--photo">
      <div className="t-photo-bg">
        <img src={photo} alt="" />
      </div>
      <div
        className="t-photo-overlay"
        style={{
          background:
            "linear-gradient(180deg, rgba(14,42,71,0.0) 30%, rgba(14,42,71,0.92) 95%)",
        }}
      />
      <div className="t-photo-inner">
        <PostHead category="Bastidores" dark />
        <div className="t-photo-bottom">
          <blockquote className="t-community-quote" style={{ fontSize: quoteSize }}>
            “{quote}”
          </blockquote>
          {who && <div className="t-community-who">{who}</div>}
          <PostFoot pages="" />
        </div>
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
  handle = "@igrejaanglicanario",
}) {
  const bodyRef = React.useRef(null);
  React.useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const MAX = 36, MIN = 22;
    let s = MAX;
    el.style.fontSize = s + "px";
    let guard = (MAX - MIN) + 2;
    while (el.scrollHeight > el.clientHeight + 1 && s > MIN && guard-- > 0) {
      s -= 1;
      el.style.fontSize = s + "px";
    }
  }, [body, title, date, passages]);

  return (
    <div className="t-story t-lectionary">
      <LectionaryBrand />

      {/* Título */}
      <div style={{ textAlign: "center", marginTop: 48, marginBottom: 32, flexShrink: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 88,
            fontWeight: 600,
            color: "var(--marinho)",
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </div>
        {date && (
          <div
            style={{
              marginTop: 14,
              fontFamily: "var(--font-wide)",
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--estola)",
            }}
          >
            {date}
          </div>
        )}
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
        {handle}
      </div>

      <WaveFooter color="var(--estola)" opacity={0.08} />
    </div>
  );
}

/* ============================================
   STORIES
============================================ */
function StoryVerse({ verse, reference }) {
  return (
    <div className="t-story">
      <div style={{ width: 120, height: 138, color: "var(--marinho)", marginBottom: 64 }}>
        <IconLogoMarca width="100%" height="100%" />
      </div>
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
          {verse}
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
        @igrejaanglicanario
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
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(14,42,71,0.4) 0%, rgba(14,42,71,0.5) 40%, rgba(14,42,71,0.95) 100%)",
        }}
      />
      <div className="t-photo-inner t-story-event-inner">
        <div className="t-story-mark" style={{ width: 100, height: 115 }}>
          <IconLogoMarca width={100} height={115} variant="light" />
        </div>
        <div className="t-photo-bottom">
          <div className="t-story-event-kicker">{kicker}</div>
          <div className="t-story-event-title">{title}</div>
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
    </div>
  );
}

function StoryQuote({ quote, who, photo }) {
  const quoteSize = quoteFontSize(quote, 64, 44);
  return (
    <div className="t-story t-story-quote">
      <div className="t-story-mark" style={{ width: 100, height: 115, color: "var(--marinho)" }}>
        <IconLogoMarca width="100%" height="100%" />
      </div>
      <div className="t-story-quote-body">
        {photo && (
          <div className="t-story-quote-photo">
            <img src={photo} alt="" />
          </div>
        )}
        <blockquote className="t-community-quote t-story-quote-text" style={{ fontSize: quoteSize }}>
          “{quote}”
        </blockquote>
        {who && <div className="t-community-who">{who}</div>}
      </div>
      <div className="t-story-quote-handle">@igrejaanglicanario</div>
    </div>
  );
}

/* ============================================
   IMPRESSO — Capa de boletim/folheto A4
============================================ */
function PrintFolder({ title, subtitle, date, photo }) {
  return (
    <div className="t-print">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="t-mark">
          <IconLogoMarca width={72} height={84} />
          <div className="t-mark__text">
            <span>Igreja Anglicana</span>
            RIO
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
          <div style={{ fontWeight: 600, color: "var(--marinho)" }}>Igreja Anglicana Rio</div>
          <div>Rev. Jorge Alcino · Revda. Raquel Fernandes</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div>@igrejaanglicanario</div>
          <div style={{ color: "var(--grafite-3)" }}>Em plantação — uma igreja família</div>
        </div>
      </div>
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
  TplCommunity,
  StoryVerse,
  StoryEvent,
  StoryQuote,
  PrintFolder,
  TplLectionary,
});
