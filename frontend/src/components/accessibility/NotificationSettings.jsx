import { useEffect, useState } from "react";
import { getPreferences, updatePreferences } from "../../api.js";
import { useT } from "../../i18n/I18nProvider.jsx";
import { CheckboxField } from "../FormFields.jsx";

// Which notifications go in the bell. Saved to the account straight away.
const KINDS = [
  { field: "notify_announcements", label: "settings.notifications.announcements" },
  { field: "notify_community", label: "settings.notifications.community" },
  { field: "notify_interest", label: "settings.notifications.interest" },
];

export default function NotificationSettings() {
  const t = useT();
  const [values, setValues] = useState(null); // null until loaded
  const [status, setStatus] = useState("idle"); // idle | saved | error

  useEffect(() => {
    const controller = new AbortController();
    getPreferences({ signal: controller.signal })
      .then(setValues)
      .catch((error) => {
        if (error.name !== "AbortError") setStatus("error");
      });
    return () => controller.abort();
  }, []);

  async function toggle(field, on) {
    setValues((current) => ({ ...current, [field]: on }));
    try {
      await updatePreferences({ [field]: on });
      setStatus("saved");
    } catch {
      setValues((current) => ({ ...current, [field]: !on })); // put it back
      setStatus("error");
    }
  }

  return (
    <div className="settings-section">
      <p className="label">{t("settings.tabs.notifications")}</p>
      <p>{t("settings.notifications.lead")}</p>

      {values &&
        KINDS.map((kind) => (
          <CheckboxField
            key={kind.field}
            id={`pref-${kind.field}`}
            label={t(kind.label)}
            checked={values[kind.field]}
            onChange={(event) => toggle(kind.field, event.target.checked)}
          />
        ))}

      <div role="status">
        {status === "saved" && <p className="field__hint">{t("settings.notifications.saved")}</p>}
        {status === "error" && <p className="field__hint">{t("forms.somethingWrong")}</p>}
      </div>
    </div>
  );
}
