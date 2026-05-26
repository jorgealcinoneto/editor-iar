function RT({ children }) {
  if (children == null || children === '') return null;
  const s = String(children);
  if (/<[a-z][^>]*>/i.test(s)) {
    return React.createElement('span', { dangerouslySetInnerHTML: { __html: s } });
  }
  return children;
}

function RichTextField({ value, onChange, rows = 4 }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const el = ref.current;
    if (el && el.innerHTML !== (value || '')) el.innerHTML = value || '';
  }, [value]);

  const exec = (cmd) => {
    ref.current?.focus();
    document.execCommand(cmd, false);
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const btn = (cmd, label, title, style) => (
    React.createElement('button', {
      type: 'button',
      title,
      onMouseDown: (e) => { e.preventDefault(); exec(cmd); },
      style,
    }, label)
  );

  return (
    <div className="ed-rich">
      <div className="ed-rich__toolbar" role="toolbar" aria-label="Formatação">
        {btn('bold', 'B', 'Negrito (Cmd+B)', { fontWeight: 700 })}
        {btn('italic', 'I', 'Itálico (Cmd+I)', { fontStyle: 'italic' })}
        {btn('underline', 'U', 'Sublinhado (Cmd+U)', { textDecoration: 'underline' })}
        <span className="ed-rich__sep" />
        {btn('insertUnorderedList', '•', 'Lista', null)}
        {btn('insertOrderedList', '1.', 'Lista numerada', null)}
        <span className="ed-rich__sep" />
        {btn('justifyLeft', '⇤', 'Esquerda', null)}
        {btn('justifyCenter', '↔', 'Centro', null)}
        {btn('justifyRight', '⇥', 'Direita', null)}
        {btn('justifyFull', '☰', 'Justificar', null)}
        <span className="ed-rich__sep" />
        {btn('removeFormat', '×', 'Limpar formatação', null)}
      </div>
      <div
        ref={ref}
        className="ed-rich__editor"
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData.getData('text/plain');
          document.execCommand('insertText', false, text);
        }}
        style={{ minHeight: `${rows * 1.5}em` }}
      />
    </div>
  );
}

function Field({ field, value, onChange, marca }) {
  const galleries = marca.galleries;
  const photos = Array.isArray(galleries) ? galleries : (galleries?.photos || []);
  const icons = galleries?.icons || [];

  if (field.type === 'text' || field.type === 'rich') {
    return (
      <div className="ed-field">
        <label className="ed-field__label">{field.label}</label>
        <input type="text" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
        {field.hint && (
          <div
            className="ed-field__hint"
            {...(field.hint.includes('<') ? { dangerouslySetInnerHTML: { __html: field.hint } } : {})}
          >
            {!field.hint.includes('<') ? field.hint : null}
          </div>
        )}
      </div>
    );
  }

  if (field.type === 'textarea' || field.type === 'textarea-rich') {
    return (
      <div className="ed-field">
        <label className="ed-field__label">{field.label}</label>
        <RichTextField value={value ?? ''} onChange={onChange} rows={4} />
        {field.hint && (
          <div
            className="ed-field__hint"
            {...(field.hint.includes('<') ? { dangerouslySetInnerHTML: { __html: field.hint } } : {})}
          >
            {!field.hint.includes('<') ? field.hint : null}
          </div>
        )}
      </div>
    );
  }

  if (field.type === 'number') {
    return (
      <div className="ed-field">
        <label className="ed-field__label">{field.label}</label>
        <input
          type="number"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        />
        {field.hint && <div className="ed-field__hint">{field.hint}</div>}
      </div>
    );
  }

  if (field.type === 'icon') {
    return (
      <div className="ed-field">
        <label className="ed-field__label">{field.label}</label>
        <div className="ed-icon-picker">
          {icons.map((opt) => (
            <button
              key={opt.key}
              type="button"
              className={value === opt.key ? 'is-active' : ''}
              onClick={() => onChange(opt.key)}
              title={opt.label}
            >
              <opt.Icon />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === 'photo' || field.type === 'image') {
    const onFile = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => onChange(ev.target.result);
      reader.readAsDataURL(file);
    };
    const has = !!value;
    const isExternal = typeof value === 'string' && (value.startsWith('http') || value.startsWith('data:'));
    const showPreview = has && (isExternal || value.includes('/'));
    const allowUrl = field.type === 'image';

    return (
      <div className="ed-field">
        <label className="ed-field__label">{field.label}</label>
        <label className="ed-file">
          <div className="ed-file__preview">{showPreview && <img src={value} alt="" />}</div>
          <div className="ed-file__text">
            <strong>Subir do computador</strong>
            JPG, PNG ou WebP
          </div>
          <input type="file" accept="image/*" onChange={onFile} />
        </label>
        {photos.length > 0 && (
          <>
            <div className="ed-field__hint" style={{ marginTop: 10 }}>Galeria:</div>
            <div className="ed-preset">
              {photos.map((src) => (
                <button
                  key={src}
                  type="button"
                  className={value === src ? 'is-active' : ''}
                  onClick={() => onChange(src)}
                  title={src.split('/').pop()}
                >
                  <img src={src} alt="" />
                </button>
              ))}
              {allowUrl && (
                <button
                  type="button"
                  className={!has ? 'is-active ed-preset__none' : 'ed-preset__none'}
                  onClick={() => onChange('')}
                  title="Sem imagem"
                  aria-label="Sem imagem"
                >
                  ×
                </button>
              )}
            </div>
          </>
        )}
        {allowUrl && (
          <>
            <div className="ed-field__hint" style={{ marginTop: 10 }}>Ou colar URL:</div>
            <input
              type="text"
              placeholder="https://…"
              value={typeof value === 'string' && value.startsWith('http') ? value : ''}
              onChange={(e) => onChange(e.target.value)}
            />
          </>
        )}
        {field.hint && <div className="ed-field__hint">{field.hint}</div>}
      </div>
    );
  }

  return null;
}

Object.assign(window, { EditorField: Field, RT });
