/* ============================================
   IAR — Set de ícones próprios
   Estilo: stroke 1.75, line-cap round, viewbox 32x32
   Vocabulário gráfico: arco, ondas, geometria sacra
   Cada ícone usa currentColor para herdar tema
============================================ */

const ICON_STROKE = 1.75;
const ICON_PROPS = {
  width: 32,
  height: 32,
  viewBox: "0 0 32 32",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: ICON_STROKE,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

/* —— Marca-d'água: a janela em arco do logo, simplificada —— */
function IconArco(props) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <path d="M7 26 V14 a9 9 0 0 1 18 0 V26" />
      <path d="M16 5 V26" />
      <path d="M7 15 H25" />
    </svg>
  );
}

/* —— Janela + ondas (a marca completa em ícone) —— */
function IconJanelaRio(props) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <path d="M8 22 V13 a8 8 0 0 1 16 0 V22" />
      <path d="M16 5 V22" />
      <path d="M8 14 H24" />
      <path d="M5 27 c2-1.5 4-1.5 6 0 s4 1.5 6 0 s4-1.5 6 0 s4 1.5 6 0" />
    </svg>
  );
}

/* —— Cruz celta (cruz vazia + círculo) —— */
function IconCruzCelta(props) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <path d="M16 4 V28" />
      <path d="M7 13 H25" />
      <circle cx="16" cy="13" r="5" />
    </svg>
  );
}

/* —— Cálice + hóstia (eucaristia) —— */
function IconCalice(props) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <path d="M10 8 H22 a6 8 0 0 1 -6 8 a6 8 0 0 1 -6 -8 z" />
      <path d="M16 16 V24" />
      <path d="M11 28 H21" />
      <circle cx="16" cy="6" r="2.5" />
    </svg>
  );
}

/* —— Pomba do Espírito Santo (simplificada) —— */
function IconPomba(props) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <path d="M5 17 c3 -3 7 -4 11 -4 c2 0 5 -1 7 -3 c0 4 -2 7 -5 8 c-3 1 -6 4 -6 8" />
      <path d="M16 13 l 6 -2" />
      <path d="M16 19 v3" />
      <path d="M19 22 l3 4" />
      <path d="M13 22 l-3 4" />
    </svg>
  );
}

/* —— Ondas (Rio) —— */
function IconOndas(props) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <path d="M3 11 c3-2 5-2 8 0 s5 2 8 0 s5-2 8 0" />
      <path d="M3 17 c3-2 5-2 8 0 s5 2 8 0 s5-2 8 0" />
      <path d="M3 23 c3-2 5-2 8 0 s5 2 8 0 s5-2 8 0" />
    </svg>
  );
}

/* —— Casa (igreja em casa / igreja em plantação) —— */
function IconCasa(props) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <path d="M5 14 L16 5 L27 14" />
      <path d="M8 13 V27 H24 V13" />
      <path d="M14 27 V19 a2 2 0 0 1 4 0 V27" />
      <path d="M14 10 H18 M16 8 V12" />
    </svg>
  );
}

/* —— Livro / Bíblia / BCP —— */
function IconLivro(props) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <path d="M6 6 H14 a2 2 0 0 1 2 2 V27 a2 2 0 0 0 -2 -2 H6 z" />
      <path d="M26 6 H18 a2 2 0 0 0 -2 2 V27 a2 2 0 0 1 2 -2 H26 z" />
      <path d="M16 8 V25" />
      <path d="M19 13 H23" />
      <path d="M21 11 V15" />
    </svg>
  );
}

/* —— Vela (oração) —— */
function IconVela(props) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <path d="M16 3 c-2 2 -2 4 0 6 c2 -2 2 -4 0 -6 z" />
      <path d="M16 9 V13" />
      <path d="M11 13 H21 V26 a2 2 0 0 1 -2 2 H13 a2 2 0 0 1 -2 -2 z" />
      <path d="M11 18 H21" />
    </svg>
  );
}

/* —— Coração com chama (Sagrado Coração / amor de Cristo) —— */
function IconCoracao(props) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <path d="M16 27 c-6 -4 -11 -8 -11 -14 a5 5 0 0 1 11 -2 a5 5 0 0 1 11 2 c0 6 -5 10 -11 14 z" />
      <path d="M16 8 c-1 -2 -1 -3 0 -5 c1 2 1 3 0 5 z" />
    </svg>
  );
}

