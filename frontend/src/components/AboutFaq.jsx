import { useState } from "react";
import { useSiteContent } from "../i18n/content.js";
import { useT } from "../i18n/I18nProvider.jsx";

// FAQ list for the About page. Each question is a button with aria-expanded,
// and the answer uses the hidden attribute when it's closed.

/** Local chevron so this page does not have to edit the shared Icons.jsx. */
function ChevronIcon() {
  return (
    <svg
      className="icon faq__chevron"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function AboutFaq() {
  const t = useT();
  // The FAQs from aboutContent.js, in the visitor's language.
  const FAQS = useSiteContent().about.FAQS;
  // The id of the open question, or null when they are all closed. Holding one
  // id (rather than a list) is what makes opening one close the others.
  const [openId, setOpenId] = useState(null);

  function toggle(id) {
    setOpenId((current) => (current === id ? null : id));
  }

  return (
    <section className="about-section" aria-labelledby="faq-title">
      <div className="section-intro">
        <p className="label">{t("about.faq.label")}</p>
        <h2 id="faq-title">{t("about.faq.title")}</h2>
        <p className="section-intro__lead">{t("about.faq.lead")}</p>
      </div>

      <ul className="faq">
        {FAQS.map((faq) => {
          const open = openId === faq.id;

          return (
            <li key={faq.id} className="faq__item">
              {/* h3 wraps the button so the questions show up in a screen
                  reader's heading list as well as being clickable. */}
              <h3 className="faq__heading">
                <button
                  type="button"
                  className="faq__trigger"
                  aria-expanded={open}
                  aria-controls={`faq-answer-${faq.id}`}
                  id={`faq-question-${faq.id}`}
                  onClick={() => toggle(faq.id)}
                >
                  <span>{faq.question}</span>
                  <ChevronIcon />
                </button>
              </h3>

              <div
                className="faq__answer"
                id={`faq-answer-${faq.id}`}
                role="region"
                aria-labelledby={`faq-question-${faq.id}`}
                hidden={!open}
              >
                <p>{faq.answer}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
