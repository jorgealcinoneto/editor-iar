/* ============================================
   IAR — Editor app
   Form → live preview → download PNG
============================================ */

const { useState, useRef, useEffect, useCallback } = React;

const {
  IconArco, IconJanelaRio, IconCruzCelta, IconCalice, IconPomba,
  IconOndas, IconCasa, IconLivro, IconVela, IconCoracao,
  IconMaos, IconComunidade, IconAurora, IconEvento, IconTestemunho,
  IconLocal, IconLogoMarca,
} = window.IARIcons;

const {
  Post, Story, Print,
  TplCoverType, TplCoverPhoto, TplCoverIcon,
  TplBodyNum, TplBodyIcon, TplCloseCTA,
  TplVerse, TplEvent, TplCommunity, TplLectionary,
  StoryVerse, StoryEvent, StoryQuote, PrintFolder,
} = window;

/* ============================================
   Disponíveis: ícones e fotos
============================================ */
const ICON_OPTIONS = [
  { key: "calice", Icon: IconCalice, label: "Cálice" },
  { key: "cruz", Icon: IconCruzCelta, label: "Cruz celta" },
  { key: "pomba", Icon: IconPomba, label: "Pomba" },
  { key: "livro", Icon: IconLivro, label: "Livro" },
  { key: "casa", Icon: IconCasa, label: "Casa" },
  { key: "vela", Icon: IconVela, label: "Vela" },
  { key: "coracao", Icon: IconCoracao, label: "Coração" },
  { key: "maos", Icon: IconMaos, label: "Mãos" },
  { key: "comunidade", Icon: IconComunidade, label: "Comunidade" },
  { key: "aurora", Icon: IconAurora, label: "Aurora" },
  { key: "evento", Icon: IconEvento, label: "Evento" },
  { key: "ondas", Icon: IconOndas, label: "Ondas" },
];
const findIcon = (key) => ICON_OPTIONS.find((i) => i.key === key)?.Icon || IconCalice;

const PRESET_PHOTOS = [
  "assets/photo-comunidade-1.jpg",
  "assets/photo-comunidade-2.jpg",
  "assets/photo-altar-padre.jpg",
  "assets/photo-altar-close.jpg",
  "assets/photo-mesa-altar.jpg",
  "assets/photo-mesa-agape.jpg",
  "assets/photo-padre-1.jpg",
  "assets/photo-padre-2.jpg",
  "assets/photo-banda.jpg",
  "assets/photo-crianca-craft.jpg",
  "assets/photo-criancas-craft.jpg",
  "assets/photo-irmas-abraco.jpg",
  "assets/photo-comunhao.jpg",
];

