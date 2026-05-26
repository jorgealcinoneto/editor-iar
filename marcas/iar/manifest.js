window.MARCAS = window.MARCAS || {};
window.MARCAS.iar = {
  id: 'iar',
  name: 'Igreja Anglicana Rio',
  shortName: 'IAR',
  handle: '@igrejaanglicanario',
  cssClass: 'marca-iar',
  assetBase: 'marcas/iar/',
  allowTweaks: false,
  exportPixelRatio: 1,
  exportFilePrefix: 'iar',
  exportBg: '#F5EFE6',
  barTheme: 'iar',
  get templates() { return window.IAR_TEMPLATES || []; },
  get galleries() { return window.IAR_GALLERIES || { photos: [], icons: [] }; },
};
