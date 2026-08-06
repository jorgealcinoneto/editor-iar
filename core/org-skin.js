(function (global) {
  const LS_ORG = 'ed:orgActiva';

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

  function activateOrg(org, role) {
    if (!org?.id) return;
    global.ORG_SKIN = buildOrgSkin(org);
    applyOrgTheme(global.ORG_SKIN.theme);
    const prevRole = global.ORG_MEMBERSHIP?.role;
    global.ORG_MEMBERSHIP = { orgId: org.id, role: role || prevRole || 'member' };
    try { localStorage.setItem(LS_ORG, org.id); } catch {}
    if (typeof global.dispatchEvent === 'function') {
      global.dispatchEvent(new CustomEvent('ed:org-change', { detail: { orgId: org.id } }));
    }
  }

  function isSuperadmin() {
    if (!global.SAAS_MODE) return false;
    if (global.ORG_MEMBERSHIP?.role === 'superadmin') return true;
    return Array.isArray(global.ORG_MEMBERSHIPS)
      && global.ORG_MEMBERSHIPS.some((m) => m.role === 'superadmin');
  }

  global.buildOrgSkin = buildOrgSkin;
  global.getSkinBrandLines = getSkinBrandLines;
  global.applyOrgTheme = applyOrgTheme;
  global.activateOrg = activateOrg;
  global.isSuperadmin = isSuperadmin;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { buildOrgSkin, getSkinBrandLines, applyOrgTheme, activateOrg, isSuperadmin };
  }
})(typeof window !== 'undefined' ? window : globalThis);
