import { useEffect, useState } from "react";
import { submitFeedback } from "../api.js";
import { useAuth } from "../auth.jsx";
import { formErrors } from "../formErrors.js";
import { FormError, SelectField, TextareaField, TextField } from "../components/FormFields.jsx";

const CATEGORIES = {
  bug: "Bug report",
  feature: "Feature suggestion",
  general: "General feedback",
  accessibility: "Accessibility issue",
};

/**
 * Always shown in dark mode, whatever the visitor's own saved theme is
 * elsewhere: the effect below reads whichever of .dark-mode/.light-mode
 * (set by useAccessibilityPreferences.js on <html>) was already there,
 * forces dark for as long as this page is mounted, then puts back exactly
 * what it found on the way out. It never touches localStorage or the
 * backend preference, so this is a page-local look, not a changed setting.
 * Everything else from useAccessibilityPreferences (font scale, text
 * spacing, high contrast) is untouched and keeps applying as normal.
 */
function useForcedDarkMode() {
  useEffect(() => {
    const html = document.documentElement;
    const hadDark = html.classList.contains("dark-mode");
    const hadLight = html.classList.contains("light-mode");

    html.classList.add("dark-mode");
    html.classList.remove("light-mode");

    return () => {
      html.classList.toggle("dark-mode", hadDark);
      html.classList.toggle("light-mode", hadLight);
    };
  }, []);
}

export default function Feedback() {
  const { user } = useAuth();
  useForcedDarkMode();

  const [fields, setFields] = useState(() => ({
    category: "general",
    message: "",
    email: user?.email ?? "",
  }));
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | sent

  function updateField(event) {
    const { name, value } = event.target;
    setFields((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("submitting");
    setErrors({});
    try {
      await submitFeedback(fields);
      setStatus("sent");
    } catch (error) {
      setErrors(formErrors(error));
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <section className="intro" aria-labelledby="page-title">
        <p className="label">Feedback</p>
        <h1 id="page-title">Thank you</h1>
        <p className="lead">We read every message. Thanks for taking the time.</p>
      </section>
    );
  }

  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">Feedback</p>
        <h1 id="page-title">Feedback</h1>
        <p className="lead">Tell us what&rsquo;s working and what isn&rsquo;t.</p>
      </section>

      <form className="account-form" onSubmit={handleSubmit} noValidate>
        {errors.form && <FormError message={errors.form} />}

        <SelectField
          id="feedback-category"
          label="Category"
          name="category"
          value={fields.category}
          onChange={updateField}
          error={errors.category}
        >
          {Object.entries(CATEGORIES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>

        <TextareaField
          id="feedback-message"
          label="Message"
          name="message"
          value={fields.message}
          onChange={updateField}
          required
          error={errors.message}
        />

        <TextField
          id="feedback-email"
          label="Email (optional)"
          name="email"
          type="email"
          hint="So we can follow up, if you'd like."
          value={fields.email}
          onChange={updateField}
          autoComplete="email"
          error={errors.email}
        />

        <button type="submit" className="button button--primary" disabled={status === "submitting"}>
          {status === "submitting" ? "Sending" : "Send feedback"}
        </button>
      </form>
    </>
  );
}
