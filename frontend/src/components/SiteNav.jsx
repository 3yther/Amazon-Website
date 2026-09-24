import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../api.js";
import { useAuth } from "../auth.jsx";
import { useT } from "../i18n/I18nProvider.jsx";
import LanguagePicker from "../i18n/LanguagePicker.jsx";
import { CloseIcon, MenuIcon, PersonIcon } from "./Icons.jsx";

// Site navigation: at every screen width, a menu button in the header opens a
// drawer from the left edge. The drawer is a modal <dialog>, so the page
// behind is inert and Escape closes it.

// Labels are translation keys (see i18n/messages/en.js, menu.pages).
const PAGES = [
  { to: "/", label: "menu.pages.home" },
  { to: "/about", label: "menu.pages.about" },
  { to: "/t-levels-at-amazon", label: "menu.pages.amazon" },
  { to: "/resources", label: "menu.pages.resources" },
  { to: "/t-level-near-you", label: "menu.pages.nearYou" },
  { to: "/quiz", label: "menu.pages.quiz" },
  { to: "/community", label: "menu.pages.community" },
  { to: "/help", label: "menu.pages.help" },
  // The Expression of Interest form, a core client requirement, so it is
  // one tap away on every page.
  { to: "/register-interest", label: "menu.pages.registerInterest" },
];

export default function SiteNav() {
  const location = useLocation();
  const t = useT();
  const menuButton = useRef(null);
  const overlay = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Any navigation closes the menu.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.key]);

  // Open and close the <dialog> to match the state. While it is open the page
  // behind cannot scroll; closing puts focus back on the menu button.
  useEffect(() => {
    const dialog = overlay.current;
    const closing = "menu-overlay--closing";

    if (menuOpen) {
      if (dialog.classList.contains(closing)) {
        dialog.classList.remove(closing); // reopened before the close finished
      } else if (!dialog.open) {
        // The drawer slides in from the edge it is anchored to (see
        // styles.css), so the open position needs no measuring.
        dialog.showModal();
        document.documentElement.classList.add("menu-open");
      }
      return;
    }

    if (!dialog.open) return;

    function finishClosing() {
      if (!dialog.classList.contains(closing)) return; // reopened meanwhile
      dialog.classList.remove(closing);
      dialog.close();
      document.documentElement.classList.remove("menu-open");
      menuButton.current?.focus();
    }

    // Play the closing animation, then close. With reduced motion there is no
    // animation, so it closes straight away. The timer is a backstop in case
    // the animation never reports finishing (e.g. the tab is hidden).
    dialog.classList.add(closing);
    const animations = dialog.getAnimations();
    if (animations.length === 0) {
      finishClosing();
    } else {
      Promise.race([
        Promise.allSettled(animations.map((animation) => animation.finished)),
        new Promise((resolve) => setTimeout(resolve, 400)),
      ]).then(finishClosing);
    }
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <button
        ref={menuButton}
        type="button"
        className="button menu-toggle"
        aria-label={t("menu.open")}
        aria-expanded={menuOpen}
        aria-controls="menu-overlay"
        onClick={() => setMenuOpen(true)}
      >
        <MenuIcon />
      </button>

      {/* Rendered into <body>, outside the header, so it takes none of the
          header's dark-background styles. */}
      {createPortal(
        <dialog
          id="menu-overlay"
          ref={overlay}
          className="menu-overlay"
          aria-label={t("menu.open")}
          onKeyDown={(event) => {
            // Handle Escape directly as well as through the dialog's own cancel
            // event, so it closes the same way however the key arrives.
            if (event.key === "Escape") {
              event.preventDefault();
              closeMenu();
            }
          }}
          onCancel={(event) => {
            event.preventDefault(); // close through state instead
            closeMenu();
          }}
          onClose={closeMenu}
        >
          {/* No RisingSubjects here any more: its names are position: fixed,
              so inside a part-width drawer they escaped the panel and drifted
              across the blurred page behind it. */}
          <Hello onNavigate={closeMenu} />

          <nav className="container menu-overlay__nav" aria-label={t("menu.main")}>
            <NavList onNavigate={closeMenu} />
          </nav>

          <div className="container menu-overlay__language">
            <LanguagePicker variant="menu" />
          </div>
        </dialog>,
        document.body,
      )}
    </>
  );
}

/**
 * The dark band at the top of the drawer, the way Amazon's menu greets you:
 * "Hello, sam" once signed in, or "Hello, sign in" as a link to the login
 * page. The close button sits at its far end, where the menu button was.
 */
function Hello({ onNavigate }) {
  const t = useT();
  const { user, checked } = useAuth();

  return (
    <div className="menu-hello">
      <div className="container menu-hello__inner">
        <span className="menu-hello__avatar" aria-hidden="true">
          <PersonIcon />
        </span>

        {/* Nothing until the first session check, so "sign in" never flashes
            up for somebody who is already signed in. */}
        {checked && user && (
          <p className="menu-hello__text">{t("menu.helloUser", { name: user.username })}</p>
        )}
        {checked && !user && (
          <Link className="menu-hello__text" to="/login" onClick={onNavigate}>
            {t("menu.helloGuest")}
          </Link>
        )}

        <button
          type="button"
          className="button menu-overlay__close"
          aria-label={t("menu.close")}
          onClick={onNavigate}
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

/**
 * The page links, then Sign up and Login. Once someone is signed in those two
 * are replaced by Log out, which is the only way to sign out.
 */
function NavList({ onNavigate }) {
  const navigate = useNavigate();
  const t = useT();
  const { user, checked, refresh } = useAuth();
  const [status, setStatus] = useState("idle"); // idle | submitting

  async function handleLogout() {
    setStatus("submitting");
    try {
      await logout();
    } catch {
      // A 401 means the session had already ended. refresh() settles it either way.
    }
    await refresh();
    setStatus("idle");
    onNavigate?.();
    navigate("/");
  }

  // Each item's position in the list, which sets its place in the opening
  // cascade (see menu-link-rise in styles.css).
  const order = (index) => ({ "--i": index });

  return (
    <ul>
      {PAGES.map((page, index) => (
        <li key={page.to} style={order(index)}>
          {/* NavLink adds aria-current="page" to the link for the current route. */}
          <NavLink to={page.to} end={page.to === "/"} onClick={onNavigate}>
            {t(page.label)}
          </NavLink>
        </li>
      ))}

      {/* Nothing until the first session check, so the wrong links never flash up. */}
      {checked && !user && (
        <>
          <li style={order(PAGES.length)}>
            <NavLink to="/register" onClick={onNavigate}>
              {t("menu.signUp")}
            </NavLink>
          </li>
          <li style={order(PAGES.length + 1)}>
            <NavLink to="/login" onClick={onNavigate}>
              {t("menu.logIn")}
            </NavLink>
          </li>
        </>
      )}

      {checked && user && (
        <li style={order(PAGES.length)}>
          <button
            type="button"
            className="nav-button"
            disabled={status === "submitting"}
            onClick={handleLogout}
          >
            {status === "submitting" ? t("menu.loggingOut") : t("menu.logOut")}
          </button>
        </li>
      )}
    </ul>
  );
}
