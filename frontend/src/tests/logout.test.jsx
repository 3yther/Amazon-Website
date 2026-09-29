import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AccountSettings from "../components/accessibility/AccountSettings.jsx";
import { AuthProvider } from "../auth.jsx";

// Log out is on the Account tab of the settings page.
// Uses a fake fetch instead of vi.mock because the test files share modules (isolate: false).

const USER = {
  id: 1,
  username: "ada",
  user_type: "student",
  first_name: "Ada",
  last_name: "Lovelace",
  email: "",
  phone: "",
};

/** Records every request, and stops answering /me/ once logout has run. */
function fakeServer() {
  const calls = [];
  let signedIn = true;

  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, options = {}) => {
      const address = new URL(url, "http://localhost");
      calls.push({ path: address.pathname, method: options.method ?? "GET" });

      if (address.pathname === "/api/accounts/me/") {
        return signedIn ? Response.json(USER) : Response.json({}, { status: 401 });
      }
      if (address.pathname === "/api/accounts/csrf/") {
        return Response.json({ csrf_token: "test-token" });
      }
      if (address.pathname === "/api/accounts/logout/") {
        signedIn = false;
        return new Response(null, { status: 204 });
      }
      return Response.json({}, { status: 404 });
    }),
  );

  return calls;
}

function logoutCalls(calls) {
  return calls.filter((call) => call.path === "/api/accounts/logout/" && call.method === "POST");
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Logging out from the Account tab", () => {
  function renderTab() {
    return render(
      <MemoryRouter initialEntries={["/accessibility"]}>
        <AuthProvider>
          <Routes>
            <Route path="/accessibility" element={<AccountSettings />} />
            <Route path="/login" element={<h1>Login</h1>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );
  }

  it("ends the session and sends you to the login page", async () => {
    const calls = fakeServer();
    const user = userEvent.setup({ delay: null });
    renderTab();

    await user.click(await screen.findByRole("button", { name: "Log out" }));

    await waitFor(() => expect(logoutCalls(calls)).toHaveLength(1));
    expect(await screen.findByRole("heading", { name: "Login" })).toBeInTheDocument();
  });

  it("still signs you out when the session had already ended", async () => {
    // A 401 from the server means the session was gone anyway, so the person
    // should still end up signed out rather than stuck on an error.
    const calls = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url, options = {}) => {
        const address = new URL(url, "http://localhost");
        calls.push(address.pathname);
        if (address.pathname === "/api/accounts/csrf/") {
          return Response.json({ csrf_token: "test-token" });
        }
        if (address.pathname === "/api/accounts/me/") return Response.json(USER);
        return Response.json({}, { status: 401 });
      }),
    );
    const user = userEvent.setup({ delay: null });
    renderTab();

    await user.click(await screen.findByRole("button", { name: "Log out" }));

    expect(await screen.findByRole("heading", { name: "Login" })).toBeInTheDocument();
  });

  it("keeps logging out apart from deactivating", async () => {
    fakeServer();
    renderTab();

    // Its own section, and not inside the profile form: pressing it must not
    // read as saving what is typed above.
    const logout = await screen.findByRole("button", { name: "Log out" });
    expect(logout.closest("form")).toBeNull();
    expect(logout.closest(".danger-zone")).toBeNull();
    expect(logout.closest(".settings-block")).not.toBeNull();

    // Deactivating still asks for a password first; logging out does not.
    expect(screen.getByRole("button", { name: "Deactivate account" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("Deactivating", () => {
  function renderTab() {
    return render(
      <MemoryRouter initialEntries={["/accessibility"]}>
        <AuthProvider>
          <Routes>
            <Route path="/accessibility" element={<AccountSettings />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );
  }

  it("says what happens first, with Cancel focused, before asking for the password", async () => {
    fakeServer();
    const user = userEvent.setup({ delay: null });
    renderTab();

    await user.click(await screen.findByRole("button", { name: "Deactivate account" }));
    const dialog = screen.getByRole("dialog", { name: "Deactivate your account?" });
    expect(dialog).toHaveTextContent("You're signed out straight away.");
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus();
    expect(screen.queryByLabelText("Password")).toBeNull();

    await user.click(within(dialog).getByRole("button", { name: "Continue" }));
    expect(screen.getByLabelText(/Password/)).toBeInTheDocument();
  });

  it("closes on Escape without doing anything", async () => {
    const calls = fakeServer();
    const user = userEvent.setup({ delay: null });
    renderTab();

    await user.click(await screen.findByRole("button", { name: "Deactivate account" }));
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(calls.some((call) => call.path.includes("deactivate"))).toBe(false);
  });
});
