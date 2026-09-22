import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api.js";
import { useAuth } from "../auth.jsx";
import { formErrors } from "../formErrors.js";
import { PATHWAY_NAMES, USER_TYPES } from "../labels.js";
import { FormError, SelectField, TextField } from "../components/FormFields.jsx";

const EMPTY_FIELDS = {
  username: "",
  password: "",
  password_confirm: "",
  user_type: "",
  pathway_interest: "",
};

export default function Register() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [fields, setFields] = useState(EMPTY_FIELDS);
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

    // Leave out an unanswered account type so the API replies "This field is
    // required." rather than rejecting "" as an invalid choice.
    const payload = { ...fields };
    if (!payload.user_type) delete payload.user_type;

    try {
      await register(payload); // also signs the new user in
      await refresh();
      navigate("/", { replace: true });
    } catch (error) {
      setErrors(formErrors(error));
      setStatus("idle");
    }
  }

  // One centred card over the sign-up photo (see .register-page in styles.css).
  return (
    <section className="register-page" aria-labelledby="page-title">
      <div className="account-card">
        <div className="account-card__intro">
          <p className="label">Account</p>
          <h1 id="page-title">Sign up</h1>
          <p className="lead">Create an account to open sign-up resources.</p>
        </div>

        <form className="account-form" onSubmit={handleSubmit} noValidate>
          {errors.form && <FormError message={errors.form} />}

          <TextField
            id="register-username"
            label="Username"
            name="username"
            hint="Letters, numbers and @ . + - _ only."
            value={fields.username}
            onChange={updateField}
            autoComplete="username"
            required
            error={errors.username}
          />
          <TextField
            id="register-password"
            label="Password"
            name="password"
            type="password"
            hint="At least 8 characters. Not all numbers, not a common password."
            value={fields.password}
            onChange={updateField}
            autoComplete="new-password"
            required
            error={errors.password}
          />
          <TextField
            id="register-password-confirm"
            label="Confirm password"
            name="password_confirm"
            type="password"
            value={fields.password_confirm}
            onChange={updateField}
            autoComplete="new-password"
            required
            error={errors.password_confirm}
          />
          <SelectField
            id="register-user-type"
            label="Account type"
            name="user_type"
            value={fields.user_type}
            onChange={updateField}
            required
            error={errors.user_type}
          >
            <option value="">Choose one</option>
            {Object.entries(USER_TYPES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectField>
          <SelectField
            id="register-pathway"
            label="Pathway (optional)"
            name="pathway_interest"
            value={fields.pathway_interest}
            onChange={updateField}
            error={errors.pathway_interest}
          >
            <option value="">No preference</option>
            {PATHWAY_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </SelectField>

          {/* Sign up first, so it also comes first in the keyboard order. */}
          <div className="account-card__actions">
            <button type="submit" className="button button--primary" disabled={status === "submitting"}>
              {status === "submitting" ? "Signing up" : "Sign up"}
            </button>
            <p>
              Already registered? <Link to="/login">Log in</Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
