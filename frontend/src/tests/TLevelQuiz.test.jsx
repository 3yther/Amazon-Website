import { describe, expect, it } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import TLevelQuiz from "../components/TLevelQuiz.jsx";
import { QUIZ_QUESTIONS, QUIZ_RESULTS } from "../aboutContent.js";

function renderQuiz() {
  return render(
    <MemoryRouter>
      <TLevelQuiz />
    </MemoryRouter>,
  );
}

/**
 * Answers every question, picking the option worth the given score. For
 * example [2, 2, 1, 1, 0, 0] picks a 2-point answer for the first question,
 * a 2-point answer for the second, and so on.
 */
async function answerAll(user, scores) {
  // NEW CONCEPT: "group" is the role of a <fieldset>. There is one per
  // question, in the same order as QUIZ_QUESTIONS.
  const groups = screen.getAllByRole("group");

  for (const [index, question] of QUIZ_QUESTIONS.entries()) {
    const option = question.options.find((choice) => choice.score === scores[index]);
    // getByLabelText finds the radio through its <label>, the same link a
    // screen reader uses, and is much quicker than searching by role.
    await user.click(within(groups[index]).getByLabelText(option.label));
  }
}

function seeResult() {
  return screen.getByRole("button", { name: "See my result" });
}

const [STRONG, WORTH_A_LOOK, ANOTHER_ROUTE] = QUIZ_RESULTS;

describe("Is a T-Level right for me? quiz", () => {
  it("has one radio group per question", () => {
    renderQuiz();
    expect(screen.getAllByRole("group")).toHaveLength(QUIZ_QUESTIONS.length);
  });

  it("will not give a result until every question is answered", async () => {
    const user = userEvent.setup({ delay: null });
    renderQuiz();

    await user.click(seeResult());

    expect(screen.getByRole("alert")).toHaveTextContent(
      `Answer all ${QUIZ_QUESTIONS.length} questions to see your result. You have done 0.`,
    );
    expect(screen.queryByText("Your result")).not.toBeInTheDocument();
  });

  it("counts answers as they are given", async () => {
    const user = userEvent.setup({ delay: null });
    renderQuiz();

    const firstGroup = screen.getAllByRole("group")[0];
    await user.click(within(firstGroup).getAllByRole("radio")[0]);

    expect(screen.getByText(`1 of ${QUIZ_QUESTIONS.length} answered`)).toBeInTheDocument();
  });

  // One test per result band, plus the scores either side of each boundary,
  // so a change to the scoring cannot quietly move people into the wrong band.
  //
  // NEW CONCEPT: it.each runs the same test once per row of the table, so six
  // cases need one test body instead of six copies.
  it.each([
    [[2, 2, 2, 2, 2, 2], STRONG.heading],
    [[2, 2, 2, 1, 1, 1], STRONG.heading], // 9, the lowest strong score
    [[2, 2, 1, 1, 1, 1], WORTH_A_LOOK.heading], // 8, just below it
    [[1, 1, 1, 1, 1, 0], WORTH_A_LOOK.heading], // 5, the lowest "worth a look"
    [[1, 1, 1, 1, 0, 0], ANOTHER_ROUTE.heading], // 4, just below it
    [[0, 0, 0, 0, 0, 0], ANOTHER_ROUTE.heading],
  ])("scores %j as %s", async (scores, expectedHeading) => {
    const user = userEvent.setup({ delay: null });
    renderQuiz();

    await answerAll(user, scores);
    await user.click(seeResult());

    expect(screen.getByRole("heading", { name: expectedHeading })).toBeInTheDocument();
  });

  it("moves focus to the result, so keyboard users land on it", async () => {
    const user = userEvent.setup({ delay: null });
    renderQuiz();

    await answerAll(user, [2, 2, 2, 2, 2, 2]);
    await user.click(seeResult());

    const heading = screen.getByRole("heading", { name: STRONG.heading });
    await waitFor(() => expect(heading.closest("article")).toHaveFocus());
  });

  it("clears everything with Start again", async () => {
    const user = userEvent.setup({ delay: null });
    renderQuiz();

    await answerAll(user, [2, 2, 2, 2, 2, 2]);
    await user.click(seeResult());
    await user.click(screen.getByRole("button", { name: "Start again" }));

    expect(screen.queryByText("Your result")).not.toBeInTheDocument();
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).not.toBeChecked();
    }
    expect(screen.getByText(`0 of ${QUIZ_QUESTIONS.length} answered`)).toBeInTheDocument();
  });
});
