import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AboutFaq from "../components/AboutFaq.jsx";
import { FAQS } from "../aboutContent.js";

// Testing Library finds things by role and name, like a screen reader would.

/** The button for one FAQ question, found by its visible text. */
function questionButton(faq) {
  return screen.getByRole("button", { name: faq.question });
}

describe("About page FAQ", () => {
  it("shows every question as a closed button", () => {
    render(<AboutFaq />);

    for (const faq of FAQS) {
      const button = questionButton(faq);
      expect(button).toHaveAttribute("aria-expanded", "false");
      expect(screen.getByText(faq.answer)).not.toBeVisible();
    }
  });

  it("opens an answer when its question is clicked", async () => {
    // delay: null makes userEvent skip the pause between actions, so tests run faster.
    const user = userEvent.setup({ delay: null });
    render(<AboutFaq />);

    await user.click(questionButton(FAQS[0]));

    expect(questionButton(FAQS[0])).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(FAQS[0].answer)).toBeVisible();
  });

  it("keeps only one answer open at a time", async () => {
    const user = userEvent.setup({ delay: null });
    render(<AboutFaq />);

    await user.click(questionButton(FAQS[0]));
    await user.click(questionButton(FAQS[1]));

    expect(questionButton(FAQS[0])).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText(FAQS[0].answer)).not.toBeVisible();
    expect(questionButton(FAQS[1])).toHaveAttribute("aria-expanded", "true");
  });

  it("closes an open answer when its question is clicked again", async () => {
    const user = userEvent.setup({ delay: null });
    render(<AboutFaq />);

    await user.click(questionButton(FAQS[0]));
    await user.click(questionButton(FAQS[0]));

    expect(questionButton(FAQS[0])).toHaveAttribute("aria-expanded", "false");
  });

  it("works from the keyboard with Tab, Enter and Space", async () => {
    const user = userEvent.setup({ delay: null });
    render(<AboutFaq />);

    await user.tab();
    expect(questionButton(FAQS[0])).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(questionButton(FAQS[0])).toHaveAttribute("aria-expanded", "true");

    await user.keyboard(" ");
    expect(questionButton(FAQS[0])).toHaveAttribute("aria-expanded", "false");
  });

  it("points each question at its own answer", () => {
    render(<AboutFaq />);

    for (const faq of FAQS) {
      const answerId = questionButton(faq).getAttribute("aria-controls");
      expect(document.getElementById(answerId)).toHaveTextContent(faq.answer);
    }
  });
});
