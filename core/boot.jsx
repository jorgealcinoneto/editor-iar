function editorDepsReady() {
  if (!window.EditorField || !window.MARCAS) return false;
  if (window.SAAS_MODE) {
    // activateOrg (auth-gate) corre antes de startEditorAfterAuth, logo
    // ORG_SKIN já existe aqui e diz qual catálogo esperar.
    const want = window.marcaIdForCatalog(window.ORG_SKIN?.catalogId);
    return !!window.MARCAS[want]?.templates?.length;
  }
  const forced = window.MARCA_FORCADA;
  if (forced) return !!window.MARCAS[forced]?.templates?.length;
  return Object.values(window.MARCAS).some((m) => m?.templates?.length);
}

let bootAttempts = 0;
const BOOT_MAX = 120;

function bootFail(root, msg) {
  if (!root || root.dataset.mounted) return;
  root.innerHTML = `<div style="padding:24px;font-family:system-ui,sans-serif;color:#722f37;max-width:52ch;line-height:1.5">
    <strong>Editor não iniciou.</strong><br>${msg}<br>
    <span style="color:#5b524a;font-size:13px">Abre o console (F12) para o erro exacto.</span>
  </div>`;
}

function bootEditor() {
  const root = document.getElementById('root');
  if (!editorDepsReady()) {
    bootAttempts += 1;
    if (bootAttempts > BOOT_MAX) {
      const esperada = window.SAAS_MODE
        ? window.marcaIdForCatalog(window.ORG_SKIN?.catalogId)
        : (window.MARCA_FORCADA || 'qualquer');
      bootFail(root, `Dependências em falta após ${BOOT_MAX} tentativas (marca: ${esperada}).`);
      return;
    }
    if (root && !root.dataset.mounted) {
      root.innerHTML = '<p style="padding:24px;font-family:system-ui,sans-serif;color:#5b524a">A carregar editor…</p>';
    }
    setTimeout(bootEditor, 40);
    return;
  }
  if (!root || root.dataset.mounted) return;
  root.dataset.mounted = '1';
  try {
    ReactDOM.createRoot(root).render(<App />);
  } catch (err) {
    console.error(err);
    bootFail(root, err.message || String(err));
  }
}

window.addEventListener('error', (e) => {
  if (document.getElementById('root')?.dataset?.mounted) return;
  console.error(e.error || e.message);
});

window.startEditorAfterAuth = bootEditor;

async function boot() {
  if (window.__configReady) await window.__configReady;
  if (window.SAAS_MODE) {
    if (typeof window.mountAuthGate === 'function') window.mountAuthGate();
    return;
  }
  bootEditor();
}

boot();
