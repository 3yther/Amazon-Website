import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api.js";
import { useAuth } from "../auth.jsx";
import { formErrors } from "../formErrors.js";
import { PATHWAY_NAMES, USER_TYPES } from "../labels.js";
import AuthPanel from "../components/AuthPanel.jsx";
import { CheckboxField, FormError, SelectField, TextField } from "../components/FormFields.jsx";

// Exactly the fields RegisterSerializer accepts. Everything else on this form
// is kept out of here, so it cannot end up in the request.
const EMPTY_FIELDS = {
  username: "",
  password: "",
  password_confirm: "",
  user_type: "",
  pathway_interest: "",
};

// Front end only for now: the backend has no column for this, so it is not
// sent anywhere. Values are ready for a field to be added later.
const HEARD_ABOUT_OPTIONS = [
  { value: "search_engine", label: "Search engine" },
  { value: "social_media", label: "Social media" },
  { value: "friend_family", label: "Friend or family" },
  { value: "advert", label: "Advert" },
  { value: "influencer", label: "Influencer" },
  { value: "ai", label: "AI" },
  { value: "other", label: "Other" },
];

// Both tick boxes are a condition of signing up, checked here and never sent:
// the age one is a yes or no confirmation, not a date of birth, and neither
// has anywhere to be stored.
const CONFIRMATION_ERRORS = {
  over_sixteen: "Confirm you are 16 or over to create an account.",
  terms: "Agree to the Terms and Conditions to create an account.",
};

export default function Register() {
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
      if (!confirmed[name]) missing[name] = CONFIRMATION_ERRORS[name];
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
            <p className="label">Account</p>
            <h1 id="page-title">Create your account</h1>
            <p className="lead">It takes a minute, and it is free.</p>
          </div>

        <form className="account-form" onSubmit={handleSubmit} noValidate>
          {errors.form && <FormError message={errors.form} />}

          <TextField
            id="register-username"
            label="Username"
            name="username"
            hint="Letters, numbers and @ . + - _ only."
            value={fields.username}
            onChange={updateField}
            autoComplete="username"
            required
            error={errors.username}
          />
          <TextField
            id="register-password"
            label="Password"
            name="password"
            type="password"
            hint="At least 8 characters. Not all numbers, not a common password."
            value={fields.password}
            onChange={updateField}
            autoComplete="new-password"
            required
            error={errors.password}
          />
          <TextField
            id="register-password-confirm"
            label="Confirm password"
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
            label="Account type"
            name="user_type"
            value={fields.user_type}
            onChange={updateField}
            required
            error={errors.user_type}
          >
            <option value="">Choose one</option>
            {Object.entries(USER_TYPES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectField>
          <SelectField
            id="register-pathway"
            label="Pathway (optional)"
            name="pathway_interest"
            value={fields.pathway_interest}
            onChange={updateField}
            error={errors.pathway_interest}
          >
            <option value="">No preference</option>
            {PATHWAY_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </SelectField>

          <SelectField
            id="register-heard-about"
            label="Where did you hear about us? (optional)"
            name="heard_about"
            value={heardAbout}
            onChange={(event) => setHeardAbout(event.target.value)}
          >
            <option value="">Choose one</option>
            {HEARD_ABOUT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectField>

          <CheckboxField
            id="register-over-sixteen"
            name="over_sixteen"
            ref={overSixteenBox}
            label="I confirm I am 16 or over."
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
                I have read and agree to the{" "}
                <Link to="/terms" target="_blank" rel="noopener noreferrer">
                  Terms and Conditions
                  <span className="sr-only"> (opens in a new tab)</span>
                </Link>
                .
              </>
            }
            required
            checked={confirmed.terms}
            onChange={updateConfirmation}
            error={errors.terms}
          />

          <button type="submit" className="button button--primary" disabled={status === "submitting"}>
            {status === "submitting" ? "Signing up" : "Sign up"}
          </button>
        </form>

          <p className="account-switch">
            Already registered? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
