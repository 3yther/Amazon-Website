import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api.js";
import { useAuth } from "../auth.jsx";
import { formErrors } from "../formErrors.js";
import { FormError, TextField } from "../components/FormFields.jsx";

export default function Login() {
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
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">Account</p>
        <h1 id="page-title">Log in</h1>
        <p className="lead">Log in to open sign-up resources.</p>
      </section>

      <form className="account-form" onSubmit={handleSubmit} noValidate>
        {errors.form && <FormError message={errors.form} />}

        <TextField
          id="login-username"
          label="Username"
          name="username"
          value={fields.username}
          onChange={updateField}
          autoComplete="username"
          required
          error={errors.username}
        />
        <TextField
          id="login-password"
          label="Password"
          name="password"
          type="password"
          value={fields.password}
          onChange={updateField}
          autoComplete="current-password"
          required
          error={errors.password}
        />

        <button type="submit" className="button button--primary" disabled={status === "submitting"}>
          {status === "submitting" ? "Logging in" : "Log in"}
        </button>
      </form>

      <p className="account-switch">
        No account yet? <Link to="/register">Register</Link>
      </p>
    </>
  );
}
