(function () {
  function base() {
    return (typeof window.appRootPath === 'function' ? window.appRootPath() : '') || '';
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve(src);
      s.onerror = () => reject(new Error('Failed to load ' + src));
      document.head.appendChild(s);
    });
  }

  window.loadAppConfig = async function loadAppConfig() {
    const local = base() + 'config.local.js';
    const cloud = base() + 'config.js';
    try {
      const r = await fetch(local, { method: 'HEAD', cache: 'no-store' });
      if (r.ok) return loadScript(local);
    } catch {}
    return loadScript(cloud);
  };
})();
