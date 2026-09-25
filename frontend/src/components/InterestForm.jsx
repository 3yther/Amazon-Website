import { useState } from "react";
import { Link } from "react-router-dom";
import { submitInterest } from "../api.js";
import { useAuth } from "../auth.jsx";
import { PATHWAYS } from "../aboutContent.js";
import { formErrors } from "../formErrors.js";
import { USER_TYPES } from "../labels.js";
import { CheckboxField, FormError, SelectField, TextareaField, TextField } from "./FormFields.jsx";

// The Expression of Interest form: the site's main way for someone to tell
// Amazon they want a T-Level placement. Sends to POST /api/interest/ (the
// interest app), which validates it again on the server and saves it for
// Amazon staff to see. No account is needed.
//
// Used in two places: the Register interest page, and the box on the Sign up
// page. Each decides what to show once it is sent, through onSent.

const MESSAGE_LIMIT = 2000; // matches MESSAGE_MAX_LENGTH in interest/serializers.py

const EMPTY = { full_name: "", email: "", user_type: "", pathway: "", message: "" };

/**
 * Quick checks in the browser, so the common mistakes are caught before
 * anything is sent. The server checks everything again; its answer wins.
 */
function checkFields(fields, consent) {
  const errors = {};
  if (fields.full_name.trim().length < 2) errors.full_name = "Enter your full name.";
  if (!/^\S+@\S+\.\S+$/.test(fields.email.trim())) {
    errors.email = "Enter an email address in the format name@example.com.";
  }
  if (!fields.user_type) errors.user_type = "Choose student, parent or teacher.";
  if (!fields.pathway) errors.pathway = "Choose a pathway.";
  if (fields.message.length > MESSAGE_LIMIT) {
    errors.message = `Keep your message under ${MESSAGE_LIMIT} characters.`;
  }
  // TEAM NOTE: the backend does not store this tick yet. If Amazon needs a
  // record of consent, add a field to ExpressionOfInterest (see MODELS.md).
  if (!consent) errors.consent = "Tick the box so we can share your details with Amazon.";
  return errors;
}

/**
 * The form itself. `startingPathway` picks a pathway in advance; `onSent` is
 * called with the chosen pathway once the server has accepted it.
 */
export default function InterestForm({ startingPathway = "", onSent }) {
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

    const found = checkFields(fields, consent);
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
      setErrors(formErrors(error));
      setStatus("idle");
    }
  }

  return (
    <form className="account-form" onSubmit={handleSubmit} noValidate>
      {errors.form && <FormError message={errors.form} />}

      <TextField
        id="interest-full-name"
        label="Full name"
        name="full_name"
        value={fields.full_name}
        onChange={updateField}
        autoComplete="name"
        required
        error={errors.full_name}
      />
      <TextField
        id="interest-email"
        label="Email"
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
        label="I am a"
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
        id="interest-pathway"
        label="Pathway"
        name="pathway"
        value={fields.pathway}
        onChange={updateField}
        required
        error={errors.pathway}
      >
        <option value="">Choose one</option>
        {PATHWAYS.map((pathway) => (
          <option key={pathway.slug} value={pathway.slug}>
            {pathway.name}
          </option>
        ))}
      </SelectField>
      <TextareaField
        id="interest-message"
        label="Anything to add? (optional)"
        name="message"
        hint="For example, a question about the placement."
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
            I am happy for the Amazon Emerging Talent team to see these details and contact me.
            See our <Link to="/privacy">Privacy Policy</Link>.
          </>
        }
      />

      <button type="submit" className="button button--primary" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending" : "Register interest"}
      </button>
    </form>
  );
}
