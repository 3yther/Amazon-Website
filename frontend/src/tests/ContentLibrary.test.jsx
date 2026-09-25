import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ContentLibrary, { siteName } from "../pages/ContentLibrary.jsx";
import { expectNoAxeViolations } from "./axe.js";

const PATHWAYS = [
  { name: "Digital", slug: "digital", summary: "s", description: "d" },
  { name: "Business", slug: "business", summary: "s", description: "d" },
];

const ITEMS = [
  {
    title: "Find a T-Level near you",
    slug: "find-a-t-level-near-you",
    description: "Official search.",
    content_type: "guide",
    access_level: "free",
    pathway: null,
    audience: "all",
    file: null,
    link: "https://www.tlevels.gov.uk/students/find",
    locked: false,
    created_at: "2026-09-24T09:00:00Z",
  },
  {
    title: "Digital prep pack",
    slug: "digital-prep-pack",
    description: "For signed-in students.",
    content_type: "prep_pack",
    access_level: "signup",
    pathway: { name: "Digital", slug: "digital" },
    audience: "student",
    file: null,
    link: null,
    locked: true,
    created_at: "2026-09-24T08:59:00Z",
  },
];

// A fake server, as in RegisterInterest.test.jsx. `queries` records the query
// string of each content request, so tests can check the filters sent.
function fakeServer({ contentStatus = 200 } = {}) {
  const queries = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url) => {
      const address = new URL(url, "http://localhost");
      if (address.pathname === "/api/pathways/") return Response.json(PATHWAYS);
      if (address.pathname === "/api/content/") {
        queries.push(address.searchParams);
        if (contentStatus !== 200) return Response.json({}, { status: contentStatus });
        return Response.json({ count: 2, next: null, previous: null, results: ITEMS });
      }
      return Response.json({}, { status: 404 });
    }),
  );
  return queries;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderPage(address = "/resources") {
  return render(
    <MemoryRouter initialEntries={[address]}>
      <ContentLibrary />
    </MemoryRouter>,
  );
}

describe("siteName", () => {
  it("shortens every gov.uk address to gov.uk", () => {
    expect(siteName("https://www.tlevels.gov.uk/students/find")).toBe("gov.uk");
    expect(siteName("https://assets.publishing.service.gov.uk/media/a.pdf")).toBe("gov.uk");
    expect(siteName("https://occupational-maps.skillsengland.education.gov.uk")).toBe("gov.uk");
  });

  it("drops www. and keeps other hosts as they are", () => {
    expect(siteName("https://www.ucas.com/t-levels")).toBe("ucas.com");
    expect(siteName("https://tlevelinfo.org.uk/")).toBe("tlevelinfo.org.uk");
  });

  it("returns null for text that is not a link", () => {
    expect(siteName("not a link")).toBeNull();
  });
});

describe("Resources page", () => {
  it("links a free item to its site", async () => {
    fakeServer();
    renderPage();

    const open = await screen.findByRole("link", { name: /Open on gov.uk/ });
    expect(open).toHaveAttribute("href", "https://www.tlevels.gov.uk/students/find");
    expect(screen.getByRole("status")).toHaveTextContent("2 items");
  });

  it("asks visitors to sign up for a locked item", async () => {
    fakeServer();
    renderPage();

    const signUp = await screen.findByRole("link", { name: "Sign up to access" });
    expect(signUp).toHaveAttribute("href", "/register");
    expect(screen.getAllByRole("link", { name: /^Open/ })).toHaveLength(1);
  });

  it("sends the chosen pathway to the server", async () => {
    const queries = fakeServer();
    const user = userEvent.setup({ delay: null });
    renderPage();

    await screen.findByRole("option", { name: "Digital" });
    await user.selectOptions(screen.getByLabelText("Pathway"), "digital");

    await waitFor(() => expect(queries.at(-1).get("pathway")).toBe("digital"));
  });

  it("uses the pathway in the address on the first request", async () => {
    const queries = fakeServer();
    renderPage("/resources?pathway=digital");

    await screen.findByText("2 items");
    expect(queries[0].get("pathway")).toBe("digital");
  });

  it("reports a failed load and tries again", async () => {
    const queries = fakeServer({ contentStatus: 502 });
    const user = userEvent.setup({ delay: null });
    renderPage();

    expect(await screen.findByText("Could not load content.")).toBeInTheDocument();
    const before = queries.length;
    await user.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => expect(queries.length).toBeGreaterThan(before));
  });

  it("has no accessibility problems", async () => {
    fakeServer();
    const { container } = renderPage();

    await screen.findByText("2 items");
    await expectNoAxeViolations(container);
  });
});
