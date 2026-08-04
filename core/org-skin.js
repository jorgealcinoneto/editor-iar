(function (global) {
  function buildOrgSkin(org) {
    if (!org) return null;
    return {
      id: org.id,
      slug: org.slug,
      name: org.name || '',
      handle: org.handle || '',
      logoUrl: org.logo_url || '',
      catalogId: org.catalog_id || 'church-v1',
      theme: org.theme || {},
    };
  }

  function getSkinBrandLines(skin) {
    const name = (skin?.name || '').trim();
    if (!name) return { line1: '', line2: '' };
    const parts = name.split(/\s+/);
    if (parts.length === 1) return { line1: parts[0], line2: '' };
    return { line1: parts.slice(0, -1).join(' '), line2: parts[parts.length - 1] };
  }

  function applyOrgTheme(theme, rootEl) {
    const root = rootEl || (typeof document !== 'undefined' ? document.documentElement : null);
    if (!root || !theme) return;
    const map = {
      marinho: '--marinho',
      accent: '--estola',
      accentSoft: '--estola-claro',
      paper: '--papel',
      ink: '--grafite',
      ambar: '--ambar',
    };
    Object.entries(map).forEach(([key, cssVar]) => {
      if (theme[key]) root.style.setProperty(cssVar, theme[key]);
    });
  }

  global.buildOrgSkin = buildOrgSkin;
  global.getSkinBrandLines = getSkinBrandLines;
  global.applyOrgTheme = applyOrgTheme;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { buildOrgSkin, getSkinBrandLines, applyOrgTheme };
  }
})(typeof window !== 'undefined' ? window : globalThis);
