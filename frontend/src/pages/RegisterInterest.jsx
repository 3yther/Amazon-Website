import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PATHWAYS } from "../aboutContent.js";
import { NEXT_STEPS, WHY_WE_ASK } from "../interestContent.js";
import InterestForm from "../components/InterestForm.jsx";
import { IconList } from "../components/InfoBlocks.jsx";
import "../about.css";

// The Register interest page (/register-interest): the Expression of Interest
// form (InterestForm.jsx) with what happens next beside it. The same form also
// sits in a box on the Sign up page.

export default function RegisterInterest() {
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
        <p className="label">Register interest</p>
        <h1 id="page-title" tabIndex={-1} ref={thanksHeading}>
          Thanks, you are on the list
        </h1>
        <p className="lead">
          Your interest in the {sentPathway.name} pathway has been sent to the Amazon Emerging Talent
          team.
        </p>
        <p>
          While you wait, see <Link to="/t-levels-at-amazon">what an Amazon placement looks like</Link>.
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">Amazon Emerging Talent</p>
        <h1 id="page-title">Register your interest</h1>
        <p className="lead">
          Want a T-Level placement at Amazon? Tell us which pathway. You do not need an account.
        </p>
      </section>

      <div className="interest">
        <InterestForm startingPathway={startingPathway} onSent={setSentPathway} />

        <aside className="interest__aside" aria-labelledby="next-title">
          <h2 id="next-title" className="interest__aside-title">
            What happens next
          </h2>
          <IconList items={NEXT_STEPS} />
          <p className="interest__note">{WHY_WE_ASK}</p>
          <p className="interest__note">Under 16? Ask a parent or carer before you send this.</p>
        </aside>
      </div>
    </>
  );
}
