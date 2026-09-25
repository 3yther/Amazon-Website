import { useEffect, useState } from "react";
import { submitFeedback } from "../api.js";
import { useAuth } from "../auth.jsx";
import { formErrors } from "../formErrors.js";
import { FormError, SelectField, TextareaField, TextField } from "../components/FormFields.jsx";
import { useT } from "../i18n/I18nProvider.jsx";

// Values from the backend's Feedback.Category; labels in i18n/messages (feedbackPage).
const CATEGORIES = ["bug", "feature", "general", "accessibility"];

// Makes this page dark mode while it's open, then puts the old theme back.
// Doesn't change the saved setting.
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
  const t = useT();
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
      setErrors(formErrors(error, t));
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <section className="intro" aria-labelledby="page-title">
        <p className="label">{t("feedbackPage.label")}</p>
        <h1 id="page-title">{t("feedbackPage.thanksTitle")}</h1>
        <p className="lead">{t("feedbackPage.thanksLead")}</p>
      </section>
    );
  }

  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">{t("feedbackPage.label")}</p>
        <h1 id="page-title">{t("feedbackPage.title")}</h1>
        <p className="lead">{t("feedbackPage.lead")}</p>
      </section>

      <form className="account-form" onSubmit={handleSubmit} noValidate>
        {errors.form && <FormError message={errors.form} />}

        <SelectField
          id="feedback-category"
          label={t("feedbackPage.category")}
          name="category"
          value={fields.category}
          onChange={updateField}
          error={errors.category}
        >
          {CATEGORIES.map((value) => (
            <option key={value} value={value}>
              {t(`feedbackPage.categories.${value}`)}
            </option>
          ))}
        </SelectField>

        <TextareaField
          id="feedback-message"
          label={t("feedbackPage.message")}
          name="message"
          value={fields.message}
          onChange={updateField}
          required
          error={errors.message}
        />

        <TextField
          id="feedback-email"
          label={t("feedbackPage.email")}
          name="email"
          type="email"
          hint={t("feedbackPage.emailHint")}
          value={fields.email}
          onChange={updateField}
          autoComplete="email"
          error={errors.email}
        />

        <button type="submit" className="button button--primary" disabled={status === "submitting"}>
          {status === "submitting" ? t("feedbackPage.sending") : t("feedbackPage.submit")}
        </button>
      </form>
    </>
  );
}
