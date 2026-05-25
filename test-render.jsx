const { Post } = window;
const {
  TplCoverType,
  TplCoverPhoto,
  TplCoverIcon,
  TplBodyNum,
  TplBodyIcon,
  TplCloseCTA,
  TplVerse,
  TplEvent,
  TplCommunity,
  TplLectionary,
  StoryVerse,
  StoryEvent,
  StoryQuote,
  PrintFolder,
} = window;
const {
  IconCalice,
  IconLivro,
  IconMaos,
} = window.IARIcons;

const ICON_BY_KEY = {
  calice: IconCalice,
  livro: IconLivro,
  maos: IconMaos,
};

function previewScale(w, h) {
  if (h === 1920) return 300 / h;
  if (w === 1240) return 220 / w;
  return 220 / w;
}

function renderTemplate(tc, variant) {
  const props = { ...tc.variants[variant] };
  switch (tc.tpl) {
    case "TplCoverIcon":
    case "TplBodyIcon":
      return React.createElement(window[tc.tpl], {
        ...props,
        Icon: ICON_BY_KEY[props.iconKey] || IconCalice,
      });
    case "TplLectionary":
      return React.createElement(TplLectionary, {
        title: props.title,
        date: props.date,
        passages: props.passages,
        body: props.body,
      });
    default:
      return React.createElement(window[tc.tpl], props);
  }
}

function TestGrid() {
  const cases = window.IAR_TEST_CASES || [];
  const variants = ["short", "medium", "long"];

  return (
    <div className="test-page">
      <header className="test-page__head">
        <h1>Editor IAR — matriz visual</h1>
        <p>
          14 templates × 3 comprimentos de texto. Use para detectar sobreposição antes de publicar.
          <a href="index.html">← Voltar ao editor</a>
        </p>
      </header>
      {cases.map((tc) => (
        <section key={tc.id} className="test-section">
          <h2 className="test-section__title">
            {tc.name}
            <span className="test-section__meta">
              {tc.w}×{tc.h} · {tc.id}
            </span>
          </h2>
          <div className="test-row">
            {variants.map((v) => (
              <article key={v} className="test-cell">
                <h3 className="test-cell__label">{v}</h3>
                <div className="test-cell__frame">
                  <Post w={tc.w} h={tc.h} scale={previewScale(tc.w, tc.h)}>
                    {renderTemplate(tc, v)}
                  </Post>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<TestGrid />);
