import { useEffect, useState } from "react";

const MOBILE_QUERY = "(max-width: 767px)";

/** True on a phone-width screen. Follows the viewport live, like useReducedMotion. */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return isMobile;
}

// Tabs down the side on desktop, a scrolling row on tablet and accordions on
// mobile. tabs is [{ id, label, content }].
export default function TabNav({ tabs, activeId, onChange }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="tab-nav tab-nav--accordion">
        {tabs.map((tab) => (
          <details
            key={tab.id}
            open={tab.id === activeId}
            onToggle={(event) => {
              if (event.target.open) onChange(tab.id);
            }}
          >
            <summary>{tab.label}</summary>
            <div className="tab-nav__panel">{tab.content}</div>
          </details>
        ))}
      </div>
    );
  }

  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  return (
    <div className="tab-nav">
      <div className="tab-nav__list" role="tablist" aria-orientation="vertical">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={tab.id === active.id}
            aria-controls={`panel-${tab.id}`}
            className="tab-nav__tab"
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        className="tab-nav__panel"
        role="tabpanel"
        id={`panel-${active.id}`}
        aria-labelledby={`tab-${active.id}`}
        tabIndex={0}
      >
        {active.content}
      </div>
    </div>
  );
}
