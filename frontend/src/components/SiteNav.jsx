import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation } from "react-router-dom";
import { CloseIcon, MenuIcon } from "./Icons.jsx";

// Site navigation: at every screen width, a menu button in the header opens a
// full-screen overlay. The overlay is a modal <dialog>, so the page behind is
// inert and Escape closes it.
//
// Pages only. Signing in, signing out and the settings all live behind the
// account button in the header (see AccountDropdown.jsx), so there is one
// place to look for them rather than two that have to agree.

const PAGES = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About T-Level" },
  { to: "/t-levels-at-amazon", label: "T-Levels at Amazon" },
  { to: "/resources", label: "T-Level Resources" },
  { to: "/t-level-near-you", label: "Find T-Levels Near You" },
  { to: "/quiz", label: "Quiz" },
  { to: "/help", label: "Help" },
  // Register interest is not a tab: it is a box on the Sign up page, and
  // linked from the homepage, the footer and the pathway pages.
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
          {/* No RisingSubjects here any more: its names are position: fixed,
              so inside a part-width drawer they escaped the panel and drifted
              across the blurred page behind it. */}
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
 * The page links, and nothing else.
 *
 * Sign up, Login and Log out used to sit at the bottom of this list. They are
 * all behind the account button in the header now: the drawer was showing a
 * different answer to "am I signed in?" in a second place, and Log out in
 * particular was one press from every page, which is what moving it onto the
 * Account tab was meant to stop.
 */
function NavList({ onNavigate }) {
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
    </ul>
  );
}
