import { useT } from "../../i18n/I18nProvider.jsx";

/**
 * The dashboard's navigation: a column down the left on desktop, a drawer you
 * open at the top on a phone.
 *
 * A <nav> of real buttons with aria-current, not a tablist. These change what
 * the whole page is about and they are reflected in the URL, so they behave
 * like navigation and should be announced as navigation. The old TabNav is
 * still right for the small tabbed lists inside a section.
 *
 * The mobile drawer is a <details>, the same pattern the header menu uses, so
 * there is no focus trap to write and no escape-key handling to get wrong:
 * the browser already does all of it.
 */

/** The groups, in the order staff work through them. */
export const SECTIONS = [
  {
    heading: "admin.nav.measure",
    items: [{ id: "overview", label: "admin.tabs.overview" }],
  },
  {
    heading: "admin.nav.people",
    items: [
      { id: "people", label: "admin.tabs.people" },
      { id: "interest", label: "admin.tabs.interest" },
    ],
  },
  {
    heading: "admin.nav.community",
    items: [
      { id: "posts", label: "admin.tabs.posts" },
      { id: "reports", label: "admin.tabs.reports" },
      { id: "feedback", label: "admin.tabs.feedback", badge: "unhandledFeedback" },
    ],
  },
];

export const NAV_IDS = SECTIONS.flatMap((section) => section.items.map((item) => item.id));

function NavList({ activeId, onChange, badges, onNavigate }) {
  const t = useT();

  return SECTIONS.map((section) => (
    <div className="admin-nav__group" key={section.heading}>
      <p className="label admin-nav__heading">{t(section.heading)}</p>
      <ul>
        {section.items.map((item) => {
          const count = item.badge ? badges?.[item.badge] : 0;
          return (
            <li key={item.id}>
              <button
                type="button"
                className="admin-nav__link"
                /* aria-current, not aria-selected: this is navigation. */
                aria-current={item.id === activeId ? "page" : undefined}
                onClick={() => {
                  onChange(item.id);
                  onNavigate?.();
                }}
              >
                {t(item.label)}
                {count > 0 && (
                  <span className="admin-nav__badge">
                    {count}
                    <span className="sr-only"> {t("admin.nav.unhandled")}</span>
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  ));
}

export default function Sidebar({ activeId, onChange, badges, onLock }) {
  const t = useT();

  return (
    <>
      {/* Phone: a drawer, closed by default so the numbers are what you see
          first. Hidden from desktop by CSS, not unmounted, so the choice of
          which one shows stays in one place. */}
      <details className="admin-nav__drawer">
        <summary>{t("admin.nav.menu")}</summary>
        <nav aria-label={t("admin.nav.label")}>
          <NavList
            activeId={activeId}
            onChange={onChange}
            badges={badges}
            /* Closing it on choice: leaving a full-height drawer open over
               the thing you just asked to see is the classic mobile bug. */
            onNavigate={() => {
              document.querySelector(".admin-nav__drawer")?.removeAttribute("open");
            }}
          />
        </nav>
      </details>

      <nav className="admin-nav" aria-label={t("admin.nav.label")}>
        <NavList activeId={activeId} onChange={onChange} badges={badges} />

        <div className="admin-nav__group">
          <p className="label admin-nav__heading">{t("admin.nav.session")}</p>
          <ul>
            <li>
              <button type="button" className="admin-nav__link" onClick={onLock}>
                {t("admin.lockAgain")}
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
