import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { useT } from "../i18n/I18nProvider.jsx";
import LanguagePicker from "../i18n/LanguagePicker.jsx";
import { PersonIcon } from "./Icons.jsx";

// Same choices as labels.js USER_TYPES, plus the staff role that only exists
// through Django admin, so a signed-in staff member still gets a label here.
// The words are under account.roles in the language files.
const ROLES = ["student", "parent", "teacher", "amazon_staff"];

// Labels are translation keys (see i18n/messages/en.js, account).
const MENU_ITEMS = [
  { to: "/accessibility", label: "account.settings" },
  { to: "/accessibility?tab=security", label: "account.security" },
  { to: "/contact", label: "account.contact" },
];

// Logging out is NOT here on purpose. It used to be the last item in this
// menu, one press from the header on every page, which is a long way to fall
// from "I wanted my settings". It lives on the Account tab of
// /accessibility now (see accessibility/AccountSettings.jsx), which the
// first item here goes to.

// Shown only to Amazon staff. Hiding it is a convenience, not a control:
// /staff redirects anyone else away and its API refuses them (see
// accounts/permissions.py).
const STAFF_ITEM = { to: "/staff", label: "account.submissions" };

/**
 * The account button in the header, and the menu it opens.
 *
 * Signed in it greets you by name and offers your account pages; signed out
 * it says "Hello, sign in" and offers the two ways to get an account. It used
 * to render nothing at all when nobody was signed in, which left the corner
 * empty and signing in reachable only from the nav drawer.
 *
 * Both states are the same menu: the same outside-click and Escape handling,
 * the same trigger, the same roles. Only what is inside it changes.
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
        // role="menu" sits on the list, not on this box. It used to be on the
        // box, which also holds the name and role heading, and a menu is only
        // allowed to contain menu items: axe rejected it for
        // aria-required-children, and the links inside for
        // aria-required-parent. The heading is a label for the menu, not an
        // item in it, so it stays outside.
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
                {/* The one item in either menu that is a button rather than a
                    row: creating an account is what we want a new visitor to
                    do, and orange is how the rest of the site says "press
                    this". Contact Us is deliberately left out; the footer has
                    it on every page already. */}
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

          {/* The language menu, for everyone, signed in or not. Outside the
              list, because a menu may only hold menu items, and a <select>
              is not one. The side menu has the same control. */}
          <div className="dropdown-language">
            <LanguagePicker variant="menu" />
          </div>
        </div>
      )}
    </div>
  );
}
