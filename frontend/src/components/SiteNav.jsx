import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../api.js";
import { useAuth } from "../auth.jsx";
import { CloseIcon, MenuIcon } from "./Icons.jsx";
import RisingSubjects from "./RisingSubjects.jsx";

// Site navigation: at every screen width, a menu button in the header opens a
// full-screen overlay. The overlay is a modal <dialog>, so the page behind is
// inert and Escape closes it.

const PAGES = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About T-Level" },
  { to: "/t-levels-at-amazon", label: "T-Levels at Amazon" },
  { to: "/resources", label: "T-Level Resources" },
  { to: "/t-level-near-you", label: "T-Level Near you" },
  { to: "/help", label: "Help" },
];

export default function SiteNav() {
  const location = useLocation();
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
        // The opening animation grows out of the menu button (see styles.css).
        const button = menuButton.current.getBoundingClientRect();
        const x = button.left + button.width / 2;
        const y = button.top + button.height / 2;
        dialog.style.setProperty("--menu-origin", `${x}px ${y}px`);
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
        aria-label="Menu"
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
          aria-label="Menu"
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
          <RisingSubjects />
          <div className="container menu-overlay__top">
            <button
              type="button"
              className="button menu-overlay__close"
              aria-label="Close menu"
              onClick={closeMenu}
            >
              <CloseIcon />
            </button>
          </div>
          <nav className="container menu-overlay__nav" aria-label="Main">
            <NavList onNavigate={closeMenu} />
          </nav>
        </dialog>,
        document.body,
      )}
    </>
  );
}

/**
 * The page links, then Sign up and Login. Once someone is signed in those two
 * are replaced by Log out, which is the only way to sign out.
 */
function NavList({ onNavigate }) {
  const navigate = useNavigate();
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
            {page.label}
          </NavLink>
        </li>
      ))}

      {/* Nothing until the first session check, so the wrong links never flash up. */}
      {checked && !user && (
        <>
          <li style={order(PAGES.length)}>
            <NavLink to="/register" onClick={onNavigate}>
              Sign up
            </NavLink>
          </li>
          <li style={order(PAGES.length + 1)}>
            <NavLink to="/login" onClick={onNavigate}>
              Login
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
            {status === "submitting" ? "Logging out" : "Log out"}
          </button>
        </li>
      )}
    </ul>
  );
}
