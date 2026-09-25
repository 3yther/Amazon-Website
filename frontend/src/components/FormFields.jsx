import { useState } from "react";
import { useT } from "../i18n/I18nProvider.jsx";
import { AlertIcon, EyeIcon, EyeOffIcon } from "./Icons.jsx";

// Form building blocks for the account pages. Each field links its label,
// hint and error to the control, so screen readers read them together.

function describedBy(id, hint, error) {
  const ids = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean);
  return ids.length ? ids.join(" ") : undefined;
}

function FieldError({ id, message }) {
  return (
    <p className="field__error" id={id} role="alert">
      <AlertIcon />
      {message}
    </p>
  );
}

export function TextField({ id, label, hint, error, type = "text", ...inputProps }) {
  const t = useT();
  // Only a password field tracks this, and only it renders the toggle: a
  // text or email field comes out exactly as it did before.
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  const input = (
    <input
      id={id}
      type={isPassword && visible ? "text" : type}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, hint, error)}
      {...inputProps}
    />
  );

  return (
    <div className="field">
      <label className="label" htmlFor={id}>
        {label}
      </label>
      {hint && (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}

      {isPassword ? (
        <div className="field__control">
          {input}
          {/* type="button" so it never submits the form it sits in. The name
              says what pressing it will do, since the icon alone does not. */}
          <button
            type="button"
            className="field__reveal"
            aria-label={visible ? t("forms.hidePassword") : t("forms.showPassword")}
            onClick={() => setVisible((current) => !current)}
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      ) : (
        input
      )}

      {error && <FieldError id={`${id}-error`} message={error} />}
    </div>
  );
}

export function SelectField({ id, label, hint, error, children, ...selectProps }) {
  return (
    <div className="field">
      <label className="label" htmlFor={id}>
        {label}
      </label>
      {hint && (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...selectProps}
      >
        {children}
      </select>
      {error && <FieldError id={`${id}-error`} message={error} />}
    </div>
  );
}

export function TextareaField({ id, label, hint, error, ...textareaProps }) {
  return (
    <div className="field">
      <label className="label" htmlFor={id}>
        {label}
      </label>
      {hint && (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...textareaProps}
      />
      {error && <FieldError id={`${id}-error`} message={error} />}
    </div>
  );
}

/**
 * A single tick box with its label beside it. The label takes markup as well
 * as text, so it can hold a link, and clicking any of it ticks the box.
 */
export function CheckboxField({ id, label, hint, error, ...inputProps }) {
  return (
    <div className="field">
      <div className="checkbox">
        <input
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          {...inputProps}
        />
        <label htmlFor={id}>{label}</label>
      </div>
      {hint && (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && <FieldError id={`${id}-error`} message={error} />}
    </div>
  );
}

/** An error that belongs to the whole form, e.g. a wrong password. */
export function FormError({ message }) {
  return (
    <div className="notice" role="alert">
      <AlertIcon />
      <div>
        <p>{message}</p>
      </div>
    </div>
  );
}
