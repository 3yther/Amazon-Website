import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { useT } from "../i18n/I18nProvider.jsx";
import LanguagePicker from "../i18n/LanguagePicker.jsx";
import { PersonIcon } from "./Icons.jsx";

// Role names (words are under account.roles). Includes staff, which is only set in Django admin.
const ROLES = ["student", "parent", "teacher", "amazon_staff"];

// Labels are translation keys (see i18n/messages/en.js, account).
const MENU_ITEMS = [
  { to: "/accessibility", label: "account.settings" },
  { to: "/accessibility?tab=security", label: "account.security" },
  { to: "/contact", label: "account.contact" },
];

// Log out isn't in this menu, it's on the Account tab of /accessibility.

// Only shown to Amazon staff. The API does the real check.
const STAFF_ITEM = { to: "/staff", label: "account.submissions" };

/**
 * The account button in the header and its menu.
 * Signed in it shows your name and account links, signed out it shows sign in and sign up.
 */
export default function AccountDropdown() {
  const t = useT();
  const { user, checked } = useAuth();
  const [open, setOpen] = useState(false);
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

  // Nothing until the first session check, so the button never says "sign in"
  // for a moment to somebody who already is.
  if (!checked) return null;

  const signedIn = Boolean(user);
  const displayName = signedIn
    ? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username
    : "";
  const greetingName = signedIn ? user.first_name || user.username : "";

  return (
    <div className="account-menu" ref={rootRef}>
      <button
        type="button"
        ref={triggerRef}
        className="account-button"
        aria-haspopup="menu"
        aria-expanded={open}
        // Spelled out for screen readers, which do not get the visual
        // shorthand of an initial in a circle.
        aria-label={signedIn ? t("account.menuFor", { name: displayName }) : t("account.signInOrUp")}
        onClick={() => setOpen((current) => !current)}
      >
        {signedIn ? (
          <span className="account-button__initial" aria-hidden="true">
            {(user.first_name || user.username || "?").charAt(0).toUpperCase()}
          </span>
        ) : (
          <PersonIcon />
        )}
        {/* Hidden below the narrow breakpoint, where the header has no room
            for it; the icon or initial beside it still says what this is. */}
        <span className="account-button__greeting" aria-hidden="true">
          {signedIn ? t("menu.helloUser", { name: greetingName }) : t("menu.helloGuest")}
        </span>
      </button>

      {open && (
        // role="menu" goes on the list, not the box, because a menu can only hold menu items.
        <div className="account-dropdown">
          {signedIn ? (
            <div className="dropdown-header">
              <p>{displayName}</p>
              <p className="label">
                {ROLES.includes(user.user_type) ? t(`account.roles.${user.user_type}`) : user.user_type}
              </p>
            </div>
          ) : (
            <div className="dropdown-header">
              <p>{t("account.notSignedIn")}</p>
              <p className="label">{t("account.needAccount")}</p>
            </div>
          )}

          <ul className="dropdown-links" role="menu" aria-label={t("account.menu")}>
            {signedIn ? (
              (user.user_type === "amazon_staff" ? [STAFF_ITEM, ...MENU_ITEMS] : MENU_ITEMS).map(
                (item) => (
                  <li key={item.label} role="none">
                    <NavLink to={item.to} role="menuitem" onClick={() => setOpen(false)}>
                      {t(item.label)}
                    </NavLink>
                  </li>
                ),
              )
            ) : (
              <>
                <li role="none">
                  <NavLink to="/login" role="menuitem" onClick={() => setOpen(false)}>
                    {t("account.signIn")}
                  </NavLink>
                </li>
                {/* Sign up is a button so it stands out. */}
                <li role="none" className="dropdown-links__cta">
                  <NavLink
                    to="/register"
                    role="menuitem"
                    className="button button--primary dropdown-cta"
                    onClick={() => setOpen(false)}
                  >
                    {t("account.signUp")}
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          {/* The language picker. It sits outside the list because a select isn't a menu item. */}
          <div className="dropdown-language">
            <LanguagePicker variant="menu" />
          </div>
        </div>
      )}
    </div>
  );
}
