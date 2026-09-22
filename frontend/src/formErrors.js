import { ApiError } from "./api.js";

/**
 * Turn a failed API call into { fieldName: "message" } for a form. On a 400
 * the backend sends { field: ["message", ...] }. Anything not tied to one
 * field (a wrong password, the server being down) goes under "form".
 */
export function formErrors(error) {
  if (error instanceof ApiError && error.status === 400 && error.body) {
    const errors = {};
    for (const [key, messages] of Object.entries(error.body)) {
      errors[key === "non_field_errors" ? "form" : key] = [].concat(messages).join(" ");
    }
    return errors;
  }
  if (error instanceof ApiError) {
    return { form: "Something went wrong. Try again." };
  }
  return { form: "Could not reach the server. Check your connection and try again." };
}
