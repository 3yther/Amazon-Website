import { useT } from "../i18n/I18nProvider.jsx";
import { useSiteContent } from "../i18n/content.js";
import "../about.css";

/**
 * Lays out one of the policy pages from legalContent.js: a heading, when it
 * was last updated, then short sections of paragraphs and bullet points.
 * Terms, Privacy, Cookies and Data Rights all use it, so they read the same.
 *
 * `name` is the page's export in legalContent.js (TERMS, PRIVACY, COOKIES or
 * DATA_RIGHTS). The words come in the visitor's language (i18n/content.js).
 */
export default function LegalPage({ name }) {
  const t = useT();
  const page = useSiteContent().legal[name];

  return (
    <article className="legal">
      <header className="intro">
        <p className="label">{page.label}</p>
        <h1 id="page-title">{page.title}</h1>
        <p className="lead">{page.intro}</p>
        <p className="label">{t("legalPage.updated", { date: page.updated })}</p>
      </header>

      {page.sections.map((section) => (
        <section className="legal__section" key={section.heading}>
          <h2>{section.heading}</h2>
          {section.points && (
            <ul className="audience">
              {section.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          )}
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {section.link && (
            <p>
              <a href={section.link.href}>{section.link.text}</a>
            </p>
          )}
        </section>
      ))}
    </article>
  );
}
