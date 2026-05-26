function editorDepsReady() {
  const forced = window.MARCA_FORCADA;
  if (forced === 'iar') {
    return window.MARCAS?.iar && window.IAR_TEMPLATES?.length && window.EditorField;
  }
  if (forced === 'ofmj') {
    return window.MARCAS?.ofmj && window.OFMJ_TEMPLATES?.length && window.EditorField;
  }
  return window.MARCAS?.iar && window.MARCAS?.ofmj
    && window.IAR_TEMPLATES?.length
    && window.OFMJ_TEMPLATES?.length
    && window.EditorField;
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
      const forced = window.MARCA_FORCADA || 'iar+ofmj';
      bootFail(root, `Dependências em falta após ${BOOT_MAX} tentativas (marca: ${forced}).`);
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

bootEditor();
