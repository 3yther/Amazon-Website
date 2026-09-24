import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AccountDropdown from "../components/AccountDropdown.jsx";
import AccountSettings from "../components/accessibility/AccountSettings.jsx";

// Logging out moved out of the header's account menu and onto the Account
// tab of the settings page. These cover both ends of that move: that it is
// gone from the menu, and that the new control does exactly what the old one
// did.

const { mockUseAuth, mockLogout, mockDeactivate, mockUpdateProfile } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockLogout: vi.fn(),
  mockDeactivate: vi.fn(),
  mockUpdateProfile: vi.fn(),
}));

vi.mock("../auth.jsx", () => ({ useAuth: mockUseAuth }));
// vitest runs these files in one shared module registry (isolate: false in
// vitest.config.js), so a mock here is visible to every other test file.
// importOriginal keeps the rest of api.js real: RegisterInterest.test.jsx
// leans on the genuine ApiError, and a mock that listed only the functions
// this file needs would take it away from them.
vi.mock("../api.js", async (importOriginal) => ({
  ...(await importOriginal()),
  logout: mockLogout,
  deactivateAccount: mockDeactivate,
  updateProfile: mockUpdateProfile,
}));

const USER = { username: "ada", user_type: "student", first_name: "Ada", last_name: "Lovelace" };

beforeEach(() => {
  vi.clearAllMocks();
  mockUseAuth.mockReturnValue({ user: USER, checked: true, refresh: vi.fn().mockResolvedValue() });
  mockLogout.mockResolvedValue(null);
});

describe("The header's account menu", () => {
  async function openMenu() {
    const user = userEvent.setup({ delay: null });
    render(
      <MemoryRouter>
        <AccountDropdown />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole("button", { name: /Account menu/ }));
    return user;
  }

  it("no longer offers Logout", async () => {
    await openMenu();
    expect(screen.queryByRole("menuitem", { name: /log ?out/i })).toBeNull();
    expect(screen.queryByText(/log ?out/i)).toBeNull();
  });

  it("still offers a way into Settings", async () => {
    await openMenu();
    const settings = screen.getByRole("menuitem", { name: "Profile & Settings" });
    expect(settings).toHaveAttribute("href", "/accessibility");
  });

  it("lists only the account links", async () => {
    await openMenu();
    expect(screen.getAllByRole("menuitem").map((item) => item.textContent)).toEqual([
      "Profile & Settings",
      "Security Settings",
      "Contact Us",
    ]);
  });
});

describe("Logging out from the Account tab", () => {
  function renderTab() {
    return render(
      <MemoryRouter initialEntries={["/accessibility"]}>
        <Routes>
          <Route path="/accessibility" element={<AccountSettings />} />
          <Route path="/login" element={<h1>Login</h1>} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it("calls logout and sends you to the login page", async () => {
    const refresh = vi.fn().mockResolvedValue();
    mockUseAuth.mockReturnValue({ user: USER, checked: true, refresh });
    const user = userEvent.setup({ delay: null });
    renderTab();

    await user.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => expect(mockLogout).toHaveBeenCalledTimes(1));
    expect(refresh).toHaveBeenCalled();
    expect(await screen.findByRole("heading", { name: "Login" })).toBeInTheDocument();
  });

  it("still signs you out when the session had already ended", async () => {
    // A 401 from the server means the session was gone anyway, so the person
    // should still end up signed out rather than stuck on an error.
    mockLogout.mockRejectedValue(new Error("401"));
    const user = userEvent.setup({ delay: null });
    renderTab();

    await user.click(screen.getByRole("button", { name: "Log out" }));

    expect(await screen.findByRole("heading", { name: "Login" })).toBeInTheDocument();
  });

  it("keeps logging out apart from deactivating", async () => {
    renderTab();

    // Its own section, and not inside the profile form: pressing it must not
    // read as saving what is typed above.
    const logout = screen.getByRole("button", { name: "Log out" });
    expect(logout.closest("form")).toBeNull();
    expect(logout.closest(".danger-zone")).toBeNull();
    expect(logout.closest(".settings-block")).not.toBeNull();

    // Deactivating still asks for a password first; logging out does not.
    expect(screen.getByRole("button", { name: "Deactivate account" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
