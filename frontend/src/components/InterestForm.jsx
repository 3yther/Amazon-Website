import { useState } from "react";
import { Link } from "react-router-dom";
import { submitInterest } from "../api.js";
import { useAuth } from "../auth.jsx";
import { formErrors } from "../formErrors.js";
import { useT } from "../i18n/I18nProvider.jsx";
import { useSiteContent } from "../i18n/content.js";
import { USER_TYPES } from "../labels.js";
import { CheckboxField, FormError, SelectField, TextareaField, TextField } from "./FormFields.jsx";

// The Expression of Interest form. Sends to POST /api/interest/, no account needed.
// Used on the Register interest page and in the box on the Sign up page.

const MESSAGE_LIMIT = 2000; // matches MESSAGE_MAX_LENGTH in interest/serializers.py

const EMPTY = { full_name: "", email: "", user_type: "", pathway: "", message: "" };

// Quick checks before sending. The server checks everything again.
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

// startingPathway picks a pathway in advance. onSent runs once the server accepts it.
export default function InterestForm({ startingPathway = "", onSent }) {
  const t = useT();
  const { PATHWAYS } = useSiteContent().about;
  // Nobody signed in (or no sign-in check yet) just means nothing to prefill.
  const user = useAuth()?.user;

  const [fields, setFields] = useState(() => ({
    ...EMPTY,
    email: user?.email ?? "",
    user_type: user?.user_type && USER_TYPES[user.user_type] ? user.user_type : "",
    pathway: startingPathway,
  }));
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting

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
      onSent(PATHWAYS.find((item) => item.slug === fields.pathway));
    } catch (error) {
      setErrors(formErrors(error, t));
      setStatus("idle");
    }
  }

  return (
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
  );
}
