import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Community from "../pages/Community.jsx";
import CommunityAsk from "../pages/CommunityAsk.jsx";
import CommunityQuestion from "../pages/CommunityQuestion.jsx";
import { expectNoAxeViolations } from "./axe.js";

// The Community pages with a fake user and API. The server rules are tested in backend/community/tests.py.

const api = vi.hoisted(() => {
  class ApiError extends Error {
    constructor(status, body) {
      super(`API ${status}`);
      this.status = status;
      this.body = body;
    }
  }
  return {
    ApiError,
    mockUseAuth: vi.fn(),
    getPathways: vi.fn(),
    getQuestions: vi.fn(),
    getQuestion: vi.fn(),
    askQuestion: vi.fn(),
    answerQuestion: vi.fn(),
    markHelpful: vi.fn(),
    acceptAnswer: vi.fn(),
    reportPost: vi.fn(),
    deleteQuestion: vi.fn(),
    deleteAnswer: vi.fn(),
  };
});

vi.mock("../auth.jsx", () => ({ useAuth: api.mockUseAuth }));
vi.mock("../api.js", () => ({
  ApiError: api.ApiError,
  getPathways: api.getPathways,
  getQuestions: api.getQuestions,
  getQuestion: api.getQuestion,
  askQuestion: api.askQuestion,
  answerQuestion: api.answerQuestion,
  markHelpful: api.markHelpful,
  acceptAnswer: api.acceptAnswer,
  reportPost: api.reportPost,
  deleteQuestion: api.deleteQuestion,
  deleteAnswer: api.deleteAnswer,
}));

const QUESTION = {
  id: 7,
  title: "What does a day on an Amazon placement look like?",
  body: "I start next year.",
  excerpt: "I start next year.",
  topic: "amazon",
  pathway: { name: "Digital", slug: "digital" },
  author: { username: "sam", role: "student" },
  created_at: "2026-09-24T10:00:00Z",
  answer_count: 1,
  helpful_count: 0,
  has_accepted: false,
  found_helpful: false,
  is_mine: false,
  hidden: false,
  answers: [
    {
      id: 3,
      body: "You join a team for nine weeks.",
      author: { username: "ana", role: "amazon_staff" },
      created_at: "2026-09-24T11:00:00Z",
      is_accepted: false,
      helpful_count: 2,
      found_helpful: false,
      is_mine: false,
      hidden: false,
    },
  ],
};

function signedIn(user = { username: "alex", user_type: "parent" }) {
  api.mockUseAuth.mockReturnValue({ user, checked: true });
}

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <main>
        <Routes>
          <Route path="/community" element={<Community />} />
          <Route path="/community/ask" element={<CommunityAsk />} />
          <Route path="/community/:id" element={<CommunityQuestion />} />
          <Route path="/login" element={<h1>Log in</h1>} />
        </Routes>
      </main>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  api.getPathways.mockResolvedValue([{ name: "Digital", slug: "digital" }]);
  api.getQuestions.mockResolvedValue({ count: 1, next: null, previous: null, results: [QUESTION] });
  api.getQuestion.mockResolvedValue(QUESTION);
});

describe("the Community list", () => {
  it("shows questions with their author's role, and passes axe", async () => {
    signedIn(null);
    const { container } = renderAt("/community");

    expect(await screen.findByRole("link", { name: QUESTION.title })).toBeInTheDocument();
    expect(screen.getByText("Student")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Log in to ask a question" })).toHaveAttribute("href", "/login");
    await expectNoAxeViolations(container);
  });
});

describe("a Community question", () => {
  it("lets a member mark an answer helpful, as a toggle button", async () => {
    signedIn();
    api.markHelpful.mockResolvedValue({ found_helpful: true, helpful_count: 3 });
    const user = userEvent.setup();
    const { container } = renderAt("/community/7");

    // The answer's button (the question has one too): its count is part of its name.
    const helpful = await screen.findByRole("button", { name: "Helpful 2" });
    expect(helpful).toHaveAttribute("aria-pressed", "false");
    await user.click(helpful);

    expect(api.markHelpful).toHaveBeenCalledWith("answers", 3);
    expect(await screen.findByRole("button", { name: "Helpful 3" })).toHaveAttribute("aria-pressed", "true");
    await expectNoAxeViolations(container);
  });

  it("explains why an answer was not published", async () => {
    signedIn();
    api.answerQuestion.mockRejectedValue(new api.ApiError(400, { moderation: ["personal_details"] }));
    const user = userEvent.setup();
    renderAt("/community/7");

    await user.type(await screen.findByLabelText("Your answer"), "text me on 07700 900123");
    await user.click(screen.getByRole("button", { name: "Post answer" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("personal details");
  });

  it("asks signed-out visitors to log in to answer", async () => {
    signedIn(null);
    renderAt("/community/7");
    expect(await screen.findByRole("link", { name: "Log in to answer" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Your answer")).not.toBeInTheDocument();
  });
});

describe("asking a question", () => {
  it("gives support numbers instead of publishing a worrying post", async () => {
    signedIn();
    api.askQuestion.mockRejectedValue(new api.ApiError(400, { moderation: ["wellbeing"] }));
    const user = userEvent.setup();
    const { container } = renderAt("/community/ask");

    await user.type(screen.getByLabelText("Your question"), "I don't want to be here any more");
    await user.click(screen.getByRole("button", { name: "Post question" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("0800 1111");
    expect(alert).toHaveTextContent("85258");
    await expectNoAxeViolations(container);
  });

  it("sends signed-out visitors to the login page", async () => {
    signedIn(null);
    renderAt("/community/ask");
    expect(await screen.findByRole("heading", { name: "Log in" })).toBeInTheDocument();
  });
});
