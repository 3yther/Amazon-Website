import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { submitInterest } from "../api.js";
import { useAuth } from "../auth.jsx";
import { formErrors } from "../formErrors.js";
import { USER_TYPES } from "../labels.js";
import {
  CheckboxField,
  FormError,
  SelectField,
  TextareaField,
  TextField,
} from "../components/FormFields.jsx";
import { IconList } from "../components/InfoBlocks.jsx";
import { useT } from "../i18n/I18nProvider.jsx";
import { useSiteContent } from "../i18n/content.js";
import "../about.css";

// The Expression of Interest form: the site's main way for someone to tell
// Amazon they want a T Level placement. Sends to POST /api/interest/ (the
// interest app), which validates it again on the server and saves it for
// Amazon staff to see in Django admin. No account is needed.

const MESSAGE_LIMIT = 2000; // matches MESSAGE_MAX_LENGTH in interest/serializers.py

const EMPTY = { full_name: "", email: "", user_type: "", pathway: "", message: "" };

/**
 * Quick checks in the browser, so the common mistakes are caught before
 * anything is sent. The server checks everything again; its answer wins.
 */
function checkFields(fields, consent, t) {
  const errors = {};
  if (fields.full_name.trim().length < 2) errors.full_name = t("registerInterest.errors.fullName");
  if (!/^\S+@\S+\.\S+$/.test(fields.email.trim())) {
    errors.email = t("registerInterest.errors.email");
  }
  if (!fields.user_type) errors.user_type = t("registerInterest.errors.userType");
  if (!fields.pathway) errors.pathway = t("registerInterest.errors.pathway");
  if (fields.message.length > MESSAGE_LIMIT) {
    errors.message = t("registerInterest.errors.message", { limit: MESSAGE_LIMIT });
  }
  // TEAM NOTE: the backend does not store this tick yet. If Amazon needs a
  // record of consent, add a field to ExpressionOfInterest (see MODELS.md).
  if (!consent) errors.consent = t("registerInterest.errors.consent");
  return errors;
}

export default function RegisterInterest() {
  const t = useT();
  const { about, interest } = useSiteContent();
  const { PATHWAYS } = about;
  // Nobody signed in (or no sign-in check yet) just means nothing to prefill.
  const user = useAuth()?.user;
  const [searchParams] = useSearchParams();

  // NEW CONCEPT: reading the address bar. A link such as
  // /register-interest?pathway=digital picks the pathway for them.
  const askedFor = searchParams.get("pathway");
  const startingPathway = PATHWAYS.some((pathway) => pathway.slug === askedFor) ? askedFor : "";

  const [fields, setFields] = useState(() => ({
    ...EMPTY,
    email: user?.email ?? "",
    user_type: user?.user_type && USER_TYPES[user.user_type] ? user.user_type : "",
    pathway: startingPathway,
  }));
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | sent
  const thanksHeading = useRef(null);

  // Once it is sent, the form is replaced by a thank-you. Moving focus to its
  // heading means screen reader and keyboard users hear it straight away.
  useEffect(() => {
    if (status === "sent") thanksHeading.current?.focus();
  }, [status]);

  function updateField(event) {
    const { name, value } = event.target;
    setFields((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const found = checkFields(fields, consent, t);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      // Put focus on the first problem, so keyboard and screen reader users
      // land on it rather than having to search the form.
      const first = Object.keys(found)[0];
      document.getElementById(`interest-${first.replace("_", "-")}`)?.focus();
      return;
    }

    setStatus("submitting");
    setErrors({});
    try {
      await submitInterest(fields);
      setStatus("sent");
    } catch (error) {
      setErrors(formErrors(error));
      setStatus("idle");
    }
  }

  if (status === "sent") {
    const pathway = PATHWAYS.find((item) => item.slug === fields.pathway);
    return (
      <section className="intro" aria-labelledby="page-title">
        <p className="label">{t("registerInterest.submit")}</p>
        <h1 id="page-title" tabIndex={-1} ref={thanksHeading}>
          {t("registerInterest.thanks.title")}
        </h1>
        <p className="lead">{t("registerInterest.thanks.lead", { pathway: pathway?.name })}</p>
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
        <form className="account-form" onSubmit={handleSubmit} noValidate>
          {errors.form && <FormError message={errors.form} />}

          <TextField
            id="interest-full-name"
            label={t("registerInterest.fullName")}
            name="full_name"
            value={fields.full_name}
            onChange={updateField}
            autoComplete="name"
            required
            error={errors.full_name}
          />
          <TextField
            id="interest-email"
            label={t("registerInterest.email")}
            name="email"
            type="email"
            value={fields.email}
            onChange={updateField}
            autoComplete="email"
            required
            error={errors.email}
          />
          <SelectField
            id="interest-user-type"
            label={t("registerInterest.iAmA")}
            name="user_type"
            value={fields.user_type}
            onChange={updateField}
            required
            error={errors.user_type}
          >
            <option value="">{t("register.chooseOne")}</option>
            {Object.keys(USER_TYPES).map((value) => (
              <option key={value} value={value}>
                {t(`account.roles.${value}`)}
              </option>
            ))}
          </SelectField>
          <SelectField
            id="interest-pathway"
            label={t("registerInterest.pathway")}
            name="pathway"
            value={fields.pathway}
            onChange={updateField}
            required
            error={errors.pathway}
          >
            <option value="">{t("register.chooseOne")}</option>
            {PATHWAYS.map((pathway) => (
              <option key={pathway.slug} value={pathway.slug}>
                {pathway.name}
              </option>
            ))}
          </SelectField>
          <TextareaField
            id="interest-message"
            label={t("registerInterest.message")}
            name="message"
            hint={t("registerInterest.messageHint")}
            value={fields.message}
            onChange={updateField}
            maxLength={MESSAGE_LIMIT}
            error={errors.message}
          />
          <CheckboxField
            id="interest-consent"
            name="consent"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            required
            error={errors.consent}
            label={
              <>
                {t("registerInterest.consent")} {t("registerInterest.privacyBefore")}{" "}
                <Link to="/privacy">{t("registerInterest.privacyLink")}</Link>
                {t("registerInterest.privacyAfter")}
              </>
            }
          />

          <button type="submit" className="button button--primary" disabled={status === "submitting"}>
            {status === "submitting" ? t("registerInterest.submitting") : t("registerInterest.submit")}
          </button>
        </form>

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
