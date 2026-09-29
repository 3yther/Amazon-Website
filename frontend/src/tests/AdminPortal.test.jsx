import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
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
      if (path.endsWith("/admin-portal/feedback/")) {
        return Response.json({ count: 0, next: null, previous: null, results: [] });
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

function renderPortal(path = "/admin-portal") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin-portal" element={<AdminPortal />} />
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

    expect(await screen.findByRole("heading", { name: "Admin Portal", level: 1 })).toBeInTheDocument();
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

describe("Admin Portal: the tabs", () => {
  it("shows all five", async () => {
    fakeServer();

    renderPortal();

    for (const name of ["Overview", "Interest", "Reported posts", "Feedback", "People"]) {
      expect(await screen.findByRole("tab", { name })).toBeInTheDocument();
    }
  });

  it("opens the tab named in the address", async () => {
    fakeServer();

    renderPortal("/admin-portal?tab=people");

    expect(await screen.findByRole("tab", { name: "People", selected: true })).toBeInTheDocument();
  });
});

describe("Admin Portal: Overview", () => {
  it("shows the totals and the charts", async () => {
    fakeServer();

    renderPortal();

    expect(await screen.findByText("40")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Interest by pathway" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sign-ups by week" })).toBeInTheDocument();
  });

  it("gives every chart the same numbers as text", async () => {
    // A ring is meaningless to a screen reader. The table is built from the
    // same array the chart is drawn from, so the two cannot drift apart.
    fakeServer();
    const user = userEvent.setup({ delay: null });
    renderPortal();

    const chart = (await screen.findByRole("heading", { name: "Interest by pathway" })).closest(
      "section",
    );
    await user.click(within(chart).getByText("Show the numbers"));

    const table = within(chart).getByRole("table");
    expect(within(table).getByRole("rowheader", { name: "Digital" })).toBeInTheDocument();
    // 7 of 10 is 70%.
    expect(within(table).getByText("70%")).toBeInTheDocument();
  });
});

describe("Admin Portal: deleting a reported post", () => {
  async function openReports(user) {
    renderPortal();
    await user.click(await screen.findByRole("tab", { name: "Reported posts" }));
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

    await screen.findByRole("heading", { name: "Admin Portal", level: 1 });
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});
