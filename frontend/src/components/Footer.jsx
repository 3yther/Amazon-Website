import { NavLink } from "react-router-dom";

// Site footer, shown on every page by App.jsx: the legal and help links,
// then a plain copyright line.

const LINKS = [
  { to: "/terms", label: "Terms and Conditions" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/help", label: "Help" },
  { to: "/accessibility", label: "Accessibility" },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <nav aria-label="Footer">
          <ul className="site-footer__links">
            {LINKS.map((link) => (
              <li key={link.to}>
                {/* NavLink adds aria-current="page" to the link for the current route. */}
                <NavLink to={link.to}>{link.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* The year comes from the visitor's clock, so it never goes stale. */}
        <p className="label">&copy; {new Date().getFullYear()} T-SMILE</p>
      </div>
    </footer>
  );
}
