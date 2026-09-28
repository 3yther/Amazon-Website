import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import InterestForm from "../components/InterestForm.jsx";
import { IconList } from "../components/InfoBlocks.jsx";
import { useT } from "../i18n/I18nProvider.jsx";
import { useSiteContent } from "../i18n/content.js";
import "../about.css";

// Register interest page: the tick box (InterestForm.jsx) and what happens next.

export default function RegisterInterest() {
  const t = useT();
  const { interest } = useSiteContent();
  const [sent, setSent] = useState(null); // { pathway } once the server has it
  const thanksHeading = useRef(null);

  // Once it is sent, the tick box is replaced by a thank-you. Moving focus to
  // its heading means screen reader and keyboard users hear it straight away.
  useEffect(() => {
    if (sent) thanksHeading.current?.focus();
  }, [sent]);

  if (sent) {
    return (
      <section className="intro" aria-labelledby="page-title">
        <p className="label">{t("registerInterest.submit")}</p>
        <h1 id="page-title" tabIndex={-1} ref={thanksHeading}>
          {t("registerInterest.thanks.title")}
        </h1>
        <p className="lead">
          {sent.pathway
            ? t("registerInterest.thanks.lead", { pathway: t(`pathways.${sent.pathway}`) })
            : t("registerInterest.thanks.leadNoPathway")}
        </p>
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
        <InterestForm onSent={setSent} />

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