/* ============================================
   Definições dos templates
============================================ */
const TEMPLATES = [
  {
    id: "cover-type",
    name: "Capa tipográfica",
    group: "Feed · Carrossel",
    w: 1080, h: 1080,
    defaults: {
      eyebrow: "Anglicanismo 101 · 01",
      title: "O que é o",
      titleEm: "Anglicanismo?",
      sub: "Em 5 slides, sem enrolação.",
    },
    fields: [
      { name: "eyebrow", label: "Categoria (eyebrow)", type: "text", hint: "Ex: 'Anglicanismo 101 · 01'" },
      { name: "title", label: "Título — início", type: "text" },
      { name: "titleEm", label: "Título — palavra em itálico", type: "text", hint: "Destaque em azul-estola" },
      { name: "sub", label: "Subtítulo", type: "textarea", hint: "Até 1 linha curta" },
    ],
    render: (c) => <TplCoverType {...c} />,
  },
  {
    id: "cover-photo",
    name: "Capa com foto",
    group: "Feed · Carrossel",
    w: 1080, h: 1080,
    defaults: {
      photo: "assets/photo-irmas-abraco.jpg",
      eyebrow: "Domingo passado",
      title: "A gente é",
      titleEm: "essa cena.",
      sub: "Eucaristia da família.",
    },
    fields: [
      { name: "photo", label: "Foto de fundo", type: "photo" },
      { name: "eyebrow", label: "Categoria", type: "text" },
      { name: "title", label: "Título — início", type: "text" },
      { name: "titleEm", label: "Título — itálico", type: "text" },
      { name: "sub", label: "Subtítulo", type: "textarea" },
    ],
    render: (c) => <TplCoverPhoto {...c} />,
  },
  {
    id: "cover-icon",
    name: "Capa com ícone",
    group: "Feed · Carrossel",
    w: 1080, h: 1080,
    defaults: {
      icon: "calice",
      eyebrow: "Liturgia · Eucaristia",
      title: "Por que a gente",
      titleEm: "parte o pão?",
      sub: "Quase 2000 anos fazendo o mesmo gesto.",
    },
    fields: [
      { name: "icon", label: "Ícone", type: "icon" },
      { name: "eyebrow", label: "Categoria", type: "text" },
      { name: "title", label: "Título — início", type: "text" },
      { name: "titleEm", label: "Título — itálico", type: "text" },
      { name: "sub", label: "Subtítulo", type: "textarea" },
    ],
    render: (c) => <TplCoverIcon {...c} Icon={findIcon(c.icon)} />,
  },
  {
    id: "body-num",
    name: "Miolo — número",
    group: "Feed · Carrossel",
    w: 1080, h: 1080,
    defaults: {
      num: "i.",
      title: "O caminho do meio.",
      body: "A gente fica <strong>entre</strong> o catolicismo romano e o protestantismo. Os dois, ao mesmo tempo.",
      page: "2 / 6",
    },
    fields: [
      { name: "num", label: "Número/Letra grande", type: "text", hint: "Ex: 'i.', '01', '80M', '500'" },
      { name: "title", label: "Título do slide", type: "text" },
      { name: "body", label: "Texto corpo", type: "textarea", hint: "Use <strong>palavra</strong> pra destacar" },
      { name: "page", label: "Página", type: "text", hint: "Ex: '2 / 6'" },
    ],
    render: (c) => <TplBodyNum {...c} />,
  },
  {
    id: "body-icon",
    name: "Miolo — ícone",
    group: "Feed · Carrossel",
    w: 1080, h: 1080,
    defaults: {
      icon: "livro",
      eyebrow: "Tradição + Razão + Escritura",
      title: "Os três pilares.",
      body: "Anglicanismo se apoia em três coisas: <strong>Escritura</strong>, <strong>Tradição</strong> e <strong>Razão</strong>.",
      page: "3 / 6",
    },
    fields: [
      { name: "icon", label: "Ícone", type: "icon" },
      { name: "eyebrow", label: "Eyebrow (opcional)", type: "text" },
      { name: "title", label: "Título", type: "text" },
      { name: "body", label: "Corpo", type: "textarea", hint: "Use <strong>palavra</strong> pra destacar" },
      { name: "page", label: "Página", type: "text" },
    ],
    render: (c) => <TplBodyIcon {...c} Icon={findIcon(c.icon)} />,
  },
  {
    id: "close-cta",
    name: "Encerramento (CTA)",
    group: "Feed · Carrossel",
    w: 1080, h: 1080,
    defaults: {
      title: "Vem domingo.",
      sub: "Eucaristia às 10h. Café depois. Sem cobrança, sem inscrição.",
      ctaText: "Como chegar",
      page: "6 / 6",
    },
    fields: [
      { name: "title", label: "Frase principal (CTA)", type: "text" },
      { name: "sub", label: "Sub (contexto)", type: "textarea" },
      { name: "ctaText", label: "Texto do botão", type: "text" },
      { name: "page", label: "Página", type: "text" },
    ],
    render: (c) => <TplCloseCTA {...c} dark={true} />,
  },
  {
    id: "verse",
    name: "Versículo do dia",
    group: "Feed · Devocional",
    w: 1080, h: 1080,
    defaults: {
      verse: "Eu sou o caminho, a verdade e a vida.",
      reference: "João 14, 6",
      eyebrow: "Palavra de hoje",
    },
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "verse", label: "Versículo", type: "textarea", hint: "Até 100 caracteres" },
      { name: "reference", label: "Referência bíblica", type: "text", hint: "Ex: 'João 14, 6'" },
    ],
    render: (c) => <TplVerse {...c} />,
  },
  {
    id: "community",
    name: "Comunidade (foto+frase)",
    group: "Feed · Comunidade",
    w: 1080, h: 1080,
    defaults: {
      photo: "assets/photo-crianca-craft.jpg",
      quote: "Espírito Santo feito de algodão, na mesa da catequese.",
      who: "Domingo, 24 de maio",
    },
    fields: [
      { name: "photo", label: "Foto de fundo", type: "photo" },
      { name: "quote", label: "Frase/citação", type: "textarea", hint: "Até 80 caracteres" },
      { name: "who", label: "Atribuição", type: "text", hint: "Ex: 'Maria, 28' ou data" },
    ],
    render: (c) => <TplCommunity {...c} />,
  },
  {
    id: "event",
    name: "Convite de evento",
    group: "Feed · Evento",
    w: 1080, h: 1080,
    defaults: {
      photo: "assets/photo-mesa-altar.jpg",
      kicker: "Eucaristia da família",
      title: "Domingo na sala.",
      date: "01 de Junho",
      time: "10h",
      place: "Recreio · endereço por DM",
      sub: "Tem café depois. Pode trazer criança.",
    },
    fields: [
      { name: "photo", label: "Foto de fundo (opcional)", type: "photo" },
      { name: "kicker", label: "Categoria do evento", type: "text" },
      { name: "title", label: "Título do evento", type: "text" },
      { name: "date", label: "Data", type: "text" },
      { name: "time", label: "Hora", type: "text" },
      { name: "place", label: "Local", type: "text" },
      { name: "sub", label: "Subtítulo (opcional)", type: "textarea" },
    ],
    render: (c) => <TplEvent {...c} />,
  },
  {
    id: "story-verse",
    name: "Story · Versículo",
    group: "Story 9:16",
    w: 1080, h: 1920,
    defaults: {
      verse: "Vinde a mim todos os que estão cansados e sobrecarregados.",
      reference: "Mateus 11, 28",
    },
    fields: [
      { name: "verse", label: "Versículo", type: "textarea" },
      { name: "reference", label: "Referência", type: "text" },
    ],
    render: (c) => <StoryVerse {...c} />,
  },
  {
    id: "story-event",
    name: "Story · Evento",
    group: "Story 9:16",
    w: 1080, h: 1920,
    defaults: {
      photo: "assets/photo-mesa-altar.jpg",
      kicker: "Esse domingo",
      title: "Vem participar.",
      date: "01 Jun",
      time: "10h",
      place: "Recreio · RJ",
    },
    fields: [
      { name: "photo", label: "Foto de fundo", type: "photo" },
      { name: "kicker", label: "Kicker", type: "text" },
      { name: "title", label: "Título", type: "text" },
      { name: "date", label: "Data", type: "text" },
      { name: "time", label: "Hora", type: "text" },
      { name: "place", label: "Local", type: "text" },
    ],
    render: (c) => <StoryEvent {...c} />,
  },
  {
    id: "story-quote",
    name: "Story · Citação",
    group: "Story 9:16",
    w: 1080, h: 1920,
    defaults: {
      quote: "A oração da Coleta é antiga, mas é exatamente o que eu precisava hoje.",
      who: "Maria, 28",
      photo: "assets/photo-irmas-abraco.jpg",
    },
    fields: [
      { name: "photo", label: "Foto da pessoa (redonda)", type: "photo" },
      { name: "quote", label: "Citação", type: "textarea" },
      { name: "who", label: "Quem disse", type: "text" },
    ],
    render: (c) => <StoryQuote {...c} />,
  },
  {
    id: "lectionary",
    name: "Lecionário diário",
    group: "Story 9:16",
    w: 1080, h: 1920,
    defaults: {
      title: "Lecionário Diário",
      date: "25 de Maio · Domingo",
      passage1: "Joel 2:18-29",
      passage2: "I Coríntios 12:13-27",
      passage3: "Salmos 104:24-34",
      passage4: "Lucas 24:36-43",
      body: '<sup>36</sup>Enquanto falavam sobre isso, o próprio Jesus apresentou-se entre eles e lhes disse: <strong>"Paz seja com vocês!"</strong> <sup>37</sup>Eles ficaram assustados e com medo, pensando que estavam vendo um espírito. <sup>38</sup>Ele lhes disse: <strong>"Por que vocês estão perturbados e por que se levantam dúvidas em seus corações?"</strong>',
    },
    fields: [
      { name: "title", label: "Título", type: "text" },
      { name: "date", label: "Data / dia litúrgico", type: "text", hint: "Ex: '25 de Maio · Domingo Trindade'" },
      { name: "passage1", label: "Passagem 1", type: "text" },
      { name: "passage2", label: "Passagem 2", type: "text" },
      { name: "passage3", label: "Passagem 3", type: "text" },
      { name: "passage4", label: "Passagem 4", type: "text" },
      {
        name: "body",
        label: "Texto bíblico ou comentário",
        type: "textarea",
        hint: 'Use <sup>36</sup> pra número de versículo · <strong>texto</strong> pra negrito',
      },
    ],
    render: (c) => (
      <TplLectionary
        title={c.title}
        date={c.date}
        passages={[c.passage1, c.passage2, c.passage3, c.passage4]}
        body={c.body}
      />
    ),
  },
];

