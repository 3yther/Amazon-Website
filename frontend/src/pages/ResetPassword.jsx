import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { confirmPasswordReset } from "../api.js";
import { useAuth } from "../auth.jsx";
import { formErrors } from "../formErrors.js";
import AuthPanel from "../components/AuthPanel.jsx";
import { FormError, TextField } from "../components/FormFields.jsx";
import { useT } from "../i18n/I18nProvider.jsx";

// Forgotten password, step 2. The email link brings ?uid=...&token=... here.
export default function ResetPassword() {
  const t = useT();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid") ?? "";
  const token = searchParams.get("token") ?? "";

  const [fields, setFields] = useState({ new_password: "", confirm_password: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting

  const linkLooksUsable = uid !== "" && token !== "";

  function updateField(event) {
    const { name, value } = event.target;
    setFields((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("submitting");
    setErrors({});
    try {
      await confirmPasswordReset({ uid, token, ...fields });
      await refresh();
      navigate("/", { replace: true });
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
            <h1 id="page-title">{t("resetPassword.title")}</h1>
          </div>

          {!linkLooksUsable ? (
            <>
              <FormError message={t("resetPassword.linkMissing")} />
              <p className="account-switch">
                <Link to="/forgot-password">{t("resetPassword.requestNewLink")}</Link>
              </p>
            </>
          ) : (
            <>
              <form className="account-form" onSubmit={handleSubmit} noValidate>
                {errors.form && <FormError message={errors.form} />}
                {errors.token && (
                  <>
                    <FormError message={errors.token} />
                    <p className="account-switch">
                      <Link to="/forgot-password">{t("resetPassword.requestNewLink")}</Link>
                    </p>
                  </>
                )}

                <TextField
                  id="reset-password-new"
                  label={t("resetPassword.newPassword")}
                  name="new_password"
                  type="password"
                  hint={t("resetPassword.passwordHint")}
                  value={fields.new_password}
                  onChange={updateField}
                  autoComplete="new-password"
                  required
                  error={errors.new_password}
                />
                <TextField
                  id="reset-password-confirm"
                  label={t("resetPassword.confirmPassword")}
                  name="confirm_password"
                  type="password"
                  value={fields.confirm_password}
                  onChange={updateField}
                  autoComplete="new-password"
                  required
                  error={errors.confirm_password}
                />

                <button type="submit" className="button button--primary" disabled={status === "submitting"}>
                  {status === "submitting" ? t("resetPassword.submitting") : t("resetPassword.submit")}
                </button>
              </form>

              <p className="account-switch">
                {t("resetPassword.backToLogin")} <Link to="/login">{t("login.submit")}</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
