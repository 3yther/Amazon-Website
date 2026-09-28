import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Register from "../pages/Register.jsx";
import { expectNoAxeViolations } from "./axe.js";

// Nobody is signed in on the Sign up page, so the auth context is stood in for.
vi.mock("../auth.jsx", () => ({ useAuth: () => ({ user: null, checked: true, refresh: vi.fn() }) }));

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

  it("points at the tick box rather than repeating a form here", async () => {
    // Registering interest needs an account now, and everyone reading this
    // page is signed out by definition, so the box signposts instead of
    // showing a form that could not be used.
    const user = userEvent.setup({ delay: null });
    renderPage();

    await user.click(summary());

    expect(summary().closest("details")).toHaveAttribute("open");
    expect(screen.getByRole("link", { name: "Go to Register your interest" })).toHaveAttribute(
      "href",
      "/register-interest",
    );
    expect(screen.queryByLabelText("Full name")).not.toBeInTheDocument();
  });

  it("has no accessibility problems with the box open", async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = renderPage();
    await user.click(summary());
    await expectNoAxeViolations(container);
  });
});
