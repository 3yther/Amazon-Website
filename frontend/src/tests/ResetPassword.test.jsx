import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ResetPassword from "../pages/ResetPassword.jsx";
import { AuthProvider } from "../auth.jsx";

const USER = { id: 1, username: "ada", user_type: "student" };

/** Records every request. /confirm/ answers however the test asks it to. */
function fakeServer({ confirmStatus = 200, confirmBody = { success: true } } = {}) {
  const sent = [];
  let signedIn = false;

  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, options = {}) => {
      const address = new URL(url, "http://localhost");
      if (address.pathname === "/api/accounts/csrf/") {
        return Response.json({ csrf_token: "test-token" });
      }
      if (address.pathname === "/api/accounts/me/") {
        return signedIn ? Response.json(USER) : Response.json({}, { status: 401 });
      }
      if (address.pathname === "/api/accounts/password-reset/confirm/") {
        sent.push(JSON.parse(options.body));
        if (confirmStatus === 200) signedIn = true;
        return Response.json(confirmBody, { status: confirmStatus });
      }
      return Response.json({}, { status: 404 });
    }),
  );
  return sent;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderPage(path = "/reset-password?uid=dGVzdA&token=abc-123") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <ResetPassword />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("Reset password", () => {
  it("sends the uid and token from the URL along with the typed password", async () => {
    const sent = fakeServer();
    const user = userEvent.setup({ delay: null });
    renderPage();

    await user.type(screen.getByLabelText("New password"), "a-brand-new-password-9");
    await user.type(screen.getByLabelText("Confirm new password"), "a-brand-new-password-9");
    await user.click(screen.getByRole("button", { name: "Save new password" }));

    await waitFor(() =>
      expect(sent).toEqual([
        {
          uid: "dGVzdA",
          token: "abc-123",
          new_password: "a-brand-new-password-9",
          confirm_password: "a-brand-new-password-9",
        },
      ]),
    );
  });

  it("shows the server's error when the link is invalid or expired", async () => {
    fakeServer({
      confirmStatus: 400,
      confirmBody: { token: ["This password reset link is invalid or has expired. Request a new one."] },
    });
    const user = userEvent.setup({ delay: null });
    renderPage();

    await user.type(screen.getByLabelText("New password"), "a-brand-new-password-9");
    await user.type(screen.getByLabelText("Confirm new password"), "a-brand-new-password-9");
    await user.click(screen.getByRole("button", { name: "Save new password" }));

    expect(await screen.findByText(/invalid or has expired/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Request a new link" })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
  });

  it("offers a fresh link instead of a form when the URL has no uid or token", () => {
    fakeServer();
    renderPage("/reset-password");

    expect(screen.queryByLabelText("New password")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Request a new link" })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
  });
});
