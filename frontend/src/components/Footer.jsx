import { NavLink } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { useT } from "../i18n/I18nProvider.jsx";

// Footer on every page: five columns of links and a copyright bar.
// tests/footer.test.jsx checks every link goes to a real page.

const LINK_COLUMNS = [
  {
    heading: "footer.navigation",
    links: [
      { to: "/", label: "footer.links.home" },
      { to: "/pathways", label: "footer.links.pathways" },
      { to: "/t-levels", label: "footer.links.allTLevels" },
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
      { to: "/get-involved", label: "footer.links.getInvolved" },
      { to: "/register", label: "footer.links.signUp" },
    ],
  },
];

/**
 * The Admin Portal, the one link in this footer that is not for everybody.
 *
 * Shown only to signed-in Amazon staff, the same condition AccountDropdown
 * uses for its own staff link. Hiding it is tidiness, not security: the page
 * redirects anyone else away and every endpoint behind it refuses them, PIN
 * or no PIN.
 */
const STAFF_LINK = { to: "/admin-portal", label: "admin.title" };

export default function Footer() {
  const t = useT();
  // No provider above this in some tests, hence the optional chaining.
  const isStaff = useAuth()?.user?.user_type === "amazon_staff";

  const columns = LINK_COLUMNS.map((column) =>
    column.heading === "footer.navigation" && isStaff
      ? { ...column, links: [...column.links, STAFF_LINK] }
      : column,
  );

  return (
    <footer className="site-footer">
      <div className="container footer-content">
        <div className="footer-column">
          <p className="label">{t("footer.about")}</p>
          <p>{t("footer.aboutText")}</p>
        </div>

        {columns.map((column) => (
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
