import { useState } from "react";
import { submitFeedback } from "../api.js";
import { useAuth } from "../auth.jsx";
import { formErrors } from "../formErrors.js";
import { useT } from "../i18n/I18nProvider.jsx";
import { FormError, SelectField, TextareaField, TextField } from "./FormFields.jsx";

// A short message form for the Contact us and Report an Issue pages. Both send
// to the same backend endpoint as the Feedback page (POST /api/accounts/feedback/),
// which saves the message for the team to read in Django admin. No email
// address is needed on the site, and none is invented.
//
// NEW CONCEPT: one component, two pages. The page passes in which categories
// to offer and what to call things, so the form logic is written once.

/**
 * categories: [{ value, label }], values from the backend's Feedback.Category
 * (bug, feature, general, accessibility). The page passes every label already
 * translated; the form's own words are in i18n/messages (messageForm).
 */
export default function MessageForm({ idPrefix, categories, messageLabel, submitLabel, sentText }) {
  const t = useT();
  // Nobody signed in (or no sign-in check yet) just means no email to prefill.
  const user = useAuth()?.user;
  const [fields, setFields] = useState(() => ({
    category: categories[0].value,
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

    // Checked here as well as on the server, so the most common mistake gets
    // an answer straight away.
    if (!fields.message.trim()) {
      setErrors({ message: t("messageForm.empty") });
      return;
    }

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
      <div className="notice notice--success" role="status">
        <p>{sentText}</p>
      </div>
    );
  }

  return (
    <form className="account-form" onSubmit={handleSubmit} noValidate>
      {errors.form && <FormError message={errors.form} />}

      {categories.length > 1 && (
        <SelectField
          id={`${idPrefix}-category`}
          label={t("messageForm.about")}
          name="category"
          value={fields.category}
          onChange={updateField}
          error={errors.category}
        >
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </SelectField>
      )}

      <TextareaField
        id={`${idPrefix}-message`}
        label={messageLabel}
        name="message"
        value={fields.message}
        onChange={updateField}
        required
        error={errors.message}
      />

      <TextField
        id={`${idPrefix}-email`}
        label={t("messageForm.email")}
        name="email"
        type="email"
        hint={t("messageForm.emailHint")}
        value={fields.email}
        onChange={updateField}
        autoComplete="email"
        error={errors.email}
      />

      <button type="submit" className="button button--primary" disabled={status === "submitting"}>
        {status === "submitting" ? t("messageForm.sending") : submitLabel}
      </button>
    </form>
  );
}
