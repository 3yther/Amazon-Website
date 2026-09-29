import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Login from "../pages/Login.jsx";

// Logging in, and where it puts you afterwards. A page that needs an account
// sends people here with ?next=, so they carry on where they were.

vi.mock("../auth.jsx", () => ({
  useAuth: () => ({ user: null, checked: true, refresh: vi.fn() }),
}));

function fakeServer() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url) => {
      if (String(url).endsWith("/api/accounts/csrf/")) {
        return Response.json({ csrf_token: "test-token" });
      }
      if (String(url).endsWith("/api/accounts/login/")) {
        return Response.json({ id: 1, username: "staffer" });
      }
      return Response.json({}, { status: 404 });
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

/** The login page, with somewhere for each destination to land. */
function renderLogin(path = "/login") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<h1>Home</h1>} />
        <Route path="/admin-portal" element={<h1>Admin Portal</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function signIn(user) {
  await user.type(screen.getByLabelText("Username"), "staffer");
  await user.type(screen.getByLabelText("Password"), "harbour-lantern-47");
  await user.click(screen.getByRole("button", { name: "Log in" }));
}

describe("Login: where it sends you afterwards", () => {
  it("goes to the homepage when nothing asked for anywhere else", async () => {
    fakeServer();
    const user = userEvent.setup();
    renderLogin();

    await signIn(user);

    expect(await screen.findByRole("heading", { name: "Home" })).toBeInTheDocument();
  });

  it("goes back to the page that sent them here", async () => {
    fakeServer();
    const user = userEvent.setup();
    renderLogin("/login?next=%2Fadmin-portal");

    await signIn(user);

    expect(await screen.findByRole("heading", { name: "Admin Portal" })).toBeInTheDocument();
  });

  // ?next= comes off the URL, so anybody can put anything in it. Following an
  // address off this site would make a link to somewhere else look like it
  // belongs to us, so those go to the homepage like any other bad value.
  it.each([
    ["a protocol-relative address", "//elsewhere.example/phish"],
    ["a full URL", "https://elsewhere.example/phish"],
    ["a backslash address", "/\\elsewhere.example"],
    ["a bare path with no slash", "elsewhere.example"],
  ])("ignores %s", async (_name, next) => {
    fakeServer();
    const user = userEvent.setup();
    renderLogin(`/login?next=${encodeURIComponent(next)}`);

    await signIn(user);

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Home" })).toBeInTheDocument(),
    );
  });
});
