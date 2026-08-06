(function () {
  function appRootPath() {
    const p = window.location.pathname;
    if (p.endsWith('admin.html')) return p.slice(0, -'admin.html'.length);
    const m = p.match(/^(.*\/)marcas\/[^/]+\/canvas\.html$/);
    if (m) return m[1];
    const i = p.lastIndexOf('/');
    return i >= 0 ? p.slice(0, i + 1) : '/';
  }

  window.appRootPath = appRootPath;
  window.editorAppUrl = function (query) {
    const q = query ? (query.startsWith('?') ? query : `?${query}`) : '';
    return `${window.location.origin}${appRootPath()}index.html${q}`;
  };
})();