/* ============================================
   Form field components
============================================ */
function Field({ field, value, onChange }) {
  if (field.type === "text") {
    return (
      <div className="field">
        <label className="field__label">{field.label}</label>
        <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} />
        {field.hint && <div className="field__hint">{field.hint}</div>}
      </div>
    );
  }
  if (field.type === "textarea") {
    return (
      <div className="field">
        <label className="field__label">{field.label}</label>
        <textarea rows={3} value={value || ""} onChange={(e) => onChange(e.target.value)} />
        {field.hint && <div className="field__hint">{field.hint}</div>}
      </div>
    );
  }
  if (field.type === "icon") {
    return (
      <div className="field">
        <label className="field__label">{field.label}</label>
        <div className="icon-picker">
          {ICON_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              className={value === opt.key ? "active" : ""}
              onClick={() => onChange(opt.key)}
              title={opt.label}
            >
              <opt.Icon />
            </button>
          ))}
        </div>
      </div>
    );
  }
  if (field.type === "photo") {
    const onFile = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => onChange(ev.target.result);
      reader.readAsDataURL(file);
    };
    const showPreview = value && (value.startsWith("data:") || value.startsWith("assets/"));
    return (
      <div className="field">
        <label className="field__label">{field.label}</label>
        <label className="file-field">
          <div className="file-field__preview">
            {showPreview && <img src={value} alt="" />}
          </div>
          <div className="file-field__text">
            <strong>Subir do celular/computador</strong>
            JPG ou PNG · mínimo 1080×1080 pra ficar nítido
          </div>
          <input type="file" accept="image/*" onChange={onFile} />
        </label>
        <div className="field__hint" style={{ marginTop: 8 }}>Ou escolha uma da galeria:</div>
        <div className="preset-photos">
          {PRESET_PHOTOS.map((src) => (
            <button
              key={src}
              type="button"
              className={value === src ? "active" : ""}
              onClick={() => onChange(src)}
              title="Usar essa"
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

/* ============================================
   Preview area
============================================ */
function Preview({ tpl, content, scale }) {
  // Visible preview (scaled to fit)
  // The wrapping Post component takes scale, content goes inside its render function
  if (tpl.w === 1080 && tpl.h === 1920) {
    return (
      <Post w={1080} h={1920} scale={scale}>
        {tpl.render(content)}
      </Post>
    );
  }
  if (tpl.w === 1240 && tpl.h === 1754) {
    return (
      <Post w={1240} h={1754} scale={scale}>
        {tpl.render(content)}
      </Post>
    );
  }
  return (
    <Post w={1080} h={1080} scale={scale}>
      {tpl.render(content)}
    </Post>
  );
}

/* ============================================
   App
============================================ */
function App() {
  const [tplId, setTplId] = useState(TEMPLATES[0].id);
  const [contents, setContents] = useState(() => {
    const initial = {};
    TEMPLATES.forEach((t) => { initial[t.id] = { ...t.defaults }; });
    return initial;
  });
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState("");
  const exportRef = useRef(null);

  const tpl = TEMPLATES.find((t) => t.id === tplId);
  const content = contents[tplId];

  // Compute visible scale to fit comfortably
  const stageMaxW = 600;
  const visibleScale = (() => {
    if (tpl.w === 1080 && tpl.h === 1920) {
      // story: limit by height instead
      const targetH = 720;
      return targetH / tpl.h;
    }
    if (tpl.w === 1240 && tpl.h === 1754) {
      return 540 / tpl.w;
    }
    return stageMaxW / tpl.w;
  })();

  const update = (field, val) => {
    setContents((prev) => ({
      ...prev,
      [tplId]: { ...prev[tplId], [field]: val },
    }));
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  };

  const onDownload = useCallback(async () => {
    if (!exportRef.current) return;
    setDownloading(true);
    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      const node = exportRef.current.querySelector(".post-inner");
      const dataUrl = await window.htmlToImage.toPng(node, {
        width: tpl.w,
        height: tpl.h,
        pixelRatio: 1,
        backgroundColor: tpl.w === 1080 && tpl.h === 1080 ? "#F5EFE6" : null,
        cacheBust: true,
      });
      const link = document.createElement("a");
      const fname = `iar-${tpl.id}-${Date.now()}.png`;
      link.download = fname;
      link.href = dataUrl;
      link.click();
      showToast("PNG baixado · agora é só postar");
    } catch (err) {
      console.error(err);
      showToast("Algo deu errado · tente novamente");
    } finally {
      setDownloading(false);
    }
  }, [tpl]);

  return (
    <>
      {/* Top bar */}
      <div className="editor-bar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <IconLogoMarca width={32} height={37} variant="light" />
          <div className="editor-bar__brand">
            <span>Igreja Anglicana</span>
            Rio
          </div>
          <div className="editor-bar__title">· editor de posts</div>
        </div>
        <div className="editor-bar__actions">
          <button
            type="button"
            className="editor-btn editor-btn--primary"
            onClick={onDownload}
            disabled={downloading}
          >
            {downloading ? "Gerando…" : "Baixar PNG"}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M8 3 V11 M4 8 L8 12 L12 8 M3 14 H13" />
            </svg>
          </button>
        </div>
      </div>

      <div className="editor-main">
        {/* Sidebar */}
        <aside className="editor-sidebar">
          <div className="editor-section">
            <div className="editor-section__label">1 · Escolha o template</div>
            <div className="tpl-picker">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`tpl-option ${tplId === t.id ? "tpl-option--active" : ""}`}
                  onClick={() => setTplId(t.id)}
                >
                  <span className="tpl-option__tag">{t.group}</span>
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="editor-section">
            <div className="editor-section__label">2 · Preencha o conteúdo</div>
            <div className="form">
              {tpl.fields.map((f) => (
                <Field
                  key={f.name}
                  field={f}
                  value={content[f.name]}
                  onChange={(val) => update(f.name, val)}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Stage */}
        <main className="editor-stage">
          <div className="editor-stage__head">
            <div>
              <h2 className="editor-stage__title">{tpl.name}</h2>
              <div className="editor-stage__sub">
                {tpl.w} × {tpl.h} px · pré-visualização ao vivo
              </div>
            </div>
          </div>

          <div className="editor-preview-wrap">
            <Preview tpl={tpl} content={content} scale={visibleScale} />
          </div>

          <div className="editor-help">
            <div className="editor-help__icon">i</div>
            <div className="editor-help__text">
              <strong>Como funciona:</strong> escolhe o template, preenche os campos, e clica em
              "Baixar PNG" lá em cima. O arquivo vai pro seu computador/celular pronto pra postar
              no Instagram. <strong>Nada estraga a marca</strong> — fontes, cores e logo já estão travados.
            </div>
          </div>
        </main>
      </div>

      {/* Hidden exporter — at native 1080×1080 (or whatever size) */}
      <div className="editor-export-node" ref={exportRef} aria-hidden="true">
        <Preview tpl={tpl} content={content} scale={1} />
      </div>

      {/* Toast */}
      <div className={`editor-toast ${toast ? "editor-toast--show" : ""}`}>
        <div className="editor-toast__check">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M3 7 L6 10 L11 4" />
          </svg>
        </div>
        {toast}
      </div>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
