import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api.js";
import { useAuth } from "../auth.jsx";
import { formErrors } from "../formErrors.js";
import AuthPanel from "../components/AuthPanel.jsx";
import { FormError, TextField } from "../components/FormFields.jsx";
import { useT } from "../i18n/I18nProvider.jsx";

export default function Login() {
  const t = useT();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [fields, setFields] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting

  function updateField(event) {
    const { name, value } = event.target;
    setFields((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("submitting");
    setErrors({});
    try {
      await login(fields.username, fields.password);
      await refresh();
      navigate("/", { replace: true });
    } catch (error) {
      setErrors(formErrors(error)); // what the user typed stays in place
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
            <h1 id="page-title">{t("login.title")}</h1>
            <p className="lead">{t("login.lead")}</p>
          </div>

          <form className="account-form" onSubmit={handleSubmit} noValidate>
            {errors.form && <FormError message={errors.form} />}

            <TextField
              id="login-username"
              label={t("login.username")}
              name="username"
              value={fields.username}
              onChange={updateField}
              autoComplete="username"
              required
              error={errors.username}
            />
            <TextField
              id="login-password"
              label={t("login.password")}
              name="password"
              type="password"
              value={fields.password}
              onChange={updateField}
              autoComplete="current-password"
              required
              error={errors.password}
            />

            <button type="submit" className="button button--primary" disabled={status === "submitting"}>
              {status === "submitting" ? t("login.submitting") : t("login.submit")}
            </button>
          </form>

          <p className="account-switch">
            <Link to="/forgot-password">{t("login.forgotPassword")}</Link>
          </p>
          <p className="account-switch">
            {t("login.noAccount")} <Link to="/register">{t("login.register")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
