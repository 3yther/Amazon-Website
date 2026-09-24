import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import KnowledgeQuiz from "../components/KnowledgeQuiz.jsx";
import { expectNoAxeViolations } from "./axe.js";

// Two short questions, so a whole run fits in one test.
const QUESTIONS = [
  {
    id: "colour",
    question: "What colour is the sky?",
    options: ["Blue", "Green", "Red", "Yellow"],
    correctAnswer: "Blue",
    explanation: "Blue, on a clear day.",
  },
  {
    id: "legs",
    question: "How many legs does a cat have?",
    options: ["Two", "Four", "Six", "Eight"],
    correctAnswer: "Four",
    explanation: "Four.",
  },
];

afterEach(() => {
  vi.restoreAllMocks();
});

// The Smiley callbacks are replaced with spies, so the tests can see what the
// quiz tells Smiley without the chat widget being on the page.
function renderQuiz() {
  const callbacks = {
    onCorrectAnswer: vi.fn(),
    onIncorrectAnswer: vi.fn(),
    onFinish: vi.fn(),
  };
  const view = render(<KnowledgeQuiz questions={QUESTIONS} {...callbacks} />);
  return { ...view, ...callbacks };
}

const optionLabels = () => screen.getAllByRole("radio").map((radio) => radio.labels[0].textContent);
const progressWidth = (container) =>
  container.querySelector(".knowledge-quiz__progress-fill").style.width;

describe("Knowledge check", () => {
  it("will not check an answer until one is chosen", () => {
    renderQuiz();
    expect(screen.getByText("Question 1 of 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Check answer" })).toBeDisabled();
  });

  it("says when an answer is right, tells Smiley and moves focus to the feedback", async () => {
    const user = userEvent.setup({ delay: null });
    const { onCorrectAnswer } = renderQuiz();

    await user.click(screen.getByLabelText("Blue"));
    await user.click(screen.getByRole("button", { name: "Check answer" }));

    const verdict = screen.getByText("That is right.");
    expect(onCorrectAnswer).toHaveBeenCalledWith({ question: "What colour is the sky?" });
    await waitFor(() => expect(verdict.parentElement).toHaveFocus());
    // The answer is locked in once checked.
    expect(screen.getByLabelText("Green")).toBeDisabled();
  });

  it("shows the right answer when one is wrong, and hands the question to Smiley", async () => {
    const user = userEvent.setup({ delay: null });
    const { onIncorrectAnswer } = renderQuiz();

    await user.click(screen.getByLabelText("Green"));
    await user.click(screen.getByRole("button", { name: "Check answer" }));

    expect(screen.getByText("Not quite. The right answer: Blue.")).toBeInTheDocument();
    expect(onIncorrectAnswer).toHaveBeenCalledWith({
      question: "What colour is the sky?",
      correctAnswer: "Blue",
      chosenAnswer: "Green",
      explanation: "Blue, on a clear day.",
    });
  });

  it("fills the progress bar as answers are checked, then gives the score", async () => {
    const user = userEvent.setup({ delay: null });
    const { container, onFinish } = renderQuiz();
    expect(progressWidth(container)).toBe("0%");

    await user.click(screen.getByLabelText("Blue"));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(progressWidth(container)).toBe("50%");

    await user.click(screen.getByRole("button", { name: "Next question" }));
    expect(screen.getByText("Question 2 of 2")).toBeInTheDocument();
    expect(progressWidth(container)).toBe("50%");

    await user.click(screen.getByLabelText("Two"));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(progressWidth(container)).toBe("100%");

    await user.click(screen.getByRole("button", { name: "See my score" }));
    expect(screen.getByRole("heading", { name: "You scored 1 out of 2" })).toBeInTheDocument();
    expect(onFinish).toHaveBeenCalledWith({ score: 1, total: 2 });
  });

  it("shuffles the options, and shuffles them again on Start again", async () => {
    // Math.random() at 0 moves every option; just under 1 leaves them in place.
    const random = vi.spyOn(Math, "random").mockReturnValue(0);
    const user = userEvent.setup({ delay: null });
    renderQuiz();
    expect(optionLabels()).toEqual(["Green", "Red", "Yellow", "Blue"]);

    random.mockReturnValue(0.99);
    for (const answer of ["Blue", "Four"]) {
      await user.click(screen.getByLabelText(answer));
      await user.click(screen.getByRole("button", { name: "Check answer" }));
      await user.click(screen.getByRole("button", { name: /Next question|See my score/ }));
    }
    await user.click(screen.getByRole("button", { name: "Start again" }));

    expect(screen.getByText("Question 1 of 2")).toBeInTheDocument();
    expect(optionLabels()).toEqual(["Blue", "Green", "Red", "Yellow"]);
  });

  it("has no accessibility problems, before and after checking an answer", async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = renderQuiz();
    await expectNoAxeViolations(container);

    await user.click(screen.getByLabelText("Green"));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    await expectNoAxeViolations(container);
  });
});
