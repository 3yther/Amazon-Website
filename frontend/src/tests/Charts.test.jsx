import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Donut,
  DotMatrix,
  GroupedBars,
  LineChart,
  SegmentedBar,
  TileMap,
} from "../components/admin/Charts.jsx";
import { expectNoAxeViolations } from "./axe.js";

/**
 * The Admin Portal's charts.
 *
 * Every one of them makes the same promise, and it is the promise worth
 * testing hardest: THE PICTURE IS NEVER THE ONLY COPY OF THE NUMBERS. Each
 * chart carries a table built from the same array it is drawn from, so a
 * screen reader, a printout and a colour-blind reader all get the data rather
 * than an apology.
 */

const WEEKS = [
  { label: "2026-09-14", values: { student: 3, parent: 1, teacher: 0 } },
  { label: "2026-09-21", values: { student: 4, parent: 0, teacher: 2 } },
];
const SERIES = [
  { key: "student", label: "Student" },
  { key: "parent", label: "Parent" },
  { key: "teacher", label: "Teacher" },
];
const SPLIT = [
  { label: "Digital", value: 7 },
  { label: "Business", value: 3 },
];

/** Opens a chart's "Show the numbers" and hands back its table. */
async function openTable(user, section) {
  await user.click(within(section).getByText("Show the numbers"));
  return within(section).getByRole("table");
}

function sectionFor(name) {
  return screen.getByRole("heading", { name }).closest("section");
}

describe("every chart says the same thing in words", () => {
  it.each([
    [
      "SegmentedBar",
      <SegmentedBar key="s" title="Split" caption="Split" segments={SPLIT} />,
      "Digital",
      "7",
    ],
    [
      "TileMap",
      <TileMap key="t" title="Regions" caption="Regions" tiles={SPLIT} />,
      "Digital",
      "7",
    ],
    [
      "DotMatrix",
      <DotMatrix key="d" title="Activity" caption="Activity" rows={WEEKS} series={SERIES} />,
      "Student",
      "4",
    ],
  ])("%s", async (_name, element, rowName, value) => {
    const user = userEvent.setup({ delay: null });
    render(element);
    const section = screen.getByRole("heading").closest("section");

    const table = await openTable(user, section);

    expect(within(table).getAllByText(new RegExp(rowName)).length).toBeGreaterThan(0);
    expect(within(table).getAllByText(value).length).toBeGreaterThan(0);
  });
});

describe("empty and single-point data", () => {
  it.each([
    ["SegmentedBar", <SegmentedBar key="s" title="Split" caption="c" segments={[]} />],
    ["TileMap", <TileMap key="t" title="Regions" caption="c" tiles={[]} />],
    ["DotMatrix", <DotMatrix key="d" title="Activity" caption="c" rows={[]} series={SERIES} />],
    ["LineChart", <LineChart key="l" title="Line" caption="c" rows={[]} series={SERIES} />],
  ])("%s says there is nothing rather than drawing nothing", (_name, element) => {
    render(element);

    expect(screen.getByText("Nothing to show yet.")).toBeInTheDocument();
  });

  it.each([
    ["SegmentedBar", <SegmentedBar key="s" title="Split" caption="c" segments={[SPLIT[0]]} />],
    ["TileMap", <TileMap key="t" title="Regions" caption="c" tiles={[SPLIT[0]]} />],
    [
      "DotMatrix",
      <DotMatrix key="d" title="Activity" caption="c" rows={[WEEKS[0]]} series={SERIES} />,
    ],
  ])("%s survives a single point", (_name, element) => {
    render(element);

    expect(screen.getByRole("heading")).toBeInTheDocument();
    expect(screen.queryByText("Nothing to show yet.")).not.toBeInTheDocument();
  });

  it("a line needs two points to be a line, and says so with one", () => {
    // One point is not a trend. Drawing a dot and calling it a chart is worse
    // than saying there is not enough yet.
    render(<LineChart title="Line" caption="c" rows={[WEEKS[0]]} series={SERIES} />);

    expect(screen.getByText("Nothing to show yet.")).toBeInTheDocument();
  });
});

describe("the ring's centre figure", () => {
  it("shows the share and its label", () => {
    render(
      <Donut
        title="Answer rate"
        caption="c"
        segments={SPLIT}
        centre={{ value: "70%", label: "answered" }}
      />,
    );

    // Scoped to the ring: the legend says 70% too, which is the point.
    const ring = document.querySelector(".admin-donut__ring");
    expect(within(ring).getByText("70%")).toBeInTheDocument();
    expect(within(ring).getByText("answered")).toBeInTheDocument();
  });

  it("falls back to the plain total when no share is given", () => {
    render(<Donut title="Split" caption="c" segments={SPLIT} />);

    expect(screen.getByText("10")).toBeInTheDocument();
  });
});

