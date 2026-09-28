import { useState } from "react";
import { Link } from "react-router-dom";
import { submitInterest } from "../api.js";
import { useAuth } from "../auth.jsx";
import { formErrors } from "../formErrors.js";
import { useT } from "../i18n/I18nProvider.jsx";
import { CheckboxField, FormError } from "./FormFields.jsx";

// The "I'm interested in an Amazon placement" tick box. Sends to POST
// /api/interest/, which needs an account.
//
// This was a six-field form (name, email, role, pathway, message, consent).
// The site already holds the first four, so it asked everyone who had an
// account to type them in a second time. Now it sends nothing: the server
// copies them off the account.
//
// That is also why it needs signing in. Once the fields are gone there is
// nothing left to identify an anonymous tick by, so instead of quietly
// putting the form back for signed-out visitors, the box says what it needs
// and offers a way to get there. It stays optional either way: nothing else
// on the site depends on it.

// onSent runs once the server accepts it, with { pathway }: the slug that was
// recorded, or null when the account has not chosen one. An object rather than
// the slug itself, so "sent, no pathway" is still truthy to the caller.
export default function InterestForm({ onSent }) {
  const t = useT();
  // Optional chaining because there is not always a provider above this (the
  // old form did the same): no provider means nobody is signed in and there
  // is nothing to wait for.
  const auth = useAuth();
  const user = auth?.user ?? null;
  const checked = auth ? auth.checked : true;

  const [ticked, setTicked] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting

  // Don't flash the signed-out message at someone who is signed in, while the
  // first /me call is still in the air.
  if (!checked) return null;

  if (!user) {
    return (
      <div className="interest-signin">
        <p>{t("registerInterest.signedOut")}</p>
        <p className="interest__note">{t("registerInterest.optional")}</p>
        <p className="interest-signin__actions">
          {/* Reusing the account pages' own labels, so these read the same
              here as they do on the buttons they lead to, in every language. */}
          <Link className="button button--primary" to="/login">
            {t("login.submit")}
          </Link>
          <Link className="button" to="/register">
            {t("register.title")}
          </Link>
        </p>
      </div>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!ticked) {
      setErrors({ consent: t("registerInterest.errors.consent") });
      document.getElementById("interest-consent")?.focus();
      return;
    }

    setStatus("submitting");
    setErrors({});
    try {
      const recorded = await submitInterest();
      onSent({ pathway: recorded?.pathway ?? null });
    } catch (error) {
      setErrors(formErrors(error, t));
      setStatus("idle");
    }
  }

  return (
    <form className="account-form" onSubmit={handleSubmit} noValidate>
      {errors.form && <FormError message={errors.form} />}

      <CheckboxField
        id="interest-consent"
        name="consent"
        checked={ticked}
        onChange={(event) => setTicked(event.target.checked)}
        hint={t("registerInterest.usingAccount")}
        error={errors.consent}
        label={t("registerInterest.tickBox")}
      />

      <p className="interest__note">
        {t("registerInterest.privacyBefore")}{" "}
        <Link to="/privacy">{t("registerInterest.privacyLink")}</Link>
        {t("registerInterest.privacyAfter")}
      </p>

      <button type="submit" className="button button--primary" disabled={status === "submitting"}>
        {status === "submitting" ? t("registerInterest.submitting") : t("registerInterest.submit")}
      </button>
    </form>
  );
}
