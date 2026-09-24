import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TLevels from "../pages/TLevels.jsx";
import { T_LEVEL_ROUTES, T_LEVEL_SUBJECTS } from "../tlevelSubjects.js";

function renderPage() {
  return render(
    <MemoryRouter>
      <TLevels />
    </MemoryRouter>,
  );
}

describe("All T-Levels", () => {
  it("counts the 20 subjects running today, leaving out the two still to come", () => {
    expect(T_LEVEL_SUBJECTS).toHaveLength(20);
    expect(T_LEVEL_SUBJECTS).not.toContain("Social Care");
    expect(T_LEVEL_SUBJECTS).not.toContain("Sport");
  });

  it("gives every running subject an official page, and no subject two routes", () => {
    const names = T_LEVEL_ROUTES.flatMap((route) => route.subjects.map((subject) => subject.name));
    expect(new Set(names).size).toBe(names.length);
    for (const subject of T_LEVEL_ROUTES.flatMap((route) => route.subjects)) {
      expect(Boolean(subject.page) !== Boolean(subject.comingIn)).toBe(true);
    }
  });

  it("links each subject to tlevels.gov.uk and each pathway route to its resources", () => {
    renderPage();

    const digital = screen.getByRole("heading", { name: "Digital" }).closest("li");
    expect(within(digital).getByRole("link", { name: /Digital Software Development/ })).toHaveAttribute(
      "href",
      "https://www.tlevels.gov.uk/students/subjects/digital-software-development",
    );
    expect(within(digital).getByRole("link", { name: /Digital resources/ })).toHaveAttribute(
      "href",
      "/resources?pathway=digital",
    );
  });

  it("marks subjects that are coming or closing", () => {
    renderPage();
    expect(screen.getAllByText("Coming September 2028")).toHaveLength(2);
    expect(screen.getByText("Last enrolments September 2026")).toBeInTheDocument();
  });
});
