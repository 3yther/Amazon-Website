import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import NearYou, { checkPostcode, formatDistance } from "../pages/NearYou.jsx";
import { expectNoAxeViolations } from "./axe.js";

const PATHWAYS = [
  { name: "Digital", slug: "digital", summary: "s", description: "d" },
  { name: "Engineering", slug: "engineering", summary: "s", description: "d" },
];

const RESULTS = [
  {
    id: 1,
    name: "Barnet and Southgate College",
    address: "High Street, Southgate, London",
    postcode: "N14 6BS",
    distance_miles: 8,
    website_url: "https://www.barnetsouthgate.ac.uk",
    pathways: [
      { name: "Digital", slug: "digital" },
      { name: "Engineering", slug: "engineering" },
    ],
  },
  {
    id: 2,
    name: "Croydon College",
    address: "College Road, Croydon",
    postcode: "CR9 1DX",
    distance_miles: 9.9,
    website_url: "",
    pathways: [],
  },
];

/**
 * A fake server, as in ContentLibrary.test.jsx. `queries` records the query
 * string of each search, so tests can check what was sent. `search` decides
 * what comes back: a body, or { status, body } for a failure.
 */
function fakeServer({ search = { count: 2, radius_miles: 15, postcode: "W1D 3QU", results: RESULTS } } = {}) {
  const queries = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url) => {
      const address = new URL(url, "http://localhost");
      if (address.pathname === "/api/pathways/") return Response.json(PATHWAYS);
      if (address.pathname === "/api/providers/search/") {
        queries.push(address.searchParams);
        if (search instanceof Error) throw search;
        if (search.status) return Response.json(search.body, { status: search.status });
        return Response.json(search);
      }
      return Response.json({}, { status: 404 });
    }),
  );
  return queries;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderPage() {
  return render(
    <MemoryRouter>
      <main>
        <NearYou />
      </main>
    </MemoryRouter>,
  );
}

async function searchFor(user, postcode = "W1D 3QU") {
  await user.type(screen.getByLabelText("Postcode"), postcode);
  await user.click(screen.getByRole("button", { name: "Search" }));
}

describe("checkPostcode", () => {
  it("accepts the shapes a UK postcode comes in", () => {
    for (const postcode of ["SW1A 1AA", "n14 6bs", "M1 1AE", "B911SB", "  EX4 4JS  "]) {
      expect(checkPostcode(postcode), postcode).toBe("");
    }
  });

  it("asks for a postcode when the box is empty", () => {
    expect(checkPostcode("   ")).toBe("Enter a postcode.");
  });

  it("catches an obvious typo before anything is sent", () => {
    expect(checkPostcode("SW1A")).toMatch(/full UK postcode/);
    expect(checkPostcode("not a postcode")).toMatch(/full UK postcode/);
  });
});

describe("formatDistance", () => {
  it("writes one mile in the singular", () => {
    expect(formatDistance(1)).toBe("1 mile");
    expect(formatDistance(8.4)).toBe("8.4 miles");
    expect(formatDistance(0.4)).toBe("0.4 miles");
  });

  it("does not print a bare zero for a provider on the doorstep", () => {
    expect(formatDistance(0)).toBe("Under 0.1 miles");
  });
});

