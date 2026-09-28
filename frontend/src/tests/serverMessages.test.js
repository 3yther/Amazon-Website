import { describe, expect, it } from "vitest";
import { ApiError } from "../api.js";
import { formErrors } from "../formErrors.js";
import { LANGUAGES } from "../i18n/languages.js";
import { SERVER_MESSAGE_EXAMPLES, translateServerMessage } from "../i18n/serverMessages.js";
import { makeTranslate } from "../i18n/translate.js";

// The API answers in English. These check each message it is known to send
// comes out in every language, with its values (a postcode, a number) kept.

const CATALOGS = import.meta.glob("../i18n/messages/*.js", { eager: true });
const translator = (code) => makeTranslate(CATALOGS[`../i18n/messages/${code}.js`].default);

describe("server messages", () => {
  it("come back word for word in English, so every pattern matches its message", () => {
    const t = translator("en");
    for (const message of SERVER_MESSAGE_EXAMPLES) {
      expect(translateServerMessage(message, t)).toBe(message);
    }
  });

  it.each(LANGUAGES.filter((language) => language.code !== "en").map((language) => language.code))(
    "are all translated into %s, with their values filled in",
    (code) => {
      const t = translator(code);
      for (const message of SERVER_MESSAGE_EXAMPLES) {
        const words = translateServerMessage(message, t);
        expect(words, message).not.toBe(message);
        expect(words, message).not.toMatch(/serverErrors\.|\{\w+\}/);
      }
      expect(translateServerMessage('We could not find the postcode "ZZ99 9ZZ". Check it and try again.', t)).toContain(
        "ZZ99 9ZZ",
      );
    },
  );

  it("leave a message we do not know as it is", () => {
    expect(translateServerMessage("Something new from the server.", translator("pl"))).toBe(
      "Something new from the server.",
    );
    expect(translateServerMessage(undefined, translator("pl"))).toBeUndefined();
  });

  it("are translated in form errors", () => {
    const error = new ApiError(400, {
      username: ["A user with that username already exists."],
      password: ["This password is too short. It must contain at least 8 characters.", "This password is too common."],
    });
    const errors = formErrors(error, translator("es"));
    expect(errors.username).toBe(translator("es")("serverErrors.usernameTaken"));
    expect(errors.password).toContain("8");
    expect(errors.password).not.toMatch(/too short|too common/);
  });
});
