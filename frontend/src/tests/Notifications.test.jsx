import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../auth.jsx";
import NotificationBell from "../components/NotificationBell.jsx";
import NotificationSettings from "../components/accessibility/NotificationSettings.jsx";
import { expectNoAxeViolations } from "./axe.js";

// The bell in the header and the Notifications tab in Settings, with a fake server.

const USER = { id: 1, username: "ada", user_type: "student" };
const NOTIFICATIONS = {
  unread: 1,
  results: [
    { id: 7, kind: "community", event: "answered", text: "How long is the placement?", link: "/community/3", read: false, created_at: "2026-09-30T10:00:00Z" },
    { id: 6, kind: "announcement", event: "announcement", text: "New resources", link: "", read: true, created_at: "2026-09-29T10:00:00Z" },
  ],
};

function fakeServer({ signedIn = true } = {}) {
  const calls = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, options = {}) => {
      const path = new URL(url, "http://localhost").pathname;
      calls.push({ path, method: options.method ?? "GET", body: options.body });
      if (path === "/api/accounts/me/") return signedIn ? Response.json(USER) : Response.json({}, { status: 401 });
      if (path === "/api/accounts/csrf/") return Response.json({ csrf_token: "t" });
      if (path === "/api/notifications/") return Response.json(NOTIFICATIONS);
      if (path.endsWith("/read/")) return Response.json({ unread: 0 });
      if (path === "/api/accounts/user-preferences/") {
        return Response.json({ notify_announcements: true, notify_community: true, notify_interest: true });
      }
      return Response.json({}, { status: 404 });
    }),
  );
  return calls;
}

function renderWith(ui) {
  return render(
    <MemoryRouter>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Notification bell", () => {
  it("shows the unread count and the list", async () => {
    fakeServer();
    const user = userEvent.setup({ delay: null });
    renderWith(<NotificationBell />);

    const bell = await screen.findByRole("button", { name: "Notifications, 1 unread" });
    await user.click(bell);

    expect(screen.getByRole("link", { name: /Someone answered your question: How long is the placement\?/ })).toHaveAttribute(
      "href",
      "/community/3",
    );
    expect(screen.getByText("Announcement: New resources")).toBeInTheDocument();
  });

  it("marks everything as read", async () => {
    const calls = fakeServer();
    const user = userEvent.setup({ delay: null });
    renderWith(<NotificationBell />);

    await user.click(await screen.findByRole("button", { name: /Notifications/ }));
    await user.click(screen.getByRole("button", { name: "Mark all as read" }));

    expect(calls.some((c) => c.path === "/api/notifications/read/" && c.method === "POST")).toBe(true);
    expect(screen.getByRole("button", { name: "Notifications, 0 unread" })).toBeInTheDocument();
  });

  it("checks again when you come back to the tab", async () => {
    const calls = fakeServer();
    renderWith(<NotificationBell />);
    await screen.findByRole("button", { name: /Notifications/ });
    const before = calls.filter((c) => c.path === "/api/notifications/").length;

    window.dispatchEvent(new Event("focus"));

    await waitFor(() => expect(calls.filter((c) => c.path === "/api/notifications/").length).toBe(before + 1));
  });

  it("isn't shown when signed out", async () => {
    const calls = fakeServer({ signedIn: false });
    renderWith(<NotificationBell />);
    await waitFor(() => expect(calls.some((c) => c.path === "/api/accounts/me/")).toBe(true));
    expect(screen.queryByRole("button", { name: /Notifications/ })).toBeNull();
  });

  it("has no accessibility problems axe can find when open", async () => {
    fakeServer();
    const user = userEvent.setup({ delay: null });
    const { container } = renderWith(<NotificationBell />);
    await user.click(await screen.findByRole("button", { name: /Notifications/ }));
    await expectNoAxeViolations(container);
  });
});

describe("Notification settings", () => {
  it("turns a kind off and saves it", async () => {
    const calls = fakeServer();
    const user = userEvent.setup({ delay: null });
    renderWith(<NotificationSettings />);

    const community = await screen.findByLabelText("Replies to your Community questions and answers");
    expect(community).toBeChecked();
    await user.click(community);

    expect(community).not.toBeChecked();
    const saved = calls.find((c) => c.method === "PATCH");
    expect(JSON.parse(saved.body)).toEqual({ notify_community: false });
    expect(await screen.findByText("Saved.")).toBeInTheDocument();
  });
});
