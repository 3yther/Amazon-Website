import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import PathwaySwitcher from "../components/PathwaySwitcher.jsx";
import { PATHWAYS } from "../aboutContent.js";

// MemoryRouter because the switcher has a <Link>, which needs a router.
function renderSwitcher() {
  return render(
    <MemoryRouter>
      <PathwaySwitcher />
    </MemoryRouter>,
  );
}

function tab(pathway) {
  return screen.getByRole("tab", { name: pathway.name });
}

const first = PATHWAYS[0];
const second = PATHWAYS[1];
const last = PATHWAYS[PATHWAYS.length - 1];

describe("Pathway switcher", () => {
  it("shows one tab per pathway, with the first one selected", () => {
    renderSwitcher();

    expect(screen.getAllByRole("tab")).toHaveLength(PATHWAYS.length);
    expect(tab(first)).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: first.name })).toBeVisible();
  });

  it("lets Tab reach only the selected tab (roving tabindex)", () => {
    renderSwitcher();

    for (const pathway of PATHWAYS) {
      expect(tab(pathway)).toHaveAttribute("tabindex", pathway === first ? "0" : "-1");
    }
  });

  it("moves the selection and the focus with the arrow keys", async () => {
    const user = userEvent.setup({ delay: null });
    renderSwitcher();

    tab(first).focus();
    await user.keyboard("{ArrowRight}");

    expect(tab(second)).toHaveAttribute("aria-selected", "true");
    expect(tab(second)).toHaveFocus();
    expect(screen.getByRole("tabpanel", { name: second.name })).toBeVisible();

    await user.keyboard("{ArrowLeft}");
    expect(tab(first)).toHaveFocus();
  });

  it("wraps round at both ends, and supports Home and End", async () => {
    const user = userEvent.setup({ delay: null });
    renderSwitcher();

    tab(first).focus();
    await user.keyboard("{ArrowLeft}");
    expect(tab(last)).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(tab(first)).toHaveFocus();

    await user.keyboard("{End}");
    expect(tab(last)).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{Home}");
    expect(tab(first)).toHaveAttribute("aria-selected", "true");
  });

  it("selects a pathway when its tab is clicked", async () => {
    const user = userEvent.setup({ delay: null });
    renderSwitcher();

    await user.click(tab(last));

    expect(tab(last)).toHaveAttribute("aria-selected", "true");
    expect(tab(first)).toHaveAttribute("aria-selected", "false");
  });

  it("points every tab at a panel that exists", () => {
    // Guards an earlier bug: only the open panel was rendered, so four tabs
    // pointed their aria-controls at nothing.
    renderSwitcher();

    for (const pathway of PATHWAYS) {
      const panelId = tab(pathway).getAttribute("aria-controls");
      expect(document.getElementById(panelId)).toHaveAttribute("role", "tabpanel");
    }
  });

  it("only shows the Amazon status line where Amazon has said something public", async () => {
    const user = userEvent.setup({ delay: null });
    renderSwitcher();

    for (const pathway of PATHWAYS) {
      await user.click(tab(pathway));
      const panel = screen.getByRole("tabpanel", { name: pathway.name });

      if (pathway.amazonStatus) {
        expect(within(panel).getByText(pathway.amazonStatus)).toBeVisible();
      } else {
        expect(panel.querySelector(".pathways__status")).toBeNull();
      }
    }
  });
});
