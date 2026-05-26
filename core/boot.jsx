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

function bootEditor() {
  const root = document.getElementById('root');
  if (!editorDepsReady()) {
    if (root && !root.dataset.mounted) {
      root.innerHTML = '<p style="padding:24px;font-family:system-ui,sans-serif;color:#5b524a">A carregar editor…</p>';
    }
    setTimeout(bootEditor, 40);
    return;
  }
  if (!root || root.dataset.mounted) return;
  root.dataset.mounted = '1';
  ReactDOM.createRoot(root).render(<App />);
}

bootEditor();
