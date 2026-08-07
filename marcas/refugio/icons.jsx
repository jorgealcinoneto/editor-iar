/* ============================================
   Refúgio — Set de ícones próprios
   Estilo: stroke 1.75, line-cap round, viewBox 32x32
   Vocabulário: acolhida, comunhão, esperança, refúgio
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

/* —— Duas mãos se encontrando: reconciliação —— */
function IconReconciliacao(props) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <path d="M8 14 L10 8 L12 10 L14 6 L16 12" />
      <path d="M24 14 L22 8 L20 10 L18 6 L16 12" />
      <path d="M10 12 Q13 15 16 16 Q19 15 22 12" />
    </svg>
  );
}

/* —— Broto / vida nova / esperança —— */
function IconBroto(props) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <path d="M16 28 L16 16" />
      <path d="M12 18 Q16 14 20 18" />
      <path d="M11 22 Q16 18 21 22" />
      <path d="M14 26 Q16 24 18 26" />
      <circle cx="16" cy="12" r="4" />
    </svg>
  );
}

/* —— Coração + cruz: fé acolhedora —— */
function IconFe(props) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <path d="M16 27 L6 18 a5 5 0 0 1 0-7 a5 5 0 0 1 7 0 L16 14 L19 11 a5 5 0 0 1 7 0 a5 5 0 0 1 0 7 Z" />
      <path d="M16 12 V20" />
      <path d="M12 16 H20" />
    </svg>
  );
}

/* —— Ramo de oliva: paz —— */
function IconPaz(props) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <path d="M7 18 L12 10" />
      <path d="M12 10 L16 6 L20 10" />
      <path d="M12 10 L15 14 L18 12" />
      <path d="M16 6 L22 12" />
      <path d="M20 10 L25 18" />
      <ellipse cx="9" cy="20" rx="2.5" ry="3" />
      <ellipse cx="14" cy="17" rx="2.5" ry="3" />
      <ellipse cx="19" cy="18" rx="2.5" ry="3" />
      <ellipse cx="24" cy="20" rx="2.5" ry="3" />
    </svg>
  );
}

/* —— Casa acolhedora: plantação de igreja —— */
function IconCasaAcolhida(props) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <path d="M5 14 L16 5 L27 14" />
      <path d="M8 13 V26 H24 V13" />
      <path d="M14 26 V18 a2 2 0 0 1 4 0 V26" />
      <path d="M11 10 L21 10" />
      <circle cx="16" cy="20" r="2.5" />
    </svg>
  );
}

/* —— Abraço / comunidade —— */
function IconComunidade(props) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <circle cx="16" cy="8" r="3" />
      <path d="M13 12 C13 11 14 10 16 10 C18 10 19 11 19 12" />
      <path d="M6 18 Q8 12 12 12" />
      <path d="M26 18 Q24 12 20 12" />
      <path d="M6 18 L8 26 M26 18 L24 26" />
      <path d="M13 20 L19 20 L19 26 L13 26 Z" />
    </svg>
  );
}

/* —— Pão e vinho: eucaristia —— */
function IconEucaristia(props) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <path d="M8 10 L8 22 a3 3 0 0 0 3 3 L13 10" />
      <path d="M19 10 L19 22 a3 3 0 0 1 -3 3 L15 10" />
      <path d="M10 10 L14 5 L18 10" />
      <path d="M22 16 L28 16 L26 24 Q24 26 22 24" />
    </svg>
  );
}

/* —— Batismo / água da vida —— */
function IconBatismo(props) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <path d="M8 12 L12 6 L16 2 L20 6 L24 12" />
      <path d="M10 14 Q13 18 16 20 Q19 18 22 14" />
      <path d="M8 18 Q11 22 14 24 Q17 22 20 18" />
      <path d="M10 22 Q12 24 14 25" />
    </svg>
  );
}

/* —— Aurora / novo começo —— */
function IconAlvorada(props) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <path d="M16 28 V20" />
      <path d="M6 20 L26 20" />
      <path d="M8 16 a8 8 0 0 0 16 0" />
      <path d="M4 18 L6 18" />
      <path d="M28 18 L26 18" />
    </svg>
  );
}

/* —— Anel / aliança / fidelidade —— */
function IconAlianca(props) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <circle cx="16" cy="16" r="10" />
      <path d="M16 7 L18 6 L19 8" />
      <path d="M25 16 L26 18 L24 19" />
      <path d="M16 25 L14 26 L13 24" />
      <path d="M7 16 L6 14 L8 13" />
    </svg>
  );
}

/* —— Livro / Palavra —— */
function IconPalavra(props) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <path d="M8 5 L8 27 Q16 24 24 27 L24 5" />
      <path d="M16 5 L16 27" />
      <path d="M10 10 L14 10" />
      <path d="M10 14 L14 14" />
      <path d="M10 18 L14 18" />
      <path d="M18 10 L22 10" />
      <path d="M18 14 L22 14" />
      <path d="M18 18 L22 18" />
    </svg>
  );
}

/* —— Vela / luz —— */
function IconVela(props) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <path d="M16 4 L14 8 L18 8 Z" />
      <path d="M14 8 L12 24 a4 4 0 0 0 8 0 L18 8" />
      <path d="M15 5 L17 5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/* Marca oficial (cálice+casa): máscara PNG → pinta com currentColor,
   como o SVG do Reconciliador — rasters oficiais têm fundo chapado. */
const REFUGIO_MARK = 'marcas/refugio/assets/logo-mark.png';

function IconSelo({ width = 32, height = 32, style, className, ...rest }) {
  const sizeW = width == null ? 32 : width;
  const sizeH = height == null ? 32 : height;
  return (
    <span
      role="img"
      aria-label="Refúgio"
      className={className}
      style={{
        display: 'inline-block',
        width: sizeW,
        height: sizeH,
        backgroundColor: 'currentColor',
        WebkitMaskImage: `url(${REFUGIO_MARK})`,
        maskImage: `url(${REFUGIO_MARK})`,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        ...style,
      }}
      {...rest}
    />
  );
}

/* —— Pino de localização —— */
function IconLocal(props) {
  return (
    <svg {...ICON_PROPS} {...props}>
      <path d="M16 28 C16 28 24 19 24 12 a8 8 0 0 0 -16 0 c0 7 8 16 8 16 Z" />
      <circle cx="16" cy="12" r="3" />
    </svg>
  );
}

function IconLogoRefugio(props) {
  return <IconSelo {...props} />;
}

const RefugioIcons = {
  IconReconciliacao,
  IconBroto,
  IconFe,
  IconPaz,
  IconCasaAcolhida,
  IconComunidade,
  IconEucaristia,
  IconBatismo,
  IconAlvorada,
  IconAlianca,
  IconPalavra,
  IconVela,
  IconLogoRefugio,
  IconSelo,
  IconLocal,
};

Object.assign(window, { RefugioIcons });
