import { NavLink } from "react-router-dom";

// Site footer, shown on every page by App.jsx: five link columns grouped by
// purpose, then a copyright bar. Links marked TODO point somewhere sensible
// for now (an existing page, or a placeholder) rather than nowhere, and are
// meant to be revisited once the real page or address exists.

const SUPPORT_EMAIL = "hello@t-smile.co.uk"; // TODO: confirm the team's real support address

const LINK_COLUMNS = [
  {
    heading: "Navigation",
    links: [
      { to: "/", label: "Dashboard" },
      { to: "/t-levels-at-amazon", label: "Learning Pathways" },
      { to: "/accessibility", label: "Profile" },
      { to: "/resources", label: "Resources" },
      { to: "/help", label: "FAQs" },
    ],
  },
  {
    heading: "Support",
    links: [
      { to: "/contact", label: "Contact Us" },
      { to: "/contact", label: "Report an Issue" }, // TODO: point at a real issue tracker once one exists
      { to: "/feedback", label: "Feedback" },
      { to: "/accessibility", label: "Accessibility Help" },
    ],
  },
  {
    heading: "Legal & Compliance",
    links: [
      { to: "/terms", label: "Terms of Service" },
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/", label: "Cookie Policy" }, // TODO: no cookie policy page yet
      { to: "/", label: "GDPR / Data Rights" }, // TODO: no data rights page yet
    ],
  },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-content">
        <div className="footer-column">
          <p className="label">About</p>
          {/* TODO: copy review - placeholder description */}
          <p>
            T-SMILE helps students, parents and teachers explore T Levels and the Digital T Level
            at Amazon, with free and sign-up resources in one place.
          </p>
        </div>

        {LINK_COLUMNS.map((column) => (
          <nav className="footer-column" aria-label={column.heading} key={column.heading}>
            <p className="label">{column.heading}</p>
            <ul>
              {column.links.map((link) => (
                <li key={link.label}>
                  {/* NavLink adds aria-current="page" to the link for the current route. */}
                  <NavLink to={link.to} end={link.to === "/"}>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="footer-column">
          <p className="label">Connect</p>
          <ul>
            <li>
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <p className="label">
          &copy; {new Date().getFullYear()} T-SMILE. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
