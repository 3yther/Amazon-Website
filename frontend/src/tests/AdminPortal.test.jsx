import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useSearchParams } from "react-router-dom";
import AdminPortal from "../pages/AdminPortal.jsx";
import { expectNoAxeViolations } from "./axe.js";

// The Admin Portal. Two gates, and they are not the same gate: being staff is
// the real one and the server enforces it, while the PIN is a screen-lock on
// top. These tests are about the page honouring both, and about the two
// irreversible actions asking first.

const STAFF = { id: 1, username: "staffer", user_type: "amazon_staff" };
const STUDENT = { id: 2, username: "ada", user_type: "student" };

let auth = { user: STAFF, checked: true, refresh: vi.fn() };
vi.mock("../auth.jsx", () => ({ useAuth: () => auth }));

const OVERVIEW = {
  weeks: 8,
  signups: [{ label: "2026-09-21", values: { student: 4, parent: 1, teacher: 0 } }],
  interest_by_pathway: [
    { label: "Digital", value: 7 },
    { label: "Business", value: 3 },
  ],
  community_activity: [{ label: "2026-09-21", values: { questions: 2, answers: 5 } }],
  feedback_by_category: [
    { label: "bug", value: 2 },
    { label: "feature", value: 1 },
    { label: "general", value: 0 },
    { label: "accessibility", value: 0 },
  ],
  totals: { people: 40, interest: 10, questions: 12, answers: 17, feedback: 3, open_reports: 2 },
};

const REPORT = {
  id: 9,
  kind: "question",
  post_id: 3,
  title: "A reported question",
  body: "Some detail.",
  author: "ada",
  hidden: false,
  reason: "unkind",
  note: "",
  reporter: "bruce",
  resolved: false,
  created_at: "2026-09-20T10:00:00Z",
};

const PERSON = {
  id: 2,
  username: "ada",
  user_type: "student",
  date_joined: "2026-09-01T10:00:00Z",
  is_active: true,
  questions: 1,
  answers: 2,
};

/** The KPI cards, as the dashboard endpoint sends them. */
const DASHBOARD = {
  range: { preset: "30d", from: "2026-08-30", to: "2026-09-29" },
  kpis: [
    { key: "accounts", value: 40, unit: "count", spark: [1, 2, 3], previous: 32, change: 8, percent: 25 },
    { key: "signups", value: 8, unit: "count", spark: [1, 2, 5], previous: 4, change: 4, percent: 100 },
    // A card with nothing before it: the page must say so, not divide by zero.
    { key: "active", value: 6, unit: "count", spark: [], previous: 0, change: 6, percent: null },
    { key: "interest", value: 10, unit: "count", spark: [], previous: 10, change: 0, percent: 0 },
    { key: "questions", value: 3, unit: "count", spark: [], previous: 1, change: 2, percent: 200 },
    { key: "answers", value: 5, unit: "count", spark: [], previous: 5, change: 0, percent: 0 },
    { key: "unanswered", value: 1, unit: "count", spark: [], previous: 2, change: -1, percent: -50 },
    { key: "feedback", value: 4, unit: "count", spark: [], previous: 2, change: 2, percent: 100 },
    { key: "open_reports", value: 2, unit: "count", spark: [], previous: 1, change: 1, percent: 100 },
    {
      key: "time_to_first_answer",
      value: 3.5,
      unit: "hours",
      spark: [],
      previous: 5,
      change: -1.5,
      percent: -30,
      lower_is_better: true,
    },
  ],
};

