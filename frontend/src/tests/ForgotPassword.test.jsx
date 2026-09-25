import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ForgotPassword from "../pages/ForgotPassword.jsx";

// Same fake-server approach as RegisterInterest.test.jsx and NearYou.test.jsx
// (see their top comments for why: isolate: false in vitest.config.js makes
// per-file api.js mocks fight over one shared module).
function fakeServer(replyStatus = 200) {
  const sent = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, options = {}) => {
      const address = new URL(url, "http://localhost");
      if (address.pathname === "/api/accounts/csrf/") {
        return Response.json({ csrf_token: "test-token" });
      }
      if (address.pathname === "/api/accounts/password-reset/") {
        sent.push(JSON.parse(options.body));
        return Response.json(
          { detail: "If that account has an email on file, we've sent password reset instructions to it." },
          { status: replyStatus },
        );
      }
      return Response.json({}, { status: 404 });
    }),
  );
  return sent;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/forgot-password"]}>
      <ForgotPassword />
    </MemoryRouter>,
  );
}

describe("Forgotten password", () => {
  it("sends the username that was typed", async () => {
    const sent = fakeServer();
    const user = userEvent.setup({ delay: null });
    renderPage();

    await user.type(screen.getByLabelText("Username"), "ada");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    await waitFor(() => expect(sent).toEqual([{ username: "ada" }]));
  });

  it("shows the same generic confirmation, never whether the username exists", async () => {
    fakeServer();
    const user = userEvent.setup({ delay: null });
    renderPage();

    await user.type(screen.getByLabelText("Username"), "somebody-or-nobody");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      /If that account has an email on file/,
    );
    expect(screen.queryByText(/not found/i)).not.toBeInTheDocument();
  });

  it("links back to login", () => {
    fakeServer();
    renderPage();
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
  });

  it("shows a server error rather than the confirmation on failure", async () => {
    fakeServer(500);
    const user = userEvent.setup({ delay: null });
    renderPage();

    await user.type(screen.getByLabelText("Username"), "ada");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/Something went wrong/);
  });
});
