import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../api.js";
import { formErrors } from "../formErrors.js";
import AuthPanel from "../components/AuthPanel.jsx";
import { FormError, TextField } from "../components/FormFields.jsx";
import { useT } from "../i18n/I18nProvider.jsx";

// Forgotten password, step 1. The server gives the same answer whether or not
// the account exists, so nobody can use this to check who has an account.
export default function ForgotPassword() {
  const t = useT();
  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | sent

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("submitting");
    setErrors({});
    try {
      await requestPasswordReset(username);
      setStatus("sent");
    } catch (error) {
      setErrors(formErrors(error, t));
      setStatus("idle");
    }
  }

  return (
    <div className="auth-layout">
      <AuthPanel />

      <div className="auth-side">
        <div className="auth-form" aria-labelledby="page-title">
          <div className="auth-heading">
            <p className="label">{t("login.label")}</p>
            <h1 id="page-title">{t("forgotPassword.title")}</h1>
            <p className="lead">{t("forgotPassword.lead")}</p>
          </div>

          {status === "sent" ? (
            <p className="notice" role="status">
              {t("forgotPassword.sent")}
            </p>
          ) : (
            <form className="account-form" onSubmit={handleSubmit} noValidate>
              {errors.form && <FormError message={errors.form} />}

              <TextField
                id="forgot-password-username"
                label={t("login.username")}
                name="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
                error={errors.username}
              />

              <button type="submit" className="button button--primary" disabled={status === "submitting"}>
                {status === "submitting" ? t("forgotPassword.submitting") : t("forgotPassword.submit")}
              </button>
            </form>
          )}

          <p className="account-switch">
            {t("forgotPassword.backToLogin")} <Link to="/login">{t("login.submit")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
