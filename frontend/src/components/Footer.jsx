import { NavLink } from "react-router-dom";
import { useT } from "../i18n/I18nProvider.jsx";

// Site footer, shown on every page by App.jsx: five link columns grouped by
// purpose, then a copyright bar.
//
// One page per link: every link goes to its own real page, and its label
// says what that page is. tests/footer.test.jsx checks that no two links
// share a page and that every one goes to a route in App.jsx.
//
// Headings and labels are translation keys (i18n/messages, footer).

const LINK_COLUMNS = [
  {
    heading: "footer.navigation",
    links: [
      { to: "/", label: "footer.links.home" },
      { to: "/pathways", label: "footer.links.pathways" },
      // Profile is the Account tab of the settings page (see App.jsx).
      { to: "/accessibility?tab=account", label: "footer.links.profile" },
      { to: "/resources", label: "footer.links.resources" },
      { to: "/faqs", label: "footer.links.faqs" },
      { to: "/community", label: "footer.links.community" },
    ],
  },
  {
    heading: "footer.support",
    links: [
      { to: "/contact", label: "footer.links.contact" },
      { to: "/report-issue", label: "footer.links.reportIssue" },
      { to: "/feedback", label: "footer.links.feedback" },
      { to: "/accessibility-help", label: "footer.links.accessibilityHelp" },
    ],
  },
  {
    heading: "footer.legal",
    links: [
      { to: "/terms", label: "footer.links.terms" },
      { to: "/privacy", label: "footer.links.privacy" },
      { to: "/cookies", label: "footer.links.cookies" },
      { to: "/data-rights", label: "footer.links.dataRights" },
    ],
  },
  {
    heading: "footer.connect",
    links: [
      // The Expression of Interest form, the most important action on the site.
      { to: "/register-interest", label: "footer.links.registerInterest" },
      { to: "/register", label: "footer.links.signUp" },
    ],
  },
];

export default function Footer() {
  const t = useT();

  return (
    <footer className="site-footer">
      <div className="container footer-content">
        <div className="footer-column">
          <p className="label">{t("footer.about")}</p>
          {/* TODO: copy review - placeholder description */}
          <p>{t("footer.aboutText")}</p>
        </div>

        {LINK_COLUMNS.map((column) => (
          <nav className="footer-column" aria-label={t(column.heading)} key={column.heading}>
            <p className="label">{t(column.heading)}</p>
            <ul>
              {column.links.map((link) => (
                <li key={link.label}>
                  {/* NavLink adds aria-current="page" to the link for the current route. */}
                  <NavLink to={link.to} end={link.to === "/"}>
                    {t(link.label)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="container footer-bottom">
        <p className="label">{t("footer.copyright", { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  );
}
