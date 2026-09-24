import { NavLink } from "react-router-dom";

// Site footer, shown on every page by App.jsx: five link columns grouped by
// purpose, then a copyright bar.
//
// One page per link: every link goes to its own real page, and its label
// says what that page is. tests/footer.test.jsx checks that no two links
// share a page and that every one goes to a route in App.jsx.

const LINK_COLUMNS = [
  {
    heading: "Navigation",
    links: [
      { to: "/", label: "Home" },
      { to: "/pathways", label: "Learning Pathways" },
      // Profile is the Account tab of the settings page (see App.jsx).
      { to: "/accessibility?tab=account", label: "Profile" },
      { to: "/resources", label: "Resources" },
      { to: "/faqs", label: "FAQs" },
    ],
  },
  {
    heading: "Support",
    links: [
      { to: "/contact", label: "Contact Us" },
      { to: "/report-issue", label: "Report an Issue" },
      { to: "/feedback", label: "Feedback" },
      { to: "/accessibility-help", label: "Accessibility Help" },
    ],
  },
  {
    heading: "Legal & Compliance",
    links: [
      { to: "/terms", label: "Terms of Service" },
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/cookies", label: "Cookie Policy" },
      { to: "/data-rights", label: "GDPR / Data Rights" },
    ],
  },
  {
    heading: "Connect",
    links: [
      // The Expression of Interest form, the most important action on the site.
      { to: "/register-interest", label: "Register your interest" },
      { to: "/register", label: "Sign up" },
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
            T-SMILE helps students, parents and teachers explore T-Levels and the Digital T-Level
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

      </div>

      <div className="container footer-bottom">
        <p className="label">
          &copy; {new Date().getFullYear()} T-SMILE. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
