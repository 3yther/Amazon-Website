import { useState } from "react";
import { submitFeedback } from "../api.js";
import { useAuth } from "../auth.jsx";
import { formErrors } from "../formErrors.js";
import { useT } from "../i18n/I18nProvider.jsx";
import { FormError, SelectField, TextareaField, TextField } from "./FormFields.jsx";

// Message form used on the Contact us and Report an issue pages.
// Sends to the same place as the Feedback page (POST /api/accounts/feedback/).

// categories: [{ value, label }] with values from Feedback.Category in the backend.
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
      setErrors(formErrors(error, t));
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
