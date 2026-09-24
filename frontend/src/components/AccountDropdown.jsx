import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../api.js";
import { useAuth } from "../auth.jsx";

// Same choices as labels.js USER_TYPES, plus the staff role that only exists
// through Django admin, so a signed-in staff member still gets a label here.
const ROLE_LABELS = {
  student: "Student",
  parent: "Parent or guardian",
  teacher: "Teacher or school",
  amazon_staff: "Amazon staff",
};

const MENU_ITEMS = [
  { to: "/accessibility", label: "Profile & Settings" },
  { to: "/accessibility?tab=security", label: "Security Settings" },
  { to: "/contact", label: "Contact Us" },
];

// Shown only to Amazon staff. Hiding it is a convenience, not a control:
// /staff redirects anyone else away and its API refuses them (see
// accounts/permissions.py).
const STAFF_ITEM = { to: "/staff", label: "Submissions" };

/**
 * Circular initial button in the header that opens a menu of account links
 * plus Logout. Nothing renders until a signed-in user is known, so signed-out
 * visitors see the same empty corner as before this existed.
 */
export default function AccountDropdown() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | submitting
  const rootRef = useRef(null);
  const triggerRef = useRef(null);

  // Closes on a click outside the menu or on Escape, and Escape also returns
  // focus to the trigger so keyboard use never loses its place.
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    function handleKeyDown(event) {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!user) return null;

  const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username;
  const initial = (user.first_name || user.username || "?").charAt(0).toUpperCase();
  const roleLabel = ROLE_LABELS[user.user_type] ?? user.user_type;

  async function handleLogout() {
    setStatus("submitting");
    setOpen(false);
    try {
      await logout();
    } catch {
      // A 401 means the session had already ended. refresh() settles it either way.
    }
    await refresh();
    setStatus("idle");
    navigate("/login");
  }

  return (
    <div className="account-menu" ref={rootRef}>
      <button
        type="button"
        ref={triggerRef}
        className="account-button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${displayName}`}
        onClick={() => setOpen((current) => !current)}
      >
        {initial}
      </button>

      {open && (
        <div className="account-dropdown" role="menu" aria-label="Account">
          <div className="dropdown-header">
            <p>{displayName}</p>
            <p className="label">{roleLabel}</p>
          </div>

          <ul className="dropdown-links">
            {(user.user_type === "amazon_staff" ? [STAFF_ITEM, ...MENU_ITEMS] : MENU_ITEMS).map((item) => (
              <li key={item.label} role="none">
                <NavLink to={item.to} role="menuitem" onClick={() => setOpen(false)}>
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li role="none">
              <button
                type="button"
                role="menuitem"
                className="nav-button"
                disabled={status === "submitting"}
                onClick={handleLogout}
              >
                {status === "submitting" ? "Logging out" : "Logout"}
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