describe("T-Level Near You page", () => {
  it("invites a postcode before anything has been searched", async () => {
    fakeServer();
    renderPage();

    expect(screen.getByRole("status")).toHaveTextContent(
      "Enter a postcode to see providers near you.",
    );
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    // The pathway filter fills itself in from the API.
    expect(await screen.findByRole("option", { name: "Digital" })).toBeInTheDocument();
  });

  it("sends the postcode, pathway and radius, and lists what comes back", async () => {
    const queries = fakeServer();
    const user = userEvent.setup({ delay: null });
    renderPage();

    await screen.findByRole("option", { name: "Engineering" });
    await user.selectOptions(screen.getByLabelText("Pathway"), "engineering");
    await user.selectOptions(screen.getByLabelText("Within"), "25");
    await searchFor(user);

    await waitFor(() => expect(queries).toHaveLength(1));
    expect(queries[0].get("postcode")).toBe("W1D 3QU");
    expect(queries[0].get("pathway")).toBe("engineering");
    expect(queries[0].get("radius")).toBe("25");

    expect(
      await screen.findByRole("heading", { name: "Barnet and Southgate College", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "2 providers within 15 miles of W1D 3QU.",
    );
  });

  it("shows how far away each provider is, nearest first", async () => {
    fakeServer();
    const user = userEvent.setup({ delay: null });
    renderPage();

    await searchFor(user);

    await screen.findByText("8 miles");
    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings.map((heading) => heading.textContent)).toEqual([
      "Barnet and Southgate College",
      "Croydon College",
    ]);
    expect(screen.getByText("9.9 miles")).toBeInTheDocument();
  });

  it("links a provider to its own website, and leaves out a link it does not have", async () => {
    fakeServer();
    const user = userEvent.setup({ delay: null });
    renderPage();

    await searchFor(user);

    const links = await screen.findAllByRole("link", { name: /Visit website/ });
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "https://www.barnetsouthgate.ac.uk");
    // The name is in the link's accessible name, so "Visit website" is never
    // ambiguous when a screen reader lists the links on the page.
    expect(links[0]).toHaveAccessibleName("Visit website, Barnet and Southgate College");
  });

  it("says it is searching while it waits", async () => {
    // The search is held open, so the loading state can be looked at rather
    // than raced past: without this the answer arrives in the same tick.
    let answer;
    const held = new Promise((resolve) => {
      answer = resolve;
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url) => {
        const address = new URL(url, "http://localhost");
        if (address.pathname === "/api/pathways/") return Response.json(PATHWAYS);
        await held;
        return Response.json({
          count: 2,
          radius_miles: 15,
          postcode: "W1D 3QU",
          results: RESULTS,
        });
      }),
    );
    const user = userEvent.setup({ delay: null });
    renderPage();

    await searchFor(user);

    expect(screen.getByRole("status")).toHaveTextContent("Searching");
    expect(screen.getByRole("button", { name: "Searching" })).toBeDisabled();

    answer();
    await screen.findByText("8 miles");
    expect(screen.getByRole("button", { name: "Search" })).toBeEnabled();
  });

  it("suggests a wider radius when nothing is near", async () => {
    fakeServer({
      search: { count: 0, radius_miles: 5, postcode: "IV27 4HP", results: [] },
    });
    const user = userEvent.setup({ delay: null });
    renderPage();

    await searchFor(user, "IV27 4HP");

    expect(await screen.findByText(/No providers found within 5 miles of IV27 4HP/)).toHaveTextContent(
      "Try a wider radius.",
    );
    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
  });

  it("asks for a postcode rather than searching for nothing", async () => {
    const queries = fakeServer();
    const user = userEvent.setup({ delay: null });
    renderPage();

    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Enter a postcode.");
    expect(queries).toHaveLength(0);
    expect(screen.getByLabelText("Postcode")).toHaveFocus();
  });

  it("shows the server's message against the field when a postcode does not exist", async () => {
    fakeServer({
      search: {
        status: 400,
        body: { postcode: ['We could not find the postcode "ZZ99 9ZZ". Check it and try again.'] },
      },
    });
    const user = userEvent.setup({ delay: null });
    renderPage();

    await searchFor(user, "ZZ99 9ZZ");

    expect(await screen.findByRole("alert")).toHaveTextContent("We could not find the postcode");
    expect(screen.getByLabelText("Postcode")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Postcode")).toHaveFocus();
  });

  it("drops the last answer when a later search fails", async () => {
    // Otherwise the summary and cards for one postcode sit under an error
    // about a different one.
    let search = { count: 2, radius_miles: 15, postcode: "W1D 3QU", results: RESULTS };
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url) => {
        const address = new URL(url, "http://localhost");
        if (address.pathname === "/api/pathways/") return Response.json(PATHWAYS);
        if (search.status) return Response.json(search.body, { status: search.status });
        return Response.json(search);
      }),
    );
    const user = userEvent.setup({ delay: null });
    renderPage();

    await searchFor(user);
    await screen.findByText("8 miles");

    search = { status: 400, body: { postcode: ["We could not find the postcode."] } };
    await user.clear(screen.getByLabelText("Postcode"));
    await searchFor(user, "ZZ99 9ZZ");

    await screen.findByText("We could not find the postcode.");
    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Enter a postcode to see providers");
  });

  it("reports a failed search and tries again", async () => {
    const queries = fakeServer({ search: { status: 502, body: {} } });
    const user = userEvent.setup({ delay: null });
    renderPage();

    await searchFor(user);

    expect(await screen.findByText("Could not search for providers.")).toBeInTheDocument();
    // One explanation, not two: the notice is the only thing that speaks.
    expect(screen.getAllByRole("alert")).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => expect(queries.length).toBeGreaterThan(1));
  });

  it("says so when the server cannot be reached at all", async () => {
    fakeServer({ search: new TypeError("Failed to fetch") });
    const user = userEvent.setup({ delay: null });
    renderPage();

    await searchFor(user);

    expect(await screen.findByText(/Could not reach the server/)).toBeInTheDocument();
  });

  it("passes on the server's reason when the postcode lookup is down", async () => {
    // A 503 from /api/providers/search/ is not the visitor's fault and is
    // worth explaining, so its own message is shown rather than a shrug.
    fakeServer({
      search: {
        status: 503,
        body: { detail: "The postcode lookup service is unavailable right now." },
      },
    });
    const user = userEvent.setup({ delay: null });
    renderPage();

    await searchFor(user);

    expect(
      await screen.findByText("The postcode lookup service is unavailable right now."),
    ).toBeInTheDocument();
  });

  it("still searches when the pathway filter could not be loaded", async () => {
    // The pathways call 404s here, so the filter is empty. A postcode on its
    // own is still a search, and the page must not break.
    const queries = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url) => {
        const address = new URL(url, "http://localhost");
        if (address.pathname === "/api/providers/search/") {
          queries.push(address.searchParams);
          return Response.json({ count: 0, radius_miles: 15, postcode: "W1D 3QU", results: [] });
        }
        return Response.json({}, { status: 500 });
      }),
    );
    const user = userEvent.setup({ delay: null });
    renderPage();

    await searchFor(user);

    await waitFor(() => expect(queries).toHaveLength(1));
    expect(screen.getByLabelText("Pathway")).toHaveValue("");
  });

  it("has exactly one h1", async () => {
    fakeServer();
    renderPage();

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("has no WCAG 2.2 AA problems axe can find, before and after a search", async () => {
    fakeServer();
    const user = userEvent.setup({ delay: null });
    const { container } = renderPage();

    await screen.findByRole("option", { name: "Digital" });
    await expectNoAxeViolations(container);

    await searchFor(user);
    await screen.findByText("8 miles");
    await expectNoAxeViolations(container);
  });

  it("still passes axe with an error showing", async () => {
    fakeServer({ search: { status: 502, body: {} } });
    const user = userEvent.setup({ delay: null });
    const { container } = renderPage();

    await searchFor(user);
    await screen.findByText("Could not search for providers.");
    await expectNoAxeViolations(container);
  });
});
