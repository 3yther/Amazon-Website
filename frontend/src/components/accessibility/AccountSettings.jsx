import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deactivateAccount, updateProfile } from "../../api.js";
import { useAuth } from "../../auth.jsx";
import { formErrors } from "../../formErrors.js";
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
 * Editable profile details, and account deactivation behind a password
 * confirmation. Deactivating signs the user out at once: a deactivated
 * account can no longer authenticate (see DeactivateAccountView).
 */
export default function AccountSettings() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const [fields, setFields] = useState(() => fieldsFrom(user));
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | saving | saved

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
      setDeactivateError(formErrors(error).form ?? "Incorrect password.");
      setDeactivating(false);
    }
  }

  return (
    <div className="settings-section">
      <p className="label">Account</p>

      <form className="account-form" onSubmit={handleSave} noValidate>
        {errors.form && <FormError message={errors.form} />}
        {status === "saved" && (
          <div className="notice notice--success" role="status">
            <p>Profile saved.</p>
          </div>
        )}

        <TextField
          id="pref-first-name"
          label="First name"
          name="first_name"
          value={fields.first_name}
          onChange={updateField}
          autoComplete="given-name"
          error={errors.first_name}
        />
        <TextField
          id="pref-last-name"
          label="Last name"
          name="last_name"
          value={fields.last_name}
          onChange={updateField}
          autoComplete="family-name"
          error={errors.last_name}
        />
        <TextField
          id="pref-email"
          label="Email"
          name="email"
          type="email"
          value={fields.email}
          onChange={updateField}
          autoComplete="email"
          error={errors.email}
        />
        <TextField
          id="pref-phone"
          label="Phone"
          name="phone"
          type="tel"
          value={fields.phone}
          onChange={updateField}
          autoComplete="tel"
          error={errors.phone}
        />

        <div className="account-card__actions">
          <button type="submit" className="button button--primary" disabled={status === "saving"}>
            {status === "saving" ? "Saving" : "Save"}
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
            Cancel
          </button>
        </div>
      </form>

      <div className="danger-zone">
        <p className="label">Danger zone</p>
        <p>Deactivating your account signs you out and disables sign-in until it is reactivated.</p>
        <button type="button" className="button button--danger" onClick={() => setConfirmOpen(true)}>
          Deactivate account
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
            <h2 id="deactivate-title">Deactivate account</h2>
            <p>Enter your password to confirm. This signs you out immediately.</p>

            <form onSubmit={handleDeactivate} noValidate>
              {deactivateError && <FormError message={deactivateError} />}
              <TextField
                id="pref-deactivate-password"
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
              <div className="account-card__actions">
                <button type="submit" className="button button--danger" disabled={deactivating}>
                  {deactivating ? "Deactivating" : "Deactivate account"}
                </button>
                <button type="button" className="button" onClick={closeConfirm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
