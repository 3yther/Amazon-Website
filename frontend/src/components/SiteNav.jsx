import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { useT } from "../i18n/I18nProvider.jsx";
import LanguagePicker from "../i18n/LanguagePicker.jsx";
import { CloseIcon, MenuIcon, PersonIcon } from "./Icons.jsx";

// The side menu. The menu button opens a <dialog> drawer from the left.
// Only page links go here, sign in and settings are in the account menu.

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
  // Register interest is not a tab: it is a box on the Sign up page, and
  // linked from the homepage, the footer and the pathway pages.
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

    // Play the closing animation then close. The timer is a backup in case it never finishes.
    dialog.classList.add(closing);
    // getAnimations is missing in some test browsers; no animations means close now.
    const animations = dialog.getAnimations?.() ?? [];
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

  // A click on the blurred page beside the drawer closes it. The ::backdrop
  // belongs to the <dialog>, so that click arrives on the dialog itself, just
  // outside the panel's box. A click inside the panel (on its padding, say)
  // also lands on the dialog, so the position is what tells them apart.
  function closeOnBackdrop(event) {
    if (event.target !== event.currentTarget) return; // a link, button or text inside
    if (event.detail === 0) return; // keyboard "clicks" have no position
    const box = event.currentTarget.getBoundingClientRect();
    const inside =
      event.clientX >= box.left &&
      event.clientX <= box.right &&
      event.clientY >= box.top &&
      event.clientY <= box.bottom;
    if (!inside) closeMenu();
  }

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
          onClick={closeOnBackdrop}
        >
          <Hello onNavigate={closeMenu} />

          <nav className="container menu-overlay__nav" aria-label={t("menu.main")}>
            <NavList onNavigate={closeMenu} />
          </nav>

          <div className="container menu-overlay__language">
            <LanguagePicker />
          </div>
        </dialog>,
        document.body,
      )}
    </>
  );
}

// The dark "Hello" bar at the top of the drawer, with the close button.
function Hello({ onNavigate }) {
  const t = useT();
  // Without an AuthProvider (some tests render the nav on its own) there is
  // no session to greet, so the band shows no name and no link.
  const { user, checked } = useAuth() ?? {};

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

// The page links.
function NavList({ onNavigate }) {
  const t = useT();

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
    </ul>
  );
}
