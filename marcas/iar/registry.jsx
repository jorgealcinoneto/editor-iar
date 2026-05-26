/* IAR — registry de templates (editor unificado) */
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

const IAR_BASE = 'marcas/iar/';
const iarAsset = (p) => `${IAR_BASE}${p}`;

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
  iarAsset("assets/photo-comunidade-1.jpg"),
  iarAsset("assets/photo-comunidade-2.jpg"),
  iarAsset("assets/photo-altar-padre.jpg"),
  iarAsset("assets/photo-altar-close.jpg"),
  iarAsset("assets/photo-mesa-altar.jpg"),
  iarAsset("assets/photo-mesa-agape.jpg"),
  iarAsset("assets/photo-padre-1.jpg"),
  iarAsset("assets/photo-padre-2.jpg"),
  iarAsset("assets/photo-banda.jpg"),
  iarAsset("assets/photo-crianca-craft.jpg"),
  iarAsset("assets/photo-criancas-craft.jpg"),
  iarAsset("assets/photo-irmas-abraco.jpg"),
  iarAsset("assets/photo-comunhao.jpg"),
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
      photo: iarAsset("assets/photo-irmas-abraco.jpg"),
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
      photo: iarAsset("assets/photo-crianca-craft.jpg"),
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
      photo: iarAsset("assets/photo-mesa-altar.jpg"),
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
      photo: iarAsset("assets/photo-mesa-altar.jpg"),
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
      photo: iarAsset("assets/photo-irmas-abraco.jpg"),
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

window.IAR_GALLERIES = { photos: PRESET_PHOTOS, icons: ICON_OPTIONS };
window.IAR_TEMPLATES = TEMPLATES;
