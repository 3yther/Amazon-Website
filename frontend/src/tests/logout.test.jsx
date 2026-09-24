import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AccountDropdown from "../components/AccountDropdown.jsx";
import AccountSettings from "../components/accessibility/AccountSettings.jsx";
import { AuthProvider } from "../auth.jsx";

// Logging out moved out of the header's account menu and onto the Account tab
// of the settings page. These cover both ends of that move: that it is gone
// from the menu, and that the new control does exactly what the old one did.
//
// A fake server rather than a vi.mock of api.js, the same way
// RegisterInterest.test.jsx and NearYou.test.jsx work. vitest shares one
// module registry across these files (isolate: false in vitest.config.js), so
// two files mocking api.js differently end up fighting over which version is
// cached: whichever registered last wins, and the other file silently gets
// the wrong module. Stubbing fetch keeps everything real and asserts the
// request that actually goes out, which is the thing worth checking anyway.

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

describe("The header's account menu", () => {
  async function openMenu() {
    const user = userEvent.setup({ delay: null });
    render(
      <MemoryRouter>
        <AuthProvider>
          <AccountDropdown />
        </AuthProvider>
      </MemoryRouter>,
    );
    await user.click(await screen.findByRole("button", { name: /Account menu/ }));
    return user;
  }

  it("no longer offers Logout", async () => {
    fakeServer();
    await openMenu();

    expect(screen.queryByRole("menuitem", { name: /log ?out/i })).toBeNull();
    expect(screen.queryByText(/log ?out/i)).toBeNull();
  });

  it("still offers a way into Settings", async () => {
    fakeServer();
    await openMenu();

    expect(screen.getByRole("menuitem", { name: "Profile & Settings" })).toHaveAttribute(
      "href",
      "/accessibility",
    );
  });

  it("lists only the account links", async () => {
    fakeServer();
    await openMenu();

    expect(screen.getAllByRole("menuitem").map((item) => item.textContent)).toEqual([
      "Profile & Settings",
      "Security Settings",
      "Contact Us",
    ]);
  });
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
