window.MARCAS = window.MARCAS || {};
window.MARCAS.iar = {
  id: 'iar',
  name: 'Igreja Anglicana Rio',
  shortName: 'IAR',
  handle: '@igrejaanglicanario',
  cssClass: 'marca-iar',
  assetBase: 'marcas/iar/',
  allowTweaks: true,
  tweakControls: ['palette', 'accent'],
  palettes: {
    papel:  { label: 'Papel',  paper: '#F5EFE6', ink: '#1C2A3A' },
    ocre:   { label: 'Ocre',   paper: '#EFE6D6', ink: '#1C2A3A' },
    marfim: { label: 'Marfim', paper: '#FBF5E9', ink: '#1C2A3A' },
    vela:   { label: 'Vela',   paper: '#FFFFFF', ink: '#1C2A3A' },
  },
  accents: {
    estola:  { label: 'Estola',  color: '#1A52D6' },
    marinho: { label: 'Marinho', color: '#0E2A47' },
    ambar:   { label: 'Âmbar',   color: '#C99B6B' },
    sangue:  { label: 'Sangue',  color: '#9B2B2B' },
  },
  tweakDefaults: {
    palette: 'papel',
    accent: 'estola',
  },
  exportPixelRatio: 1,
  exportFilePrefix: 'iar',
  exportBg: null,
  barTheme: 'iar',
  get templates() { return window.IAR_TEMPLATES || []; },
  get galleries() { return window.IAR_GALLERIES || { photos: [], icons: [] }; },
};
