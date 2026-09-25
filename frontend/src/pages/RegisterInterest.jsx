import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import InterestForm from "../components/InterestForm.jsx";
import { IconList } from "../components/InfoBlocks.jsx";
import { useT } from "../i18n/I18nProvider.jsx";
import { useSiteContent } from "../i18n/content.js";
import "../about.css";

// Register interest page: the form (InterestForm.jsx) and what happens next.

export default function RegisterInterest() {
  const t = useT();
  const { about, interest } = useSiteContent();
  const { PATHWAYS } = about;
  const [searchParams] = useSearchParams();
  const [sentPathway, setSentPathway] = useState(null);
  const thanksHeading = useRef(null);

  // NEW CONCEPT: reading the address bar. A link such as
  // /register-interest?pathway=digital picks the pathway for them.
  const askedFor = searchParams.get("pathway");
  const startingPathway = PATHWAYS.some((pathway) => pathway.slug === askedFor) ? askedFor : "";

  // Once it is sent, the form is replaced by a thank-you. Moving focus to its
  // heading means screen reader and keyboard users hear it straight away.
  useEffect(() => {
    if (sentPathway) thanksHeading.current?.focus();
  }, [sentPathway]);

  if (sentPathway) {
    return (
      <section className="intro" aria-labelledby="page-title">
        <p className="label">{t("registerInterest.submit")}</p>
        <h1 id="page-title" tabIndex={-1} ref={thanksHeading}>
          {t("registerInterest.thanks.title")}
        </h1>
        <p className="lead">{t("registerInterest.thanks.lead", { pathway: sentPathway.name })}</p>
        <p>
          {t("registerInterest.thanks.whileYouWait")}{" "}
          <Link to="/t-levels-at-amazon">{t("registerInterest.thanks.placementLink")}</Link>
          {t("registerInterest.thanks.after")}
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">{t("registerInterest.label")}</p>
        <h1 id="page-title">{t("registerInterest.title")}</h1>
        <p className="lead">{t("registerInterest.lead")}</p>
      </section>

      <div className="interest">
        <InterestForm startingPathway={startingPathway} onSent={setSentPathway} />

        <aside className="interest__aside" aria-labelledby="next-title">
          <h2 id="next-title" className="interest__aside-title">
            {t("registerInterest.nextTitle")}
          </h2>
          <IconList items={interest.NEXT_STEPS} />
          <p className="interest__note">{interest.WHY_WE_ASK}</p>
          <p className="interest__note">{t("registerInterest.underSixteen")}</p>
        </aside>
      </div>
    </>
  );
}