const DASHBOARD_CHARTS = {
  range: { preset: "30d", from: "2026-08-30", to: "2026-09-29" },
  signups_over_time: [
    { label: "2026-09-14", values: { student: 3, parent: 1, teacher: 0 } },
    { label: "2026-09-21", values: { student: 4, parent: 0, teacher: 1 } },
  ],
  users_by_type: [
    { label: "student", value: 30 },
    { label: "parent", value: 6 },
    { label: "teacher", value: 3 },
    { label: "amazon_staff", value: 1 },
  ],
  interest_by_pathway: [
    { label: "Digital", value: 7 },
    { label: "Business", value: 3 },
  ],
  community_activity: [{ label: "2026-09-21", values: { questions: 2, answers: 5 } }],
  answer_rate: [
    { label: "Answered", value: 2 },
    { label: "Still waiting", value: 1 },
  ],
  active_topics: [{ label: "tlevels", value: 4 }],
  feedback_over_time: [
    { label: "2026-09-14", values: { bug: 1, feature: 0, general: 2, accessibility: 0 } },
    { label: "2026-09-21", values: { bug: 0, feature: 1, general: 1, accessibility: 1 } },
  ],
  reports_activity: [{ label: "2026-09-21", values: { opened: 2, resolved: 1 } }],
  languages: [
    { label: "en", value: 38 },
    { label: "pl", value: 2 },
  ],
  provider_coverage: [{ label: "North West", values: { placed: 12, unplaced: 2 } }],
};

const FEEDBACK_ROWS = [
  {
    id: 9,
    category: "bug",
    message: "The map does not load",
    email: "",
    username: "ada",
    created_at: "2026-09-20T10:00:00Z",
    handled: false,
    handled_by: "",
    handled_at: null,
    admin_note: "",
  },
  {
    id: 10,
    category: "general",
    message: "Lovely site",
    email: "",
    username: "tom",
    created_at: "2026-09-19T10:00:00Z",
    handled: true,
    handled_by: "otherstaff",
    handled_at: "2026-09-21T10:00:00Z",
    admin_note: "said thanks",
  },
];

const POST = {
  kind: "question",
  id: 5,
  title: "Which pathway should I pick?",
  body: "Torn between two.",
  author: "ada",
  hidden: false,
  answers: 2,
  created_at: "2026-09-20T10:00:00Z",
};

const OTHER_ADMIN = { ...PERSON, id: 3, username: "otheradmin", user_type: "amazon_staff" };

/** A fake server. `unlocked` decides whether the portal opens. */
function fakeServer({ unlocked = true, configured = true, wrongPin = false, people = [PERSON] } = {}) {
  const calls = [];
  let open = unlocked;
  let unhandledFeedback = 3;

  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, options = {}) => {
      const path = new URL(url, "http://localhost").pathname;
      calls.push({ path, method: options.method ?? "GET" });

      if (path.endsWith("/api/accounts/csrf/")) return Response.json({ csrf_token: "t" });
      if (path.endsWith("/admin-portal/status/")) {
        return Response.json({ unlocked: open, configured, minutes: 30 });
      }
      if (path.endsWith("/admin-portal/unlock/")) {
        if (wrongPin) return Response.json({ pin: ["That PIN is not right."] }, { status: 400 });
        open = true;
        return Response.json({ unlocked: true });
      }
      if (path.endsWith("/admin-portal/overview/")) return Response.json(OVERVIEW);
      if (path.endsWith("/admin-portal/dashboard/")) return Response.json(DASHBOARD);
      if (path.endsWith("/admin-portal/dashboard/charts/")) return Response.json(DASHBOARD_CHARTS);
      // The list first: an action path contains the list path, so matching
      // the action loosely would swallow the list too.
      if (path.endsWith("/api/community/admin-portal/reports/")) {
        return Response.json({ count: 1, next: null, previous: null, results: [REPORT] });
      }
      if (path.includes("/admin-portal/reports/")) return Response.json({ ok: true });
      if (path.includes("/remove/")) return Response.json({ id: 2, deleted: true });
      if (path.includes("/revoke-staff/")) return Response.json({ id: 3, user_type: "student" });
      if (path.endsWith("/api/community/admin-portal/posts/")) {
        return Response.json({ count: 1, next: null, previous: null, results: [POST] });
      }
      if (path.includes("/admin-portal/posts/")) return Response.json({ deleted: true });
      if (path.endsWith("/admin-portal/people/")) {
        return Response.json({ count: people.length, next: null, previous: null, results: people });
      }
      if (path.endsWith("/admin-portal/badges/")) {
        return Response.json({ unhandled_feedback: unhandledFeedback, open_reports: 2 });
      }
      if (path.includes("/admin-portal/feedback/") && path.endsWith("/handle/")) {
        const body = JSON.parse(options.body ?? "{}");
        unhandledFeedback += body.handled ? -1 : 1;
        return Response.json({
          id: 9,
          handled: body.handled,
          handled_by: body.handled ? "staffer" : "",
          handled_at: body.handled ? "2026-09-29T10:00:00Z" : null,
          admin_note: body.admin_note ?? "",
        });
      }
      if (path.endsWith("/admin-portal/feedback/")) {
        const wanted = new URL(url, "http://localhost").searchParams.get("handled");
        const rows = FEEDBACK_ROWS.filter(
          (row) => wanted === null || wanted === "" || String(row.handled) === wanted,
        );
        return Response.json({ count: rows.length, next: null, previous: null, results: rows });
      }
      if (path.endsWith("/api/interest/submissions/")) {
        return Response.json({ count: 0, next: null, previous: null, results: [] });
      }
      return Response.json({}, { status: 404 });
    }),
  );
  return calls;
}

