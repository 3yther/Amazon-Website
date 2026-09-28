import { ApiError } from "./api.js";
import { makeTranslate } from "./i18n/translate.js";
import { translateServerMessage } from "./i18n/serverMessages.js";

const english = makeTranslate();

// Turns a failed API call into { field: "message" } for a form, in the
// visitor's language when the message is one we know (i18n/serverMessages.js).
// Errors that aren't about one field go under "form".
export function formErrors(error, t = english) {
  if (error instanceof ApiError && error.status === 400 && error.body) {
    const errors = {};
    for (const [key, messages] of Object.entries(error.body)) {
      errors[key === "non_field_errors" ? "form" : key] = [].concat(messages)
        .map((message) => translateServerMessage(message, t))
        .join(" ");
    }
    return errors;
  }
  if (error instanceof ApiError) {
    return { form: t("forms.somethingWrong") };
  }
  return { form: t("forms.noConnection") };
}