/* —— Mãos / comunhão / ágape —— */
function IconMaos(props) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <path d="M5 18 V12 a2 2 0 0 1 4 0 V19" />
      <path d="M9 12 V9 a2 2 0 0 1 4 0 V19" />
      <path d="M13 11 V7 a2 2 0 0 1 4 0 V19" />
      <path d="M17 12 V9 a2 2 0 0 1 4 0 V19" />
      <path d="M21 13 a3 3 0 0 1 6 0 c0 4 -2 7 -5 10 H10 c-3 -2 -5 -4 -5 -7" />
    </svg>
  );
}

/* —— Pessoas / comunidade —— */
function IconComunidade(props) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <circle cx="10" cy="11" r="3" />
      <circle cx="22" cy="11" r="3" />
      <circle cx="16" cy="8" r="3.5" />
      <path d="M4 25 c0 -4 3 -7 6 -7 c1.5 0 2.5 0.5 3 1" />
      <path d="M28 25 c0 -4 -3 -7 -6 -7 c-1.5 0 -2.5 0.5 -3 1" />
      <path d="M9 27 c0 -4 3 -7 7 -7 s7 3 7 7" />
    </svg>
  );
}

/* —— Sol nascente / aurora / esperança —— */
function IconAurora(props) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <circle cx="16" cy="22" r="6" />
      <path d="M16 12 V8" />
      <path d="M8 16 L10.5 18.5" />
      <path d="M24 16 L21.5 18.5" />
      <path d="M5 12 L8 13" />
      <path d="M27 12 L24 13" />
      <path d="M11 6 L13 9" />
      <path d="M21 6 L19 9" />
    </svg>
  );
}

/* —— Calendário / evento —— */
function IconEvento(props) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <rect x="5" y="7" width="22" height="20" rx="2" />
      <path d="M5 13 H27" />
      <path d="M11 4 V10" />
      <path d="M21 4 V10" />
      <circle cx="11" cy="19" r="1.5" fill="currentColor" />
      <circle cx="16" cy="19" r="1.5" fill="currentColor" />
      <circle cx="21" cy="19" r="1.5" fill="currentColor" />
    </svg>
  );
}

/* —— Balão de fala / testemunho —— */
function IconTestemunho(props) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <path d="M5 8 a3 3 0 0 1 3 -3 H24 a3 3 0 0 1 3 3 V19 a3 3 0 0 1 -3 3 H14 L8 27 V22 H8 a3 3 0 0 1 -3 -3 z" />
      <path d="M11 11 H21" />
      <path d="M11 15 H18" />
    </svg>
  );
}

/* —— Marcador / endereço (vem visitar) —— */
function IconLocal(props) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <path d="M16 28 c-5 -7 -9 -12 -9 -17 a9 9 0 0 1 18 0 c0 5 -4 10 -9 17 z" />
      <circle cx="16" cy="11" r="3" />
    </svg>
  );
}

/* —— Marca completa (logo oficial IAR — usa o PNG real) —— */
function IconLogoMarca({ width = 64, height = 76, variant = "dark" }) {
  // variant: "dark" (marinho original) | "light" (branco — para fundos escuros)
  // O PNG é renderizado em marinho; filter inverte pro fundo escuro.
  const filter = variant === "light"
    ? "brightness(0) invert(1)"
    : "none";
  return (
    <img
      src={(window.MARCAS?.iar?.assetBase || 'marcas/iar/') + 'assets/logo-iar-symbol.png'}
      alt="Igreja Anglicana Rio"
      style={{
        width,
        height,
        objectFit: "contain",
        objectPosition: "center",
        filter,
        display: "block",
      }}
    />
  );
}

/* Mapa público (export para window) */
window.IARIcons = {
  IconArco,
  IconJanelaRio,
  IconCruzCelta,
  IconCalice,
  IconPomba,
  IconOndas,
  IconCasa,
  IconLivro,
  IconVela,
  IconCoracao,
  IconMaos,
  IconComunidade,
  IconAurora,
  IconEvento,
  IconTestemunho,
  IconLocal,
  IconLogoMarca,
};
