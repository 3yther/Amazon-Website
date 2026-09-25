import { useState } from "react";
import { changePassword } from "../../api.js";
import { formatDate } from "../../formats.js";
import { formErrors } from "../../formErrors.js";
import { FormError, TextField } from "../FormFields.jsx";

const EMPTY_FIELDS = { current_password: "", new_password: "", confirm_password: "" };
const STRENGTH_LABELS = ["Very weak", "Weak", "Fair", "Good", "Strong", "Very strong"];

/** A rough client-side estimate, only to guide the person typing; the
 * server-side validators in backend/config/settings.py AUTH_PASSWORD_VALIDATORS
 * are what actually decide whether a password is accepted. */
function passwordStrength(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return { score, label: STRENGTH_LABELS[score] };
}

/**
 * Change password, with a live strength hint, plus a read-only reminder of
 * when the password was last changed.
 */
export default function SecuritySettings({ lastChanged }) {
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success

  function updateField(event) {
    const { name, value } = event.target;
    setFields((current) => ({ ...current, [name]: value }));
    setStatus((current) => (current === "success" ? "idle" : current));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("submitting");
    setErrors({});
    try {
      await changePassword(fields);
      setFields(EMPTY_FIELDS);
      setStatus("success");
    } catch (error) {
      setErrors(formErrors(error));
      setStatus("idle");
    }
  }

  const strength = passwordStrength(fields.new_password);

  return (
    <div className="settings-section">
      <p className="label">Security</p>

      {lastChanged && (
        <p className="field__hint">
          Password last changed {formatDate(lastChanged)}.
        </p>
      )}

      <form className="account-form" onSubmit={handleSubmit} noValidate>
        {errors.form && <FormError message={errors.form} />}
        {status === "success" && (
          <div className="notice notice--success" role="status">
            <p>Password changed.</p>
          </div>
        )}

        <TextField
          id="pref-current-password"
          label="Current password"
          name="current_password"
          type="password"
          value={fields.current_password}
          onChange={updateField}
          autoComplete="current-password"
          required
          error={errors.current_password}
        />
        <div>
          <TextField
            id="pref-new-password"
            label="New password"
            name="new_password"
            type="password"
            hint={fields.new_password ? `Strength: ${strength.label}` : "At least 8 characters."}
            value={fields.new_password}
            onChange={updateField}
            autoComplete="new-password"
            required
            error={errors.new_password}
          />
          {fields.new_password && (
            <div className="password-strength" aria-hidden="true">
              <div className="password-strength__bar" style={{ "--strength": strength.score / 5 }} />
            </div>
          )}
        </div>
        <TextField
          id="pref-confirm-password"
          label="Confirm new password"
          name="confirm_password"
          type="password"
          value={fields.confirm_password}
          onChange={updateField}
          autoComplete="new-password"
          required
          error={errors.confirm_password}
        />

        <button type="submit" className="button button--primary" disabled={status === "submitting"}>
          {status === "submitting" ? "Saving" : "Change password"}
        </button>
      </form>
    </div>
  );
}
