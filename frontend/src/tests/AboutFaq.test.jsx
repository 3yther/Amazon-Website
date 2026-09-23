import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AboutFaq from "../components/AboutFaq.jsx";
import { FAQS } from "../aboutContent.js";

// NEW CONCEPT: Testing Library finds things the way a person would, by role
// and name ("the button called ...") rather than by class name. If a test can
// find it that way, a screen reader can too.

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
    // NEW CONCEPT: userEvent acts like a real person: it moves focus, presses
    // keys and clicks, firing the same events a browser would.
    const user = userEvent.setup();
    render(<AboutFaq />);

    await user.click(questionButton(FAQS[0]));

    expect(questionButton(FAQS[0])).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(FAQS[0].answer)).toBeVisible();
  });

  it("keeps only one answer open at a time", async () => {
    const user = userEvent.setup();
    render(<AboutFaq />);

    await user.click(questionButton(FAQS[0]));
    await user.click(questionButton(FAQS[1]));

    expect(questionButton(FAQS[0])).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText(FAQS[0].answer)).not.toBeVisible();
    expect(questionButton(FAQS[1])).toHaveAttribute("aria-expanded", "true");
  });

  it("closes an open answer when its question is clicked again", async () => {
    const user = userEvent.setup();
    render(<AboutFaq />);

    await user.click(questionButton(FAQS[0]));
    await user.click(questionButton(FAQS[0]));

    expect(questionButton(FAQS[0])).toHaveAttribute("aria-expanded", "false");
  });

  it("works from the keyboard with Tab, Enter and Space", async () => {
    const user = userEvent.setup();
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
