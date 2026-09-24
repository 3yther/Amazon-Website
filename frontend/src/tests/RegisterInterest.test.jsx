import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import RegisterInterest from "../pages/RegisterInterest.jsx";

// NEW CONCEPT: a fake server. vi.stubGlobal swaps the browser's fetch for a
// function we control, so the form's real code runs (CSRF token, POST, error
// handling) without a Django server. `sent` records what the form posted.
function fakeServer(interestReply) {
  const sent = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, options = {}) => {
      if (url.endsWith("/api/accounts/csrf/")) {
        return Response.json({ csrf_token: "test-token" });
      }
      if (url.endsWith("/api/interest/")) {
        sent.push(JSON.parse(options.body));
        return Response.json(interestReply.body, { status: interestReply.status });
      }
      return Response.json({}, { status: 404 });
    }),
  );
  return sent;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderForm(address = "/register-interest") {
  return render(
    <MemoryRouter initialEntries={[address]}>
      <RegisterInterest />
    </MemoryRouter>,
  );
}

async function fillIn(user) {
  await user.type(screen.getByLabelText("Full name"), "Ada Lovelace");
  await user.type(screen.getByLabelText("Email"), "ada@example.com");
  await user.selectOptions(screen.getByLabelText("I am a"), "student");
  await user.selectOptions(screen.getByLabelText("Pathway"), "digital");
  await user.click(screen.getByRole("checkbox"));
}

const send = () => screen.getByRole("button", { name: "Register interest" });

describe("Register interest form", () => {
  it("does not need an account", () => {
    renderForm();
    expect(screen.getByText(/You do not need an account/)).toBeInTheDocument();
  });

  it("will not send until the required fields are done", async () => {
    const sent = fakeServer({ status: 201, body: {} });
    const user = userEvent.setup({ delay: null });
    renderForm();

    await user.click(send());

    expect(sent).toHaveLength(0);
    expect(screen.getByText("Enter your full name.")).toBeInTheDocument();
    expect(screen.getByText("Choose a pathway.")).toBeInTheDocument();
    // Focus goes to the first problem, so keyboard users land on it.
    expect(screen.getByLabelText("Full name")).toHaveFocus();
  });

  it("needs the consent box ticked", async () => {
    const sent = fakeServer({ status: 201, body: {} });
    const user = userEvent.setup({ delay: null });
    renderForm();

    await fillIn(user);
    await user.click(screen.getByRole("checkbox")); // untick it again
    await user.click(send());

    expect(sent).toHaveLength(0);
    expect(screen.getByRole("checkbox")).toHaveFocus();
  });

  it("picks the pathway from the address, e.g. ?pathway=media", () => {
    renderForm("/register-interest?pathway=media");
    expect(screen.getByLabelText("Pathway")).toHaveValue("media");
  });

  it("ignores a pathway in the address that does not exist", () => {
    renderForm("/register-interest?pathway=nonsense");
    expect(screen.getByLabelText("Pathway")).toHaveValue("");
  });

  it("sends exactly the fields the API expects, then says thank you", async () => {
    const sent = fakeServer({ status: 201, body: { id: 1 } });
    const user = userEvent.setup({ delay: null });
    renderForm();

    await fillIn(user);
    await user.click(send());

    const thanks = await screen.findByRole("heading", { name: "Thanks, you are on the list" });
    expect(sent).toEqual([
      {
        full_name: "Ada Lovelace",
        email: "ada@example.com",
        user_type: "student",
        pathway: "digital",
        message: "",
      },
    ]);
    await waitFor(() => expect(thanks).toHaveFocus());
    expect(screen.getByText(/Digital pathway/)).toBeInTheDocument();
  });

  it("shows the server's error next to the right field", async () => {
    fakeServer({
      status: 400,
      body: { full_name: ["Use letters, spaces, hyphens or apostrophes only."] },
    });
    const user = userEvent.setup({ delay: null });
    renderForm();

    await fillIn(user);
    await user.click(send());

    expect(
      await screen.findByText("Use letters, spaces, hyphens or apostrophes only."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Full name")).toHaveAttribute("aria-invalid", "true");
  });
});
