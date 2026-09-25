import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api.js";
import { useAuth } from "../auth.jsx";
import { formErrors } from "../formErrors.js";
import { PATHWAY_NAMES, USER_TYPES } from "../labels.js";
import AuthPanel from "../components/AuthPanel.jsx";
import InterestForm from "../components/InterestForm.jsx";
import { ChevronDownIcon } from "../components/Icons.jsx";
import "../about.css";
import { CheckboxField, FormError, SelectField, TextField } from "../components/FormFields.jsx";
import { useT } from "../i18n/I18nProvider.jsx";

// Exactly the fields RegisterSerializer accepts. Everything else on this form
// is kept out of here, so it cannot end up in the request.
const EMPTY_FIELDS = {
  username: "",
  password: "",
  password_confirm: "",
  user_type: "",
  pathway_interest: "",
};

// Not saved yet, there's no field for it in the backend. Words are under register.heardAbout.
const HEARD_ABOUT_OPTIONS = ["search_engine", "social_media", "friend_family", "advert", "influencer", "ai", "other"];

// Both boxes have to be ticked to sign up. They aren't sent to the server.
const CONFIRMATION_ERRORS = {
  over_sixteen: "register.errors.overSixteen",
  terms: "register.errors.terms",
};

export default function Register() {
  const t = useT();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [heardAbout, setHeardAbout] = useState(""); // not sent, see HEARD_ABOUT_OPTIONS
  const [confirmed, setConfirmed] = useState({ over_sixteen: false, terms: false });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting
  const overSixteenBox = useRef(null);
  const termsBox = useRef(null);

  function updateField(event) {
    const { name, value } = event.target;
    setFields((current) => ({ ...current, [name]: value }));
  }

  function updateConfirmation(event) {
    const { name, checked } = event.target;
    setConfirmed((current) => ({ ...current, [name]: checked }));
    // Ticking the box answers its message, so the message goes at once rather
    // than waiting for the next try.
    if (checked) {
      setErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    // Nothing is sent until both boxes are ticked. Each missing one says so
    // beside itself, and the first lands the cursor, so it is easy to find.
    const missing = {};
    for (const name of ["over_sixteen", "terms"]) {
      if (!confirmed[name]) missing[name] = t(CONFIRMATION_ERRORS[name]);
    }
    if (Object.keys(missing).length > 0) {
      setErrors(missing);
      (missing.over_sixteen ? overSixteenBox : termsBox).current?.focus();
      return;
    }

    setStatus("submitting");
    setErrors({});

    // Leave out an unanswered account type so the API replies "This field is
    // required." rather than rejecting "" as an invalid choice.
    const payload = { ...fields };
    if (!payload.user_type) delete payload.user_type;

    try {
      await register(payload); // also signs the new user in
      await refresh();
      navigate("/", { replace: true });
    } catch (error) {
      setErrors(formErrors(error));
      setStatus("idle");
    }
  }

  // The branded panel beside the form (see .auth-layout in styles.css).
  return (
    <div className="auth-layout">
      <AuthPanel />

      <div className="auth-side">
        <div className="auth-form" aria-labelledby="page-title">
          <div className="auth-heading">
            <p className="label">{t("login.label")}</p>
            <h1 id="page-title">{t("register.title")}</h1>
            <p className="lead">{t("register.lead")}</p>
          </div>

        <form className="account-form" onSubmit={handleSubmit} noValidate>
          {errors.form && <FormError message={errors.form} />}

          <TextField
            id="register-username"
            label={t("login.username")}
            name="username"
            hint={t("register.usernameHint")}
            value={fields.username}
            onChange={updateField}
            autoComplete="username"
            required
            error={errors.username}
          />
          <TextField
            id="register-password"
            label={t("login.password")}
            name="password"
            type="password"
            hint={t("register.passwordHint")}
            value={fields.password}
            onChange={updateField}
            autoComplete="new-password"
            required
            error={errors.password}
          />
          <TextField
            id="register-password-confirm"
            label={t("register.confirmPassword")}
            name="password_confirm"
            type="password"
            value={fields.password_confirm}
            onChange={updateField}
            autoComplete="new-password"
            required
            error={errors.password_confirm}
          />
          <SelectField
            id="register-user-type"
            label={t("register.accountType")}
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
            id="register-pathway"
            label={t("register.pathway")}
            name="pathway_interest"
            value={fields.pathway_interest}
            onChange={updateField}
            error={errors.pathway_interest}
          >
            <option value="">{t("register.noPreference")}</option>
            {PATHWAY_NAMES.map((name) => (
              <option key={name} value={name}>
                {t(`pathways.${name.toLowerCase()}`)}
              </option>
            ))}
          </SelectField>

          <SelectField
            id="register-heard-about"
            label={t("register.heardAboutLabel")}
            name="heard_about"
            value={heardAbout}
            onChange={(event) => setHeardAbout(event.target.value)}
          >
            <option value="">{t("register.chooseOne")}</option>
            {HEARD_ABOUT_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {t(`register.heardAbout.${value}`)}
              </option>
            ))}
          </SelectField>

          <CheckboxField
            id="register-over-sixteen"
            name="over_sixteen"
            ref={overSixteenBox}
            label={t("register.overSixteen")}
            required
            checked={confirmed.over_sixteen}
            onChange={updateConfirmation}
            error={errors.over_sixteen}
          />
          <CheckboxField
            id="register-terms"
            name="terms"
            ref={termsBox}
            label={
              <>
                {t("register.termsBefore")}{" "}
                <Link to="/terms" target="_blank" rel="noopener noreferrer">
                  {t("register.termsLink")}
                  <span className="sr-only"> {t("register.newTab")}</span>
                </Link>
                {t("register.termsAfter")}
              </>
            }
            required
            checked={confirmed.terms}
            onChange={updateConfirmation}
            error={errors.terms}
          />

          <button type="submit" className="button button--primary" disabled={status === "submitting"}>
            {status === "submitting" ? t("register.submitting") : t("register.submit")}
          </button>
        </form>

          <p className="account-switch">
            {t("register.haveAccount")} <Link to="/login">{t("login.submit")}</Link>
          </p>

          <InterestBox />
        </div>
      </div>
    </div>
  );
}

// Register interest box under the sign up form. Uses <details> so it opens and closes by itself.
function InterestBox() {
  const t = useT();
  const [sentPathway, setSentPathway] = useState(null);
  const thanks = useRef(null);

  // Replace the form with a thank-you and put focus on it, as the Register
  // interest page does.
  useEffect(() => {
    if (sentPathway) thanks.current?.focus();
  }, [sentPathway]);

  return (
    <details className="interest-box">
      <summary className="interest-box__summary">
        {t("registerInterest.box.summary")}
        <ChevronDownIcon />
      </summary>
      <div className="interest-box__body">
        {sentPathway ? (
          <p className="interest-box__thanks" tabIndex={-1} ref={thanks}>
            {t("registerInterest.thanks.lead", { pathway: sentPathway.name })}
          </p>
        ) : (
          <>
            <p className="interest__note">{t("registerInterest.box.text")}</p>
            <InterestForm onSent={setSentPathway} />
          </>
        )}
      </div>
    </details>
  );
}