afterEach(() => {
  auth = { user: STAFF, checked: true, refresh: vi.fn() };
  vi.unstubAllGlobals();
});

/**
 * The sidebar, once the shell has rendered.
 *
 * Navigation, not a tablist: these change what the whole page is about and
 * they are in the URL, so they are announced as navigation and carry
 * aria-current rather than aria-selected. There are two in the document (the
 * phone drawer and the desktop column, one of which CSS hides), so this takes
 * the first.
 */
async function sidebar() {
  const navs = await screen.findAllByRole("navigation");
  return navs[0];
}

/**
 * Move to a section the way a staff member would.
 *
 * Matched loosely, because a section with a badge has the count and its
 * hidden words in its accessible name ("Feedback 3 not dealt with yet").
 */
async function openSection(user, name) {
  const nav = await sidebar();
  await user.click(await within(nav).findByRole("button", { name: new RegExp(`^${name}`) }));
}

/** Prints the router's current query string, so a test can assert on it. */
function ShowsTheUrl() {
  const [params] = useSearchParams();
  return <output data-testid="url">{params.toString()}</output>;
}

function renderPortal(path = "/admin-portal") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/admin-portal"
          element={
            <>
              <AdminPortal />
              <ShowsTheUrl />
            </>
          }
        />
        <Route path="/" element={<h1>Home</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Admin Portal: who gets in", () => {
  it("sends a student to the homepage", async () => {
    auth = { user: STUDENT, checked: true, refresh: vi.fn() };
    fakeServer();

    renderPortal();

    expect(await screen.findByRole("heading", { name: "Home" })).toBeInTheDocument();
  });

  // Signed out is not the same as signed in and not staff. A student needs no
  // explanation, but somebody with no session at all may just be a staff
  // member who has not signed in yet, so they get told rather than bounced.
  it("greets staff by their first name, like the header does", async () => {
    auth = { user: { ...STAFF, first_name: "Ada" }, checked: true, refresh: vi.fn() };
    fakeServer();

    renderPortal();

    expect(
      await screen.findByRole("heading", { name: /Good (morning|afternoon|evening), Ada/, level: 1 }),
    ).toBeInTheDocument();
  });

  it("falls back to the username when the account has no first name", async () => {
    auth = { user: { ...STAFF, first_name: "" }, checked: true, refresh: vi.fn() };
    fakeServer();

    renderPortal();

    expect(
      await screen.findByRole("heading", { name: /Good (morning|afternoon|evening), staffer/, level: 1 }),
    ).toBeInTheDocument();
  });

  it("asks a signed-out visitor to sign in instead of bouncing them home", async () => {
    auth = { user: null, checked: true, refresh: vi.fn() };
    fakeServer();

    renderPortal();

    expect(
      await screen.findByRole("heading", { name: "Sign in to open the Admin Portal" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Home" })).not.toBeInTheDocument();
  });

  it("sends a signed-out visitor back here after they sign in", async () => {
    auth = { user: null, checked: true, refresh: vi.fn() };
    fakeServer();

    renderPortal();

    const link = await screen.findByRole("link", { name: "Sign in" });
    expect(link).toHaveAttribute("href", "/login?next=%2Fadmin-portal");
  });

  it("keeps the tab they asked for across the sign-in", async () => {
    auth = { user: null, checked: true, refresh: vi.fn() };
    fakeServer();

    renderPortal("/admin-portal?tab=people");

    const link = await screen.findByRole("link", { name: "Sign in" });
    expect(link).toHaveAttribute("href", "/login?next=%2Fadmin-portal%3Ftab%3Dpeople");
  });

  it("asks the server nothing at all for a signed-out visitor", async () => {
    auth = { user: null, checked: true, refresh: vi.fn() };
    const calls = fakeServer();

    renderPortal();
    await screen.findByRole("heading", { name: "Sign in to open the Admin Portal" });

    expect(calls).toEqual([]);
  });

  it("waits for the session check rather than bouncing staff mid-load", () => {
    auth = { user: null, checked: false, refresh: vi.fn() };
    fakeServer();

    renderPortal();

    expect(screen.queryByRole("heading", { name: "Home" })).not.toBeInTheDocument();
  });
});

describe("Admin Portal: the PIN gate", () => {
  it("asks for the PIN instead of showing the dashboard", async () => {
    fakeServer({ unlocked: false });

    renderPortal();

    expect(await screen.findByLabelText("PIN")).toBeInTheDocument();
    // The point of the gate: none of the data is on the page yet.
    expect(screen.queryByRole("tab", { name: "Overview" })).not.toBeInTheDocument();
  });

  it("opens the portal once the PIN is right", async () => {
    fakeServer({ unlocked: false });
    const user = userEvent.setup({ delay: null });
    renderPortal();

    await user.type(await screen.findByLabelText("PIN"), "4821");
    await user.click(screen.getByRole("button", { name: "Unlock" }));

    expect(
      await screen.findByRole("heading", { name: /Good (morning|afternoon|evening), staffer/, level: 1 }),
    ).toBeInTheDocument();
  });

  it("rejects a wrong PIN without saying how many tries are left", async () => {
    fakeServer({ unlocked: false, wrongPin: true });
    const user = userEvent.setup({ delay: null });
    renderPortal();

    await user.type(await screen.findByLabelText("PIN"), "0000");
    await user.click(screen.getByRole("button", { name: "Unlock" }));

    const message = await screen.findByRole("alert");
    expect(message).toHaveTextContent("That PIN is not right.");
    for (const leak of [/attempt/i, /remaining/i, /tries/i, /locked/i]) {
      expect(message.textContent).not.toMatch(leak);
    }
  });

  it("will not submit fewer than four digits", async () => {
    fakeServer({ unlocked: false });
    const user = userEvent.setup({ delay: null });
    renderPortal();

    await user.type(await screen.findByLabelText("PIN"), "48");

    expect(screen.getByRole("button", { name: "Unlock" })).toBeDisabled();
  });

  it("ignores anything that is not a digit", async () => {
    fakeServer({ unlocked: false });
    const user = userEvent.setup({ delay: null });
    renderPortal();

    const field = await screen.findByLabelText("PIN");
    await user.type(field, "4a8b2c1d");

    expect(field).toHaveValue("4821");
  });

  it("says so when no PIN has been set up at all", async () => {
    // Failing closed: without a PIN nobody gets in, and the page explains
    // that rather than rejecting every guess with no reason.
    fakeServer({ unlocked: false, configured: false });

    renderPortal();

    expect(await screen.findByText(/No PIN has been set for this site/)).toBeInTheDocument();
    expect(screen.queryByLabelText("PIN")).not.toBeInTheDocument();
  });
});

describe("Admin Portal: the sidebar", () => {

  it("shows every section", async () => {
    fakeServer();

    renderPortal();

    const nav = await sidebar();
    for (const name of ["Overview", "Interest", "Reported posts", "Feedback", "People"]) {
      expect(within(nav).getByRole("button", { name: new RegExp(`^${name}`) })).toBeInTheDocument();
    }
  });

  it("opens the section named in the address", async () => {
    fakeServer();

    renderPortal("/admin-portal?tab=people");

    const link = await within(await sidebar()).findByRole("button", { name: "People" });
    expect(link).toHaveAttribute("aria-current", "page");
  });

  it("keeps the chosen date range when you move between sections", async () => {
    // A range narrowed on the Overview should still mean the same thing on
    // People, which is the whole reason the filters live in the URL.
    fakeServer();
    const user = userEvent.setup({ delay: null });
    renderPortal("/admin-portal?range=90d");

    await openSection(user, "People");

    const url = screen.getByTestId("url").textContent;
    expect(url).toContain("range=90d");
    expect(url).toContain("tab=people");
  });
});

describe("Admin Portal: Overview", () => {
  it("shows a card for every key number, and the charts", async () => {
    fakeServer();

    renderPortal();

    const accounts = (await screen.findByText("Accounts")).closest("article");
    expect(within(accounts).getByText("40")).toBeInTheDocument();

    for (const name of ["Sign-ups by week", "Accounts by type", "Interest by pathway"]) {
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
    }
  });

  it("shows a change against the period before, with an arrow and a sign", async () => {
    // Colour is never the only signal: the sign and the arrow have to carry
    // it on their own for greyscale and the colour-vision filters.
    fakeServer();

    renderPortal();

    const accounts = (await screen.findByText("Accounts")).closest("article");
    expect(within(accounts).getByText(/\+8 \(\+25%\)/)).toBeInTheDocument();
    // The arrow is decorative and has no role on purpose, so it is found as
    // an element rather than by role.
    expect(accounts.querySelector(".admin-kpi__arrow")).not.toBeNull();

    // And the whole thing as one sentence for a screen reader.
    expect(
      within(accounts).getByText(/up 8 \(25%\) on the period before/),
    ).toBeInTheDocument();
  });

  it("says so rather than dividing by zero when nothing came before", async () => {
    fakeServer();

    renderPortal();

    const active = (await screen.findByText("Signed in")).closest("article");
    expect(within(active).getByText(/no earlier figure/)).toBeInTheDocument();
  });

  it("does not call a faster answer time a loss", async () => {
    // Down is good here, and a dashboard that paints it red is lying.
    fakeServer();

    renderPortal();

    const card = (await screen.findByText("Time to first answer")).closest("article");
    expect(card.querySelector(".admin-kpi__change--good")).not.toBeNull();
  });

  it("gives every chart the same numbers as text", async () => {
    // A ring is meaningless to a screen reader. The table is built from the
    // same array the chart is drawn from, so the two cannot drift apart.
    fakeServer();
    const user = userEvent.setup({ delay: null });
    renderPortal();

    const ring = (await screen.findByRole("heading", { name: "Accounts by type" })).closest(
      "section",
    );
    await user.click(within(ring).getByText("Show the numbers"));

    const ringTable = within(ring).getByRole("table");
    expect(within(ringTable).getByRole("rowheader", { name: "Student" })).toBeInTheDocument();
    // 30 of 40 is 75%.
    expect(within(ringTable).getByText("75%")).toBeInTheDocument();

    // The bars carry the same guarantee, with counts rather than shares.
    const bars = screen.getByRole("heading", { name: "Interest by pathway" }).closest("section");
    await user.click(within(bars).getByText("Show the numbers"));

    const barTable = within(bars).getByRole("table");
    expect(within(barTable).getByRole("rowheader", { name: "Digital" })).toBeInTheDocument();
    expect(within(barTable).getByText("7")).toBeInTheDocument();
  });
});

describe("Admin Portal: deleting a reported post", () => {
  async function openReports(user) {
    renderPortal();
    await openSection(user, "Reported posts");
    return screen.findByText("A reported question");
  }

  it("does not delete on one click", async () => {
    const calls = fakeServer();
    const user = userEvent.setup({ delay: null });
    await openReports(user);

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(calls.some((call) => call.path.endsWith("/delete/"))).toBe(false);
  });

  it("warns that the answers go too", async () => {
    const user = userEvent.setup({ delay: null });
    fakeServer();
    await openReports(user);

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(await screen.findByRole("dialog")).toHaveTextContent(/every answer to it/);
  });

  it("deletes once it is confirmed", async () => {
    const calls = fakeServer();
    const user = userEvent.setup({ delay: null });
    await openReports(user);

    await user.click(screen.getByRole("button", { name: "Delete" }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(calls.some((call) => call.path.endsWith("/delete/"))).toBe(true),
    );
  });

  it("cancels without deleting", async () => {
    const calls = fakeServer();
    const user = userEvent.setup({ delay: null });
    await openReports(user);

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(calls.some((call) => call.path.endsWith("/delete/"))).toBe(false);
  });

  it("hides on one click, because hiding can be undone", async () => {
    const calls = fakeServer();
    const user = userEvent.setup({ delay: null });
    await openReports(user);

    await user.click(screen.getByRole("button", { name: "Hide" }));

    await waitFor(() => expect(calls.some((call) => call.path.endsWith("/hide/"))).toBe(true));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("Admin Portal: removing an account", () => {
  async function openPeople() {
    renderPortal("/admin-portal?tab=people");
    return screen.findByText("ada");
  }

  it("asks before it removes anything", async () => {
    const calls = fakeServer();
    const user = userEvent.setup({ delay: null });
    await openPeople();

    await user.click(screen.getByRole("button", { name: "Remove account" }));

    expect(await screen.findByRole("dialog")).toHaveTextContent("ada");
    expect(calls.some((call) => call.path.includes("/remove/"))).toBe(false);
  });

  it("will not remove until the username has been typed", async () => {
    const calls = fakeServer();
    const user = userEvent.setup({ delay: null });
    await openPeople();

    await user.click(screen.getByRole("button", { name: "Remove account" }));
    const dialog = await screen.findByRole("dialog");
    const confirm = within(dialog).getByRole("button", { name: "Remove account" });

    // Clicking yes is not enough: nothing to click until it matches.
    expect(confirm).toBeDisabled();

    await user.type(within(dialog).getByLabelText("Type ada to confirm"), "ad");
    expect(confirm).toBeDisabled();
    await user.type(within(dialog).getByLabelText("Type ada to confirm"), "x");
    expect(confirm).toBeDisabled();

    expect(calls.some((call) => call.path.includes("/remove/"))).toBe(false);
  });

  it("removes once the username is typed, and sends it to the server", async () => {
    const calls = fakeServer();
    const user = userEvent.setup({ delay: null });
    await openPeople();

    await user.click(screen.getByRole("button", { name: "Remove account" }));
    const dialog = await screen.findByRole("dialog");
    await user.type(within(dialog).getByLabelText("Type ada to confirm"), "ada");
    await user.click(within(dialog).getByRole("button", { name: "Remove account" }));

    await waitFor(() => expect(calls.some((call) => call.path.includes("/remove/"))).toBe(true));
  });

  it("offers no button at all on your own row", async () => {
    fakeServer({ people: [{ ...PERSON, id: 1, username: "staffer", user_type: "amazon_staff" }] });
    renderPortal("/admin-portal?tab=people");

    await screen.findByText("staffer");

    expect(screen.queryByRole("button", { name: "Remove account" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove admin access" })).not.toBeInTheDocument();
  });
});

describe("Admin Portal: taking admin access away", () => {
  async function openPeople() {
    renderPortal("/admin-portal?tab=people");
    return screen.findByText("otheradmin");
  }

  it("offers to remove an admin's access, not their account", async () => {
    fakeServer({ people: [OTHER_ADMIN] });
    await openPeople();

    expect(screen.getByRole("button", { name: "Remove admin access" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove account" })).not.toBeInTheDocument();
  });

  it("asks first", async () => {
    const calls = fakeServer({ people: [OTHER_ADMIN] });
    const user = userEvent.setup({ delay: null });
    await openPeople();

    await user.click(screen.getByRole("button", { name: "Remove admin access" }));

    expect(await screen.findByRole("dialog")).toHaveTextContent("otheradmin");
    expect(calls.some((call) => call.path.includes("/revoke-staff/"))).toBe(false);
  });

  it("takes the access away once it is confirmed", async () => {
    const calls = fakeServer({ people: [OTHER_ADMIN] });
    const user = userEvent.setup({ delay: null });
    await openPeople();

    await user.click(screen.getByRole("button", { name: "Remove admin access" }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Remove admin access" }));

    await waitFor(() =>
      expect(calls.some((call) => call.path.includes("/revoke-staff/"))).toBe(true),
    );
  });
});

describe("Admin Portal: Community posts", () => {
  async function openPosts() {
    renderPortal("/admin-portal?tab=posts");
    return screen.findByText("Which pathway should I pick?");
  }

  it("lists posts whether or not anybody reported them", async () => {
    fakeServer();
    await openPosts();

    expect(screen.getByText("2 answers")).toBeInTheDocument();
  });

  it("asks before deleting, and says how many answers go with a question", async () => {
    const calls = fakeServer();
    const user = userEvent.setup({ delay: null });
    await openPosts();

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(await screen.findByRole("dialog")).toHaveTextContent("2 answers");
    expect(calls.some((call) => call.path.includes("/posts/question/5/delete/"))).toBe(false);
  });

  it("deletes once it is confirmed", async () => {
    const calls = fakeServer();
    const user = userEvent.setup({ delay: null });
    await openPosts();

    await user.click(screen.getByRole("button", { name: "Delete" }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(calls.some((call) => call.path.includes("/posts/question/5/delete/"))).toBe(true),
    );
  });
});

describe("Admin Portal: accessibility", () => {
  it("has no WCAG 2.2 AA problems on the PIN screen", async () => {
    fakeServer({ unlocked: false });
    const { container } = renderPortal();

    await screen.findByLabelText("PIN");
    await expectNoAxeViolations(container);
  });

  it("has no WCAG 2.2 AA problems on the Overview tab", async () => {
    fakeServer();
    const { container } = renderPortal();

    await screen.findByRole("heading", { name: "Interest by pathway" });
    await expectNoAxeViolations(container);
  });

  it("has exactly one h1", async () => {
    fakeServer();
    renderPortal();

    await screen.findByRole("heading", { name: /Good (morning|afternoon|evening), staffer/, level: 1 });
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});

describe("Admin Portal: exporting a CSV", () => {
  /** The export fetches directly, so it is watched separately from the API. */
  function watchDownloads() {
    const asked = [];
    const realFetch = window.fetch;
    vi.stubGlobal("fetch", async (url, options) => {
      if (String(url).includes("/export/")) {
        asked.push(String(url));
        return new Response("\ufeffID,Username\n1,ada\n", {
          status: 200,
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="tsmile-people-2026-09-29.csv"',
          },
        });
      }
      return realFetch(url, options);
    });
    // jsdom has neither of these, and the button uses both.
    URL.createObjectURL = vi.fn(() => "blob:test");
    URL.revokeObjectURL = vi.fn();
    return asked;
  }

  it("asks for the export with the filters that are on screen", async () => {
    fakeServer();
    const asked = watchDownloads();
    const user = userEvent.setup({ delay: null });
    renderPortal("/admin-portal?range=90d");

    await user.click(await screen.findByRole("button", { name: "Export CSV" }));

    await waitFor(() => expect(asked).toHaveLength(1));
    expect(asked[0]).toContain("/admin-portal/dashboard/export/");
    expect(asked[0]).toContain("range=90d");
  });

  it("exports the section you are looking at", async () => {
    fakeServer();
    const asked = watchDownloads();
    const user = userEvent.setup({ delay: null });
    renderPortal();

    await openSection(user, "People");
    await user.click(await screen.findByRole("button", { name: "Export CSV" }));

    await waitFor(() => expect(asked).toHaveLength(1));
    expect(asked[0]).toContain("/admin-portal/people/export/");
  });

  it("uses the filename the server chose", async () => {
    fakeServer();
    watchDownloads();
    const user = userEvent.setup({ delay: null });
    const clicked = [];
    // Catch the temporary <a> the button makes rather than the download.
    const realClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function stub() {
      clicked.push(this.download);
    };
    renderPortal();

    await user.click(await screen.findByRole("button", { name: "Export CSV" }));

    await waitFor(() => expect(clicked).toContain("tsmile-people-2026-09-29.csv"));
    HTMLAnchorElement.prototype.click = realClick;
  });

  it("says so when the download fails, rather than failing silently", async () => {
    fakeServer();
    const realFetch = window.fetch;
    vi.stubGlobal("fetch", async (url, options) =>
      String(url).includes("/export/")
        ? new Response("no", { status: 403 })
        : realFetch(url, options),
    );
    const user = userEvent.setup({ delay: null });
    renderPortal();

    await user.click(await screen.findByRole("button", { name: "Export CSV" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/did not work/);
  });
});

describe("Admin Portal: handling feedback", () => {
  async function openFeedback(user) {
    renderPortal();
    await openSection(user, "Feedback");
    return screen.findByText("The map does not load");
  }

  it("says who dealt with a piece of feedback, and when", async () => {
    fakeServer();
    const user = userEvent.setup({ delay: null });

    await openFeedback(user);

    // Not just a tick: "handled" with nobody's name against it is the same
    // as not knowing.
    expect(screen.getByText(/otherstaff on/)).toBeInTheDocument();
  });

  it("marks one dealt with and keeps the rest of the list still", async () => {
    fakeServer();
    const user = userEvent.setup({ delay: null });
    await openFeedback(user);

    await user.click(screen.getAllByRole("button", { name: "Mark dealt with" })[0]);

    await waitFor(() => expect(screen.getAllByText(/staffer on/).length).toBeGreaterThan(0));
    // The other row is untouched, because the row is patched rather than the
    // whole page refetched.
    expect(screen.getByText("Lovely site")).toBeInTheDocument();
  });

  it("saves a staff-only note", async () => {
    fakeServer();
    const user = userEvent.setup({ delay: null });
    await openFeedback(user);

    // Scoped to the row: <details> elements elsewhere on the page (the phone
    // nav drawer, the chart tables) are groups too.
    const row = screen.getByText("The map does not load").closest("tr");
    // The summary and the textarea's own hidden label share their words,
    // so this asks for the summary itself rather than the text.
    await user.click(row.querySelector("summary"));
    await user.type(within(row).getByLabelText("Staff note"), "replied by email");
    await user.click(within(row).getByRole("button", { name: "Save note" }));

    // The saved note under the message, not the textarea still holding it.
    await waitFor(() =>
      expect(
        screen.getByText("The map does not load").closest("tr").querySelector(".admin-feedback__saved-note"),
      ).toHaveTextContent("replied by email"),
    );
  });

  it("filters to the ones still waiting", async () => {
    fakeServer();
    const user = userEvent.setup({ delay: null });
    await openFeedback(user);

    await user.selectOptions(screen.getByLabelText("Status"), "false");

    await waitFor(() => expect(screen.queryByText("Lovely site")).not.toBeInTheDocument());
    expect(screen.getByText("The map does not load")).toBeInTheDocument();
  });

  it("shows the unhandled count in the sidebar, with words for a screen reader", async () => {
    fakeServer();
    const user = userEvent.setup({ delay: null });
    renderPortal();

    const nav = await sidebar();
    const feedback = await within(nav).findByRole("button", { name: /Feedback/ });
    await waitFor(() => expect(feedback).toHaveTextContent("3"));
    // A bare number beside a word is meaningless read aloud.
    expect(feedback).toHaveTextContent("not dealt with yet");
  });

  it("refreshes the count after something is dealt with", async () => {
    fakeServer();
    const user = userEvent.setup({ delay: null });
    await openFeedback(user);

    const nav = await sidebar();
    const feedback = within(nav).getByRole("button", { name: /Feedback/ });
    await waitFor(() => expect(feedback).toHaveTextContent("3"));

    await user.click(screen.getAllByRole("button", { name: "Mark dealt with" })[0]);

    await waitFor(() => expect(feedback).toHaveTextContent("2"));
  });
});

