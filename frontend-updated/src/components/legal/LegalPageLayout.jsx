export default function LegalPageLayout({ eyebrow = "Legal", title, lastUpdated, sections, children }) {
  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">{eyebrow}</p>
        <h1 id="page-title">{title}</h1>
        {lastUpdated && <p className="lead">Last updated {lastUpdated}.</p>}
      </section>

      {sections?.length > 0 && (
        <nav aria-label={`${title} contents`} className="toc">
          <p className="label">On this page</p>
          <ul>
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="legal-body">{children}</div>
    </>
  );
}