describe("reading a point off a chart", () => {
  function renderLine() {
    render(<LineChart title="Sign-ups" caption="c" rows={WEEKS} series={SERIES} />);
    return screen.getByRole("group", { name: /Sign-ups/ });
  }

  it("is one tab stop, not one per point", async () => {
    // A year of daily sign-ups would otherwise put 365 stops between the
    // chart and whatever follows it.
    const user = userEvent.setup({ delay: null });
    const plot = renderLine();

    await user.tab();

    expect(plot).toHaveFocus();
  });

  it("moves along the points with the arrow keys", async () => {
    const user = userEvent.setup({ delay: null });
    const plot = renderLine();
    plot.focus();

    await user.keyboard("{ArrowRight}");

    // Announced as a sentence, not as a hover-only popup.
    expect(screen.getByRole("status")).toHaveTextContent("09-14");
    expect(screen.getByRole("status")).toHaveTextContent("Student: 3");

    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("status")).toHaveTextContent("09-21");
    expect(screen.getByRole("status")).toHaveTextContent("Teacher: 2");
  });

  it("jumps to either end with Home and End", async () => {
    const user = userEvent.setup({ delay: null });
    const plot = renderLine();
    plot.focus();

    await user.keyboard("{End}");
    expect(screen.getByRole("status")).toHaveTextContent("09-21");

    await user.keyboard("{Home}");
    expect(screen.getByRole("status")).toHaveTextContent("09-14");
  });

  it("stops at the ends rather than wrapping round", async () => {
    const user = userEvent.setup({ delay: null });
    const plot = renderLine();
    plot.focus();

    await user.keyboard("{Home}{ArrowLeft}{ArrowLeft}");

    expect(screen.getByRole("status")).toHaveTextContent("09-14");
  });

  it("clears on Escape", async () => {
    const user = userEvent.setup({ delay: null });
    const plot = renderLine();
    plot.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("status")).not.toBeEmptyDOMElement();

    await user.keyboard("{Escape}");

    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("never traps focus: Tab still leaves", async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <>
        <LineChart title="Sign-ups" caption="c" rows={WEEKS} series={SERIES} />
        <button type="button">After</button>
      </>,
    );
    const plot = screen.getByRole("group", { name: /Sign-ups/ });
    plot.focus();
    await user.keyboard("{ArrowRight}");

    await user.tab();

    // Focus leaves the plot. The very next stop is the chart's own "Show the
    // numbers" summary, which is correct, so what matters is that focus is
    // out of the plot and moving on rather than stuck cycling inside it.
    expect(plot.contains(document.activeElement)).toBe(false);
    expect(plot).not.toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
  });

  it("keeps a live region on the page even with nothing selected", async () => {
    // A live region added at the moment its content changes is frequently
    // not announced at all, so it has to be there from the start.
    renderLine();

    const live = screen.getByRole("status");
    expect(live).toBeInTheDocument();
    expect(live).toHaveAttribute("aria-live", "polite");
  });

  it("works on the bar chart too", async () => {
    const user = userEvent.setup({ delay: null });
    render(<GroupedBars title="Community" caption="c" rows={WEEKS} series={SERIES} />);
    screen.getByRole("group", { name: /Community/ }).focus();

    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("status")).toHaveTextContent("Student: 3");
  });
});

describe("accessibility", () => {
  it.each([
    ["SegmentedBar", <SegmentedBar key="s" title="Split" caption="c" segments={SPLIT} />],
    ["TileMap", <TileMap key="t" title="Regions" caption="c" tiles={SPLIT} />],
    [
      "DotMatrix",
      <DotMatrix key="d" title="Activity" caption="c" rows={WEEKS} series={SERIES} />,
    ],
    ["LineChart", <LineChart key="l" title="Line" caption="c" rows={WEEKS} series={SERIES} />],
    [
      "Donut with a centre",
      <Donut key="o" title="Ring" caption="c" segments={SPLIT} centre={{ value: "70%", label: "answered" }} />,
    ],
  ])("%s has no WCAG 2.2 AA problems", async (_name, element) => {
    const { container } = render(element);

    await expectNoAxeViolations(container);
  });

  it("each dot row is summarised rather than read out dot by dot", () => {
    render(<DotMatrix title="Activity" caption="c" rows={WEEKS} series={SERIES} />);

    expect(
      screen.getByRole("img", { name: "Student: 7 across 2 periods" }),
    ).toBeInTheDocument();
  });
});
