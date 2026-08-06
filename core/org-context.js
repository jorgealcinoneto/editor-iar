(function () {
  const LS_ORG = 'ed:orgActiva';

  window.activateOrg = function activateOrg(org, role) {
    if (!org?.id) return;
    window.ORG_SKIN = window.buildOrgSkin(org);
    window.applyOrgTheme(window.ORG_SKIN.theme);
    const prevRole = window.ORG_MEMBERSHIP?.role;
    window.ORG_MEMBERSHIP = { orgId: org.id, role: role || prevRole || 'member' };
    localStorage.setItem(LS_ORG, org.id);
    window.dispatchEvent(new CustomEvent('ed:org-change', { detail: { orgId: org.id } }));
  };

  window.isSuperadmin = function isSuperadmin() {
    return window.SAAS_MODE && window.ORG_MEMBERSHIP?.role === 'superadmin';
  };
})();
