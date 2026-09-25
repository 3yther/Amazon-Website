import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Register from "../pages/Register.jsx";
import { expectNoAxeViolations } from "./axe.js";

// Nobody is signed in on the Sign up page, so the auth context is stood in for.
vi.mock("../auth.jsx", () => ({ useAuth: () => ({ user: null, refresh: vi.fn() }) }));

// A fake server, as in RegisterInterest.test.jsx. `sent` records what the
// box's form posted to /api/interest/.
function fakeServer() {
  const sent = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, options = {}) => {
      if (url.endsWith("/api/accounts/csrf/")) return Response.json({ csrf_token: "test-token" });
      if (url.endsWith("/api/interest/")) {
        sent.push(JSON.parse(options.body));
        return Response.json({}, { status: 201 });
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

const summary = () => screen.getByText("Want an Amazon placement? Register your interest");

describe("Register interest box on the Sign up page", () => {
  it("starts closed, so the sign-up form comes first", () => {
    renderPage();
    expect(summary().closest("details")).not.toHaveAttribute("open");
  });

  it("opens to the interest form and sends it without an account", async () => {
    const sent = fakeServer();
    const user = userEvent.setup({ delay: null });
    renderPage();

    await user.click(summary());
    expect(summary().closest("details")).toHaveAttribute("open");

    await user.type(screen.getByLabelText("Full name"), "Ada Lovelace");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.selectOptions(screen.getByLabelText("I am a"), "student");
    await user.selectOptions(screen.getByLabelText("Pathway"), "digital");
    await user.click(screen.getByLabelText(/Amazon Emerging Talent team to see these details/));
    await user.click(screen.getByRole("button", { name: "Register interest" }));

    await waitFor(() => expect(sent).toHaveLength(1));
    expect(sent[0]).toMatchObject({ full_name: "Ada Lovelace", pathway: "digital" });
    expect(await screen.findByText(/interest in the Digital pathway has been sent/)).toHaveFocus();
  });

  it("has no accessibility problems with the box open", async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = renderPage();
    await user.click(summary());
    await expectNoAxeViolations(container);
  });
});
