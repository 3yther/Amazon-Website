import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import StaffDashboard from "../pages/StaffDashboard.jsx";
import { expectNoAxeViolations } from "./axe.js";

// Fake staff user and API. The server's IsAmazonStaff check is tested in the backend.

const { mockUseAuth, mockGetInterestSubmissions } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockGetInterestSubmissions: vi.fn(),
}));

vi.mock("../auth.jsx", () => ({ useAuth: mockUseAuth }));
vi.mock("../api.js", () => ({ getInterestSubmissions: mockGetInterestSubmissions }));

const SUBMISSION = {
  id: 1,
  full_name: "Ada Lovelace",
  email: "ada@example.com",
  user_type: "student",
  pathway: "digital",
  message: "Please tell me more about the Digital pathway.",
  submitted_at: "2026-09-01T10:00:00Z",
};

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={["/staff"]}>
      <main>
        <Routes>
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/" element={<h1>Home</h1>} />
        </Routes>
      </main>
    </MemoryRouter>,
  );
}

function signedInAs(userType) {
  mockUseAuth.mockReturnValue({
    user: userType ? { username: "someone", user_type: userType } : null,
    checked: true,
  });
}

describe("Staff dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetInterestSubmissions.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [SUBMISSION],
    });
  });

  it("shows submissions to an Amazon staff account", async () => {
    signedInAs("amazon_staff");
    renderDashboard();

    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
    expect(screen.getByText("digital")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("writes the submitted date the UK way", async () => {
    signedInAs("amazon_staff");
    renderDashboard();
    expect(await screen.findByText("01/09/2026")).toBeInTheDocument();
  });

  it("writes a large count with UK separators", async () => {
    mockGetInterestSubmissions.mockResolvedValue({
      count: 1234,
      next: null,
      previous: null,
      results: [SUBMISSION],
    });

    signedInAs("amazon_staff");
    renderDashboard();
    expect(await screen.findByText(/1,234 submissions/)).toBeInTheDocument();
  });

  it("sends a signed-in student away instead of showing anything", () => {
    signedInAs("student");
    renderDashboard();

    expect(screen.getByRole("heading", { name: "Home" })).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    // It must not even ask the API for other people's details.
    expect(mockGetInterestSubmissions).not.toHaveBeenCalled();
  });

  it("sends a signed-out visitor away", () => {
    signedInAs(null);
    renderDashboard();

    expect(screen.getByRole("heading", { name: "Home" })).toBeInTheDocument();
    expect(mockGetInterestSubmissions).not.toHaveBeenCalled();
  });

  it("waits for the session check before deciding", () => {
    mockUseAuth.mockReturnValue({ user: null, checked: false });
    renderDashboard();

    // Neither the table nor the redirect: nothing has been decided yet.
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Home" })).not.toBeInTheDocument();
  });

  it("says so when the list is empty", async () => {
    signedInAs("amazon_staff");
    mockGetInterestSubmissions.mockResolvedValue({
      count: 0,
      next: null,
      previous: null,
      results: [],
    });
    renderDashboard();

    expect(await screen.findByText("No submissions yet.")).toBeInTheDocument();
  });

  it("shows an error rather than an empty table when the API fails", async () => {
    signedInAs("amazon_staff");
    mockGetInterestSubmissions.mockRejectedValue(new Error("403"));
    renderDashboard();

    expect(await screen.findByRole("alert")).toHaveTextContent(/could not load submissions/i);
  });

  it("has no WCAG 2.2 AA problems axe can find", async () => {
    signedInAs("amazon_staff");
    const { container } = renderDashboard();

    await screen.findByText("Ada Lovelace");
    await expectNoAxeViolations(container);
  });
});
