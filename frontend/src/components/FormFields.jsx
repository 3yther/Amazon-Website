import { AlertIcon } from "./Icons.jsx";

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
      <input
        id={id}
        type={type}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...inputProps}
      />
      {error && <FieldError id={`${id}-error`} message={error} />}
    </div>
  );
}

export function SelectField({ id, label, error, children, ...selectProps }) {
  return (
    <div className="field">
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, null, error)}
        {...selectProps}
      >
        {children}
      </select>
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
