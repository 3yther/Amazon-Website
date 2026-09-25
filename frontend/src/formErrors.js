import { ApiError } from "./api.js";

// Turns a failed API call into { field: "message" } for a form.
// Errors that aren't about one field go under "form".
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
