import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "../api.js";
import { useAuth } from "../auth.jsx";
import { formatDate } from "../formats.js";
import { useT } from "../i18n/I18nProvider.jsx";
import { BellIcon } from "./Icons.jsx";

// Checks for new notifications this often while the page is open.
const CHECK_EVERY_MS = 10000;

// The bell in the header. Only shown when signed in. Which kinds of
// notification arrive is set on the Notifications tab in Settings.
export default function NotificationBell() {
  const t = useT();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ unread: 0, results: [] });
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const panelId = useId();

  const load = useCallback(() => {
    getNotifications()
      .then(setData)
      .catch(() => {}); // keep what we had if the server can't be reached
  }, []);

  // Check straight away, then every few seconds while the tab is open, and
  // again as soon as someone comes back to the tab.
  useEffect(() => {
    if (!user) return undefined;
    load();
    const timer = window.setInterval(() => {
      if (!document.hidden) load();
    }, CHECK_EVERY_MS);
    function onVisible() {
      if (!document.hidden) load();
    }
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [user, load]);

  // Close on a click outside or on Escape.
  useEffect(() => {
    if (!open) return undefined;
    function onClick(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    function onKey(event) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  function toggle() {
    if (!open) load();
    setOpen((current) => !current);
  }

  async function markAll() {
    await markAllNotificationsRead().catch(() => {});
    setData((current) => ({ unread: 0, results: current.results.map((n) => ({ ...n, read: true })) }));
  }

  function openOne(notification) {
    setOpen(false);
    if (!notification.read) {
      markNotificationRead(notification.id).catch(() => {});
      setData((current) => ({
        unread: Math.max(0, current.unread - 1),
        results: current.results.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
      }));
    }
  }

  return (
    <div className="notification-bell" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="notification-bell__button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={t("notifications.open", { count: data.unread })}
        onClick={toggle}
      >
        <BellIcon />
        {data.unread > 0 && (
          <span className="notification-bell__count" aria-hidden="true">
            {data.unread > 9 ? "9+" : data.unread}
          </span>
        )}
      </button>

      {open && (
        <div id={panelId} className="notification-bell__panel">
          <div className="notification-bell__head">
            <p className="label">{t("notifications.label")}</p>
            {data.unread > 0 && (
              <button type="button" className="notification-bell__mark" onClick={markAll}>
                {t("notifications.markAll")}
              </button>
            )}
          </div>

          {data.results.length === 0 ? (
            <p className="notification-bell__empty">{t("notifications.none")}</p>
          ) : (
            <ul className="notification-bell__list">
              {data.results.map((notification) => {
                const words = t(`notifications.events.${notification.event}`, { text: notification.text });
                const inner = (
                  <>
                    <span className="notification-bell__text">
                      {!notification.read && <span className="sr-only">{t("notifications.unread")}: </span>}
                      {words}
                    </span>
                    <span className="notification-bell__date">{formatDate(notification.created_at)}</span>
                  </>
                );
                const className = notification.read
                  ? "notification-bell__item"
                  : "notification-bell__item notification-bell__item--unread";
                return (
                  <li key={notification.id}>
                    {notification.link ? (
                      <Link className={className} to={notification.link} onClick={() => openOne(notification)}>
                        {inner}
                      </Link>
                    ) : (
                      <button type="button" className={className} onClick={() => openOne(notification)}>
                        {inner}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
