import { Link, useSearchParams } from "react-router-dom";
import TabNav from "../components/TabNav.jsx";
import AccountSettings from "../components/accessibility/AccountSettings.jsx";
import DisplaySettings from "../components/accessibility/DisplaySettings.jsx";
import LanguageSettings from "../components/accessibility/LanguageSettings.jsx";
import SecuritySettings from "../components/accessibility/SecuritySettings.jsx";
import SightLossSettings from "../components/accessibility/SightLossSettings.jsx";
import { useAuth } from "../auth.jsx";
import { useAccessibilityPreferences } from "../hooks/useAccessibilityPreferences.jsx";
import { useT } from "../i18n/I18nProvider.jsx";

const TAB_IDS = ["sight-loss", "display", "language", "security", "account"];

function SignInPrompt() {
  const t = useT();

  return (
    <p>
      <Link to="/login">{t("settings.signInPrompt")}</Link>
    </p>
  );
}

/**
 * Settings that change how the site looks and behaves. Sight, display and
 * language settings work for anyone, signed in or not (they live in
 * localStorage either way, see useAccessibilityPreferences). Security and
 * account settings need a session, since they change the account itself.
 * Wording is in i18n/messages (settings).
 */
export default function Accessibility() {
  const t = useT();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, checked } = useAuth();
  const { preferences, updatePreference } = useAccessibilityPreferences();

  const requestedTab = searchParams.get("tab");
  const activeId = TAB_IDS.includes(requestedTab) ? requestedTab : "sight-loss";
  const signedIn = checked && Boolean(user);

  function setActiveId(id) {
    setSearchParams(id === "sight-loss" ? {} : { tab: id }, { replace: true });
  }

  const tabs = [
    {
      id: "sight-loss",
      label: t("settings.tabs.sightLoss"),
      content: <SightLossSettings preferences={preferences} updatePreference={updatePreference} />,
    },
    {
      id: "display",
      label: t("settings.tabs.display"),
      content: <DisplaySettings preferences={preferences} updatePreference={updatePreference} />,
    },
    {
      id: "language",
      label: t("settings.tabs.language"),
      content: <LanguageSettings />,
    },
    {
      id: "security",
      label: t("settings.tabs.security"),
      content: signedIn ? <SecuritySettings lastChanged={user?.last_password_changed} /> : <SignInPrompt />,
    },
    {
      id: "account",
      label: t("settings.tabs.account"),
      content: signedIn ? <AccountSettings /> : <SignInPrompt />,
    },
  ];

  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">{t("settings.label")}</p>
        <h1 id="page-title">{t("settings.title")}</h1>
        <p className="lead">{t("settings.lead")}</p>
      </section>

      <TabNav tabs={tabs} activeId={activeId} onChange={setActiveId} />
    </>
  );
}
