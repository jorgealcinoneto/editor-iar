/* ============================================
   Reconciliador — Registry: catálogo de 14 templates
   Exporta window.RECONCILIADOR_TEMPLATES e window.RECONCILIADOR_GALLERIES
   (consumidos pelos getters preguiçosos de manifest.js)

   Envolvido em IIFE: os scripts type="text/babel" correm no escopo global,
   e marcas/iar/registry.jsx já declara `const TplCoverType`, `TplVerse`, …
   no topo. Sem o IIFE isto seria "Identifier already declared".
============================================ */

(function () {
const {
  IconReconciliacao, IconBroto, IconFe, IconPaz, IconCasaAcolhida,
  IconComunidade, IconEucaristia, IconBatismo, IconAlvorada,
  IconPalavra, IconVela, IconSelo,
} = window.ReconciliadorIcons;

const {
  TplCoverType, TplCoverPhoto, TplCoverIcon,
  TplBodyNum, TplBodyIcon, TplCloseCTA,
  TplVerse, TplEvent, TplCommunity, TplCampaign, TplLectionary,
  StoryVerse, StoryEvent, StoryQuote,
} = window.RECON_TPL;

const RECON_BASE = 'marcas/reconciliador/';
const reconAsset = (p) => `${RECON_BASE}${p}`;

const RECON_ICON_OPTIONS = [
  { key: 'eucaristia', Icon: IconEucaristia, label: 'Eucaristia' },
  { key: 'selo', Icon: IconSelo, label: 'Selo/Cruz' },
  { key: 'fe', Icon: IconFe, label: 'Fé' },
  { key: 'paz', Icon: IconPaz, label: 'Paz' },
  { key: 'palavra', Icon: IconPalavra, label: 'Palavra' },
  { key: 'casa', Icon: IconCasaAcolhida, label: 'Casa' },
  { key: 'vela', Icon: IconVela, label: 'Vela' },
  { key: 'reconciliacao', Icon: IconReconciliacao, label: 'Reconciliação' },
  { key: 'comunidade', Icon: IconComunidade, label: 'Comunidade' },
  { key: 'alvorada', Icon: IconAlvorada, label: 'Alvorada' },
  { key: 'batismo', Icon: IconBatismo, label: 'Batismo' },
  { key: 'broto', Icon: IconBroto, label: 'Broto' },
];
const findReconIcon = (key) => RECON_ICON_OPTIONS.find((i) => i.key === key)?.Icon || IconEucaristia;

/* Fallbacks locais: no SaaS a galeria mostra só ORG_GALLERY, mas os
   defaults renderizam antes do utilizador escolher uma imagem. */
const RECON_PRESET_PHOTOS = [
  reconAsset('assets/photo-fachada.jpg'),
  reconAsset('assets/photo-celebracao.jpg'),
  reconAsset('assets/photo-comunidade.jpg'),
  reconAsset('assets/photo-altar.jpg'),
];

const RECON_TEMPLATES = [
  {
    id: 'cover-type',
    name: 'Capa tipográfica',
    group: 'Feed · Carrossel',
    w: 1080, h: 1080,
    defaults: { eyebrow: 'Reconciliador 101 · 01', title: 'O que é ser', titleEm: 'reconciliado?', sub: 'Em 5 slides, sem enrolação.' },
    fields: [
      { name: 'eyebrow', label: 'Categoria (eyebrow)', type: 'text' },
      { name: 'title', label: 'Título — início', type: 'text' },
      { name: 'titleEm', label: 'Título — palavra em destaque', type: 'text', hint: 'Destaque em dourado' },
      { name: 'sub', label: 'Subtítulo', type: 'textarea' },
    ],
    render: (c) => <TplCoverType {...c} />,
  },
  {
    id: 'cover-photo',
    name: 'Capa com foto',
    group: 'Feed · Carrossel',
    w: 1080, h: 1080,
    defaults: { photo: reconAsset('assets/photo-comunidade.jpg'), eyebrow: 'Domingo passado', title: 'A gente é', titleEm: 'essa casa.', sub: 'Culto de família, 9h.' },
    fields: [
      { name: 'photo', label: 'Foto de fundo', type: 'photo' },
      { name: 'eyebrow', label: 'Categoria', type: 'text' },
      { name: 'title', label: 'Título — início', type: 'text' },
      { name: 'titleEm', label: 'Título — destaque', type: 'text' },
      { name: 'sub', label: 'Subtítulo', type: 'textarea' },
    ],
    render: (c) => <TplCoverPhoto {...c} />,
  },
  {
    id: 'cover-icon',
    name: 'Capa com ícone',
    group: 'Feed · Carrossel',
    w: 1080, h: 1080,
    defaults: { icon: 'eucaristia', eyebrow: 'Liturgia · Eucaristia', title: 'Por que a gente', titleEm: 'parte o pão?', sub: '500 anos fazendo o mesmo gesto.' },
    fields: [
      { name: 'icon', label: 'Ícone', type: 'icon' },
      { name: 'eyebrow', label: 'Categoria', type: 'text' },
      { name: 'title', label: 'Título — início', type: 'text' },
      { name: 'titleEm', label: 'Título — destaque', type: 'text' },
      { name: 'sub', label: 'Subtítulo', type: 'textarea' },
    ],
    render: (c) => <TplCoverIcon {...c} Icon={findReconIcon(c.icon)} />,
  },
  {
    id: 'body-num',
    name: 'Miolo — número',
    group: 'Feed · Carrossel',
    w: 1080, h: 1080,
    defaults: { num: 'i.', title: 'Uma missão antiga.', body: 'Anunciar Cristo e ser <strong>sinal de reconciliação</strong> — entre a pessoa e Deus, e entre as pessoas.', page: '2 / 6' },
    fields: [
      { name: 'num', label: 'Número/Letra grande', type: 'text' },
      { name: 'title', label: 'Título do slide', type: 'text' },
      { name: 'body', label: 'Texto corpo', type: 'textarea', hint: 'Use <strong>palavra</strong> pra destacar' },
      { name: 'page', label: 'Página', type: 'text' },
    ],
    render: (c) => <TplBodyNum {...c} />,
  },
  {
    id: 'body-icon',
    name: 'Miolo — ícone',
    group: 'Feed · Carrossel',
    w: 1080, h: 1080,
    defaults: { icon: 'palavra', eyebrow: 'Escritura + Tradição + Presente', title: 'Como a gente crê.', body: 'Centralidade das <strong>Escrituras</strong>, beleza da <strong>liturgia</strong>, mensagem relevante para hoje.', page: '3 / 6' },
    fields: [
      { name: 'icon', label: 'Ícone', type: 'icon' },
      { name: 'eyebrow', label: 'Eyebrow (opcional)', type: 'text' },
      { name: 'title', label: 'Título', type: 'text' },
      { name: 'body', label: 'Corpo', type: 'textarea', hint: 'Use <strong>palavra</strong> pra destacar' },
      { name: 'page', label: 'Página', type: 'text' },
    ],
    render: (c) => <TplBodyIcon {...c} Icon={findReconIcon(c.icon)} />,
  },
  {
    id: 'close-cta',
    name: 'Encerramento (CTA)',
    group: 'Feed · Carrossel',
    w: 1080, h: 1080,
    defaults: { title: 'Vem domingo.', sub: 'Culto às 9h. QSF 01 Lote 102, Loja 03, Taguatinga Sul.', ctaText: 'Como chegar', page: '6 / 6' },
    fields: [
      { name: 'title', label: 'Frase principal (CTA)', type: 'text' },
      { name: 'sub', label: 'Sub (contexto)', type: 'textarea' },
      { name: 'ctaText', label: 'Texto do botão', type: 'text' },
      { name: 'page', label: 'Página', type: 'text' },
    ],
    render: (c) => <TplCloseCTA {...c} dark={true} />,
  },
  {
    id: 'verse',
    name: 'Versículo do dia',
    group: 'Feed · Devocional',
    w: 1080, h: 1080,
    defaults: { verse: 'Agora, portanto, somos embaixadores de Cristo.', reference: '2 Coríntios 5, 20', eyebrow: 'Palavra de hoje' },
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'verse', label: 'Versículo', type: 'textarea', hint: 'Até 100 caracteres' },
      { name: 'reference', label: 'Referência bíblica', type: 'text' },
    ],
    render: (c) => <TplVerse {...c} />,
  },
  {
    id: 'community',
    name: 'Comunidade (foto+frase)',
    group: 'Feed · Comunidade',
    w: 1080, h: 1080,
    defaults: { photo: reconAsset('assets/photo-celebracao.jpg'), quote: 'Seis meses de casa, e já parece família.', who: 'Domingo, na sala de estar' },
    fields: [
      { name: 'photo', label: 'Foto de fundo', type: 'photo' },
      { name: 'quote', label: 'Frase/citação', type: 'textarea', hint: 'Até 80 caracteres' },
      { name: 'who', label: 'Atribuição', type: 'text' },
    ],
    render: (c) => <TplCommunity {...c} />,
  },
  {
    id: 'campaign',
    name: 'Campanha / Comemorativo',
    group: 'Feed · Comunidade',
    w: 1080, h: 1080,
    defaults: { photo: null, intro: '🎉 Seis meses de Anglicana do Reconciliador!', kicker: 'Faça parte dessa história', title: 'De uma casa a uma', titleEm: 'comunidade', body: 'Nascemos na sala do Rev. Rafael e da Tatiana. Hoje somos igreja. Vem construir com a gente.', cta: 'Quero conhecer →' },
    fields: [
      { name: 'photo', label: 'Foto de fundo', type: 'photo' },
      { name: 'intro', label: 'Frase de abertura', type: 'text' },
      { name: 'kicker', label: 'Categoria/kicker', type: 'text' },
      { name: 'title', label: 'Título — início', type: 'text' },
      { name: 'titleEm', label: 'Título — destaque', type: 'text' },
      { name: 'body', label: 'Corpo', type: 'textarea' },
      { name: 'cta', label: 'Texto do botão CTA', type: 'text' },
    ],
    render: (c) => <TplCampaign {...c} />,
  },
  {
    id: 'event',
    name: 'Convite de evento',
    group: 'Feed · Evento',
    w: 1080, h: 1350,
    defaults: {
      photo: reconAsset('assets/photo-fachada.jpg'),
      kicker: 'Toda semana',
      title: 'Domingo',
      date: 'Culto da Família',
      time: '09h',
      place: 'QSF 01 Lote 102, Loja 03 — Taguatinga Sul, Brasília DF',
      cta: 'Venha com a família',
      overlayOpacity: 0.7,
      kickerColor: '#B6956A',
    },
    fields: [
      { name: 'photo', label: 'Foto de fundo', type: 'photo' },
      { name: 'kicker', label: 'Categoria do evento', type: 'text' },
      { name: 'kickerColor', label: 'Cor do kicker', type: 'swatch', options: [{ value: '#B6956A', label: 'Dourado' }, { value: 'var(--gold-claro)', label: 'Dourado claro' }, { value: 'var(--papel)', label: 'Branco' }] },
      { name: 'title', label: 'Dia da semana', type: 'text' },
      { name: 'date', label: 'Data (destaque)', type: 'text' },
      { name: 'time', label: 'Hora', type: 'text' },
      { name: 'place', label: 'Local (curto · cidade)', type: 'text' },
      { name: 'cta', label: 'Chamada (pílula do rodapé)', type: 'text' },
      { name: 'overlayOpacity', label: 'Opacidade do fundo escuro', type: 'slider', min: 0.3, max: 1, step: 0.05 },
    ],
    render: (c) => <TplEvent {...c} />,
  },
  {
    id: 'story-verse',
    name: 'Story · Versículo',
    group: 'Story 9:16',
    w: 1080, h: 1920,
    defaults: { verse: 'Vinde a mim todos os que estão cansados e sobrecarregados.', reference: 'Mateus 11, 28' },
    fields: [
      { name: 'verse', label: 'Versículo', type: 'textarea' },
      { name: 'reference', label: 'Referência', type: 'text' },
    ],
    render: (c) => <StoryVerse {...c} />,
  },
  {
    id: 'story-event',
    name: 'Story · Evento',
    group: 'Story 9:16',
    w: 1080, h: 1920,
    defaults: { photo: reconAsset('assets/photo-altar.jpg'), kicker: 'Esse domingo', title: 'Vem participar.', date: '09 Ago', time: '9h', place: 'Taguatinga Sul · DF' },
    fields: [
      { name: 'photo', label: 'Foto de fundo', type: 'photo' },
      { name: 'kicker', label: 'Kicker', type: 'text' },
      { name: 'title', label: 'Título', type: 'text' },
      { name: 'date', label: 'Data', type: 'text' },
      { name: 'time', label: 'Hora', type: 'text' },
      { name: 'place', label: 'Local', type: 'text' },
    ],
    render: (c) => <StoryEvent {...c} />,
  },
  {
    id: 'story-quote',
    name: 'Story · Citação',
    group: 'Story 9:16',
    w: 1080, h: 1920,
    defaults: { quote: 'Cheguei sem saber onde ia me sentar. Achei uma casa.', who: 'Um visitante', photo: null },
    fields: [
      { name: 'photo', label: 'Foto da pessoa (redonda)', type: 'photo' },
      { name: 'quote', label: 'Citação', type: 'textarea' },
      { name: 'who', label: 'Quem disse', type: 'text' },
    ],
    render: (c) => <StoryQuote {...c} />,
  },
  {
    id: 'lectionary',
    name: 'Lecionário diário',
    group: 'Story 9:16',
    w: 1080, h: 1920,
    defaults: {
      title: 'Lecionário Diário',
      date: '09 de Agosto · Domingo',
      passage1: 'Gênesis 32.22-31',
      passage2: 'Romanos 9.1-5',
      passage3: 'Mateus 14.13-21',
      passage4: '',
      body: '<sup>20</sup>Deus faz seu apelo por nosso intermédio. <strong>"Reconciliem-se com Deus!"</strong>',
    },
    fields: [
      { name: 'title', label: 'Título', type: 'text' },
      { name: 'date', label: 'Data / dia litúrgico', type: 'text' },
      { name: 'passage1', label: 'Passagem 1', type: 'text' },
      { name: 'passage2', label: 'Passagem 2', type: 'text' },
      { name: 'passage3', label: 'Passagem 3', type: 'text' },
      { name: 'passage4', label: 'Passagem 4', type: 'text' },
      { name: 'body', label: 'Texto bíblico ou comentário', type: 'textarea', hint: 'Use <sup>36</sup> pra número de versículo · <strong>texto</strong> pra negrito' },
    ],
    render: (c) => <TplLectionary title={c.title} date={c.date} passages={[c.passage1, c.passage2, c.passage3, c.passage4]} body={c.body} />,
  },
];

window.RECONCILIADOR_GALLERIES = { photos: RECON_PRESET_PHOTOS, icons: RECON_ICON_OPTIONS };
window.RECONCILIADOR_TEMPLATES = RECON_TEMPLATES;
})();
