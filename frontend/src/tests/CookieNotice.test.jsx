import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import CookieNotice from "../components/CookieNotice.jsx";
import { expectNoAxeViolations } from "./axe.js";

function renderNotice() {
  return render(
    <MemoryRouter>
      <CookieNotice />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("Cookie notice", () => {
  it("shows on a first visit with a link to the Cookie Policy", () => {
    renderNotice();
    expect(screen.getByRole("region", { name: "Cookies" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cookie Policy" })).toHaveAttribute("href", "/cookies");
  });

  it("goes away when you press OK, and stays away", async () => {
    const user = userEvent.setup({ delay: null });
    const { unmount } = renderNotice();

    await user.click(screen.getByRole("button", { name: "OK" }));
    expect(screen.queryByRole("region", { name: "Cookies" })).toBeNull();

    unmount();
    renderNotice();
    expect(screen.queryByRole("region", { name: "Cookies" })).toBeNull();
  });

  it("has no accessibility problems axe can find", async () => {
    const { container } = renderNotice();
    await expectNoAxeViolations(container);
  });
});
