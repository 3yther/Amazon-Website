import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deactivateAccount, logout, updateProfile } from "../../api.js";
import { useAuth } from "../../auth.jsx";
import { formErrors } from "../../formErrors.js";
import { useT } from "../../i18n/I18nProvider.jsx";
import { FormError, TextField } from "../FormFields.jsx";

function fieldsFrom(user) {
  return {
    first_name: user?.first_name ?? "",
    last_name: user?.last_name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  };
}

/**
 * Editable profile details, signing out, and account deactivation behind a
 * password confirmation. Deactivating signs the user out at once: a
 * deactivated account can no longer authenticate (see DeactivateAccountView).
 *
 * Logging out lives here rather than in the header's account menu, where it
 * used to sit one press away on every page. It gets its own section between
 * the profile form and the danger zone: not part of the form, since it
 * throws away whatever is typed there, and not in the danger zone either,
 * since logging out costs nothing and needs no confirmation.
 */
export default function AccountSettings() {
  const t = useT();
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const [fields, setFields] = useState(() => fieldsFrom(user));
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | saving | saved

  const [loggingOut, setLoggingOut] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [deactivateError, setDeactivateError] = useState("");
  const [deactivating, setDeactivating] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setFields((current) => ({ ...current, [name]: value }));
    setStatus((current) => (current === "saved" ? "idle" : current));
  }

  async function handleSave(event) {
    event.preventDefault();
    setStatus("saving");
    setErrors({});
    try {
      await updateProfile(fields);
      await refresh();
      setStatus("saved");
    } catch (error) {
      setErrors(formErrors(error));
      setStatus("idle");
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      // A 401 means the session had already ended. refresh() settles it either way.
    }
    await refresh();
    navigate("/login");
  }

  function closeConfirm() {
    setConfirmOpen(false);
    setPassword("");
    setDeactivateError("");
  }

  async function handleDeactivate(event) {
    event.preventDefault();
    setDeactivating(true);
    setDeactivateError("");
    try {
      await deactivateAccount(password);
      await refresh();
      navigate("/login", { replace: true });
    } catch (error) {
      setDeactivateError(formErrors(error).form ?? t("settings.account.wrongPassword"));
      setDeactivating(false);
    }
  }

  return (
    <div className="settings-section">
      <p className="label">{t("settings.tabs.account")}</p>

      <form className="account-form" onSubmit={handleSave} noValidate>
        {errors.form && <FormError message={errors.form} />}
        {status === "saved" && (
          <div className="notice notice--success" role="status">
            <p>{t("settings.account.saved")}</p>
          </div>
        )}

        <TextField
          id="pref-first-name"
          label={t("settings.account.firstName")}
          name="first_name"
          value={fields.first_name}
          onChange={updateField}
          autoComplete="given-name"
          error={errors.first_name}
        />
        <TextField
          id="pref-last-name"
          label={t("settings.account.lastName")}
          name="last_name"
          value={fields.last_name}
          onChange={updateField}
          autoComplete="family-name"
          error={errors.last_name}
        />
        <TextField
          id="pref-email"
          label={t("settings.account.email")}
          name="email"
          type="email"
          value={fields.email}
          onChange={updateField}
          autoComplete="email"
          error={errors.email}
        />
        <TextField
          id="pref-phone"
          label={t("settings.account.phone")}
          name="phone"
          type="tel"
          value={fields.phone}
          onChange={updateField}
          autoComplete="tel"
          error={errors.phone}
        />

        <div className="account-card__actions">
          <button type="submit" className="button button--primary" disabled={status === "saving"}>
            {status === "saving" ? t("settings.account.saving") : t("settings.account.save")}
          </button>
          <button
            type="button"
            className="button"
            onClick={() => {
              setFields(fieldsFrom(user));
              setErrors({});
            }}
            disabled={status === "saving"}
          >
            {t("settings.account.cancel")}
          </button>
        </div>
      </form>

      <div className="settings-block">
        <p className="label">{t("settings.account.signingOutLabel")}</p>
        <p>{t("settings.account.signingOutText")}</p>
        <button type="button" className="button" onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? t("settings.account.loggingOut") : t("settings.account.logOut")}
        </button>
      </div>

      <div className="danger-zone">
        <p className="label">{t("settings.account.dangerLabel")}</p>
        <p>{t("settings.account.dangerText")}</p>
        <button type="button" className="button button--danger" onClick={() => setConfirmOpen(true)}>
          {t("settings.account.deactivate")}
        </button>
      </div>

      {confirmOpen && (
        <div className="modal-overlay" role="presentation" onClick={closeConfirm}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="deactivate-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="deactivate-title">{t("settings.account.deactivate")}</h2>
            <p>{t("settings.account.confirmText")}</p>

            <form onSubmit={handleDeactivate} noValidate>
              {deactivateError && <FormError message={deactivateError} />}
              <TextField
                id="pref-deactivate-password"
                label={t("settings.account.password")}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
              <div className="account-card__actions">
                <button type="submit" className="button button--danger" disabled={deactivating}>
                  {deactivating ? t("settings.account.deactivating") : t("settings.account.deactivate")}
                </button>
                <button type="button" className="button" onClick={closeConfirm}>
                  {t("settings.account.cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
