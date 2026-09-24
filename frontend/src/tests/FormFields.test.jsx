import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TextField } from "../components/FormFields.jsx";

// The show/hide control lives in TextField, so every password field on the
// site (log in, sign up, change password) gets it from this one component.

describe("TextField password visibility toggle", () => {
  it("is not rendered for an ordinary text field", () => {
    render(<TextField id="username" label="Username" name="username" />);

    expect(screen.queryByRole("button", { name: /password/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toHaveAttribute("type", "text");
  });

  it("is not rendered for an email field", () => {
    render(<TextField id="email" label="Email" name="email" type="email" />);

    expect(screen.queryByRole("button", { name: /password/i })).not.toBeInTheDocument();
  });

  it("flips the input type and its own label when pressed", async () => {
    const user = userEvent.setup({ delay: null });
    render(<TextField id="password" label="Password" name="password" type="password" />);

    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");

    const toggle = screen.getByRole("button", { name: "Show password" });
    await user.click(toggle);

    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide password" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Hide password" }));

    expect(input).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Show password" })).toBeInTheDocument();
  });

  it("keeps what has been typed when it is pressed", async () => {
    const user = userEvent.setup({ delay: null });
    render(<TextField id="password" label="Password" name="password" type="password" />);

    const input = screen.getByLabelText("Password");
    await user.type(input, "harbour-lantern-47");
    await user.click(screen.getByRole("button", { name: "Show password" }));

    expect(input).toHaveValue("harbour-lantern-47");
  });

  it("is a plain button, so it never submits the form around it", async () => {
    const user = userEvent.setup({ delay: null });
    let submitted = false;
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitted = true;
        }}
      >
        <TextField id="password" label="Password" name="password" type="password" />
      </form>,
    );

    const toggle = screen.getByRole("button", { name: "Show password" });
    expect(toggle).toHaveAttribute("type", "button");

    await user.click(toggle);
    expect(submitted).toBe(false);
  });

  it("still wires up its hint and error for screen readers", () => {
    render(
      <TextField
        id="password"
        label="Password"
        name="password"
        type="password"
        hint="At least 8 characters."
        error="Too short."
      />,
    );

    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.getAttribute("aria-describedby")).toBe("password-hint password-error");
  });
});
