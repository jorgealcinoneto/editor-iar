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
      fontHeading: org.theme?.fontHeading || 'Cormorant Garamond',
      fontBody: org.theme?.fontBody || 'DM Sans',
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
      fontHeading: '--font-heading',
      fontBody: '--font-body',
    };
    Object.entries(map).forEach(([key, cssVar]) => {
      if (theme[key]) root.style.setProperty(cssVar, theme[key]);
    });
    if (theme.fontHeading) root.style.setProperty('--font-serif', theme.fontHeading);
    if (theme.fontBody) {
      root.style.setProperty('--font-sans', theme.fontBody);
      root.style.setProperty('--font-wide', theme.fontBody);
    }
  }

  function loadOrgFonts(skin) {
    if (typeof document === 'undefined') return;
    const id = 'ed-org-fonts';
    let link = document.getElementById(id);
    if (!skin?.fontHeading && !skin?.fontBody) {
      if (link) link.remove();
      return;
    }
    const families = [skin.fontHeading, skin.fontBody].filter(Boolean);
    const unique = [...new Set(families)];
    const params = unique.map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`).join('&');
    const href = `https://fonts.googleapis.com/css2?${params}&display=swap`;
    if (!link) {
      link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = href;
  }

  function activateOrg(org, role) {
    if (!org?.id) return;
    global.ORG_SKIN = buildOrgSkin(org);
    applyOrgTheme(global.ORG_SKIN.theme);
    loadOrgFonts(global.ORG_SKIN);
    const prevRole = global.ORG_MEMBERSHIP?.role;
    global.ORG_MEMBERSHIP = { orgId: org.id, role: role || prevRole || 'member' };
    try { localStorage.setItem(LS_ORG, org.id); } catch {}
    if (typeof global.dispatchEvent === 'function') {
      global.dispatchEvent(new CustomEvent('ed:org-change', { detail: { orgId: org.id } }));
    }
  }

  /* orgs.catalog_id → id da marca (pasta em marcas/, id do <link> de CSS).
     Cada manifest.js declara o seu catalogId. Fallback 'iar' mantém o
     comportamento antigo para orgs com o default 'church-v1' herdado. */
  function marcaIdForCatalog(catalogId) {
    const marcas = global.MARCAS || {};
    const hit = Object.keys(marcas).find((k) => marcas[k]?.catalogId === catalogId);
    return hit || 'iar';
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
  global.loadOrgFonts = loadOrgFonts;
  global.activateOrg = activateOrg;
  global.isSuperadmin = isSuperadmin;
  global.marcaIdForCatalog = marcaIdForCatalog;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { buildOrgSkin, getSkinBrandLines, applyOrgTheme, loadOrgFonts, activateOrg, isSuperadmin, marcaIdForCatalog };
  }
})(typeof window !== 'undefined' ? window : globalThis);
