import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import RegisterInterest from "../pages/RegisterInterest.jsx";
import { expectNoAxeViolations } from "./axe.js";

// Registering interest is one tick box now. It used to be a six field form
// asking for a name, email, role and pathway the site already held, which is
// what these tests used to drive.

const SIGNED_IN = { user: { id: 1, username: "ada" }, checked: true, refresh: vi.fn() };
const SIGNED_OUT = { user: null, checked: true, refresh: vi.fn() };

let auth = SIGNED_IN;
vi.mock("../auth.jsx", () => ({ useAuth: () => auth }));

// vi.stubGlobal swaps fetch for a fake server, so the real page code runs
// without Django. `sent` records each POST body.
function fakeServer(reply = { status: 201, body: { id: 1, pathway: "digital" } }) {
  const sent = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, options = {}) => {
      if (url.endsWith("/api/accounts/csrf/")) {
        return Response.json({ csrf_token: "test-token" });
      }
      if (url.endsWith("/api/interest/")) {
        sent.push(JSON.parse(options.body ?? "{}"));
        return Response.json(reply.body, { status: reply.status });
      }
      return Response.json({}, { status: 404 });
    }),
  );
  return sent;
}

afterEach(() => {
  auth = SIGNED_IN;
  vi.unstubAllGlobals();
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/register-interest"]}>
      <RegisterInterest />
    </MemoryRouter>,
  );
}

const tickBox = () => screen.getByLabelText("I'm interested in an Amazon placement");
const submit = () => screen.getByRole("button", { name: "Register interest" });

describe("Register your interest", () => {
  it("asks one question, not six", () => {
    fakeServer();
    renderPage();

    expect(tickBox()).toBeInTheDocument();
    for (const gone of ["Full name", "Email", "I am a", "Pathway"]) {
      expect(screen.queryByLabelText(gone)).not.toBeInTheDocument();
    }
  });

  it("says it will use what the account already holds", () => {
    fakeServer();
    renderPage();

    expect(
      screen.getByText("We send the name, email and pathway already on your account."),
    ).toBeInTheDocument();
  });

  it("sends nothing but the tick, then says thank you", async () => {
    const sent = fakeServer();
    const user = userEvent.setup({ delay: null });
    renderPage();

    await user.click(tickBox());
    await user.click(submit());

    await waitFor(() => expect(sent).toHaveLength(1));
    // No personal details in the body: the server reads them off the account.
    expect(sent[0]).toEqual({});
    expect(await screen.findByRole("heading", { name: "Thanks, you are on the list" })).toHaveFocus();
  });

  it("names the pathway the server recorded", async () => {
    fakeServer({ status: 201, body: { id: 1, pathway: "digital" } });
    const user = userEvent.setup({ delay: null });
    renderPage();

    await user.click(tickBox());
    await user.click(submit());

    expect(await screen.findByText(/interest in the Digital pathway has been sent/)).toBeInTheDocument();
  });

  it("still thanks someone whose account has no pathway", async () => {
    // pathway_interest is optional at sign-up, so this is ordinary.
    fakeServer({ status: 201, body: { id: 1, pathway: null } });
    const user = userEvent.setup({ delay: null });
    renderPage();

    await user.click(tickBox());
    await user.click(submit());

    expect(
      await screen.findByText("Your interest has been sent to the Amazon Emerging Talent team."),
    ).toBeInTheDocument();
  });

  it("will not send an unticked box", async () => {
    const sent = fakeServer();
    const user = userEvent.setup({ delay: null });
    renderPage();

    await user.click(submit());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Tick the box to register your interest.",
    );
    expect(sent).toHaveLength(0);
    expect(tickBox()).toHaveFocus();
  });

  it("reports a server error rather than pretending it sent", async () => {
    fakeServer({ status: 500, body: {} });
    const user = userEvent.setup({ delay: null });
    renderPage();

    await user.click(tickBox());
    await user.click(submit());

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Thanks, you are on the list" })).not.toBeInTheDocument();
  });

  describe("signed out", () => {
    it("asks for an account instead of the fields back", async () => {
      auth = SIGNED_OUT;
      fakeServer();
      renderPage();

      expect(
        screen.getByText("This one needs an account, so we do not ask you for details the site already holds."),
      ).toBeInTheDocument();
      expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
      expect(screen.getByRole("link", { name: "Create your account" })).toHaveAttribute(
        "href",
        "/register",
      );
    });

    it("never reads as a requirement to use the site", async () => {
      auth = SIGNED_OUT;
      fakeServer();
      renderPage();

      expect(
        screen.getByText("It is optional. Everything else on the site works without it."),
      ).toBeInTheDocument();
    });
  });

  it("has exactly one h1", () => {
    fakeServer();
    renderPage();

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("has no WCAG 2.2 AA problems axe can find, ticked and thanked", async () => {
    fakeServer();
    const user = userEvent.setup({ delay: null });
    const { container } = renderPage();

    await expectNoAxeViolations(container);

    await user.click(tickBox());
    await user.click(submit());
    await screen.findByRole("heading", { name: "Thanks, you are on the list" });
    await expectNoAxeViolations(container);
  });
});
