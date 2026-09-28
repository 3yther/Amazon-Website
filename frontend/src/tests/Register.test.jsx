import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Register from "../pages/Register.jsx";

// The sign-up form. <form noValidate> turns off the browser's own handling of
// `required`, so anything the form needs has to be checked in the code.

vi.mock("../auth.jsx", () => ({ useAuth: () => ({ user: null, checked: true, refresh: vi.fn() }) }));

function fakeServer() {
  const sent = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, options = {}) => {
      if (url.endsWith("/api/accounts/csrf/")) {
        return Response.json({ csrf_token: "test-token" });
      }
      if (url.endsWith("/api/accounts/register/")) {
        sent.push(JSON.parse(options.body ?? "{}"));
        return Response.json({ id: 1, username: "ada" }, { status: 201 });
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
    <MemoryRouter initialEntries={["/register"]}>
      <Register />
    </MemoryRouter>,
  );
}

/** Answer everything the form needs except the username. */
async function fillInExceptUsername(user) {
  await user.type(screen.getByLabelText("Password"), "harbour-lantern-47");
  await user.type(screen.getByLabelText("Confirm password"), "harbour-lantern-47");
  await user.selectOptions(screen.getByLabelText("Account type"), "student");
  await user.click(screen.getByLabelText("I confirm I am 16 or over."));
  await user.click(screen.getByLabelText(/I have read and agree to the/));
}

describe("Sign up: the username field", () => {
  it("states the rule up front", () => {
    fakeServer();
    renderPage();

    expect(screen.getByText("Letters, numbers and @ . + - _ only.")).toBeInTheDocument();
  });

  it("refuses an empty username without asking the server", async () => {
    const sent = fakeServer();
    const user = userEvent.setup({ delay: null });
    renderPage();

    await fillInExceptUsername(user);
    await user.click(screen.getByRole("button", { name: "Sign up" }));

    expect(await screen.findByText("Enter a username.")).toBeInTheDocument();
    expect(sent).toHaveLength(0);
    expect(screen.getByLabelText("Username")).toHaveFocus();
  });

  it("refuses spaces on their own too", async () => {
    // The one the report was about: the box looks filled in, and is not.
    const sent = fakeServer();
    const user = userEvent.setup({ delay: null });
    renderPage();

    await user.type(screen.getByLabelText("Username"), "   ");
    await fillInExceptUsername(user);
    await user.click(screen.getByRole("button", { name: "Sign up" }));

    expect(await screen.findByText("Enter a username.")).toBeInTheDocument();
    expect(sent).toHaveLength(0);
  });

  it("marks the field as invalid, not just the page", async () => {
    fakeServer();
    const user = userEvent.setup({ delay: null });
    renderPage();

    await fillInExceptUsername(user);
    await user.click(screen.getByRole("button", { name: "Sign up" }));

    await screen.findByText("Enter a username.");
    expect(screen.getByLabelText("Username")).toHaveAttribute("aria-invalid", "true");
  });

  it("sends the form once a real username is there", async () => {
    const sent = fakeServer();
    const user = userEvent.setup({ delay: null });
    renderPage();

    await user.type(screen.getByLabelText("Username"), "ada");
    await fillInExceptUsername(user);
    await user.click(screen.getByRole("button", { name: "Sign up" }));

    await waitFor(() => expect(sent).toHaveLength(1));
    expect(sent[0].username).toBe("ada");
  });
});

describe("Sign up: the password hint", () => {
  it("names every rule the server actually applies", () => {
    // AUTH_PASSWORD_VALIDATORS also has UserAttributeSimilarityValidator, which
    // the hint used to leave out, so a password like the username was refused
    // with no warning that it would be.
    fakeServer();
    renderPage();

    expect(
      screen.getByText(
        "At least 8 characters. Not all numbers, not a common password, and not too like your username.",
      ),
    ).toBeInTheDocument();
  });
});
