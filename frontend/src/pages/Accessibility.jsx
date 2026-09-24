import { Link, useSearchParams } from "react-router-dom";
import TabNav from "../components/TabNav.jsx";
import AccountSettings from "../components/accessibility/AccountSettings.jsx";
import DisplaySettings from "../components/accessibility/DisplaySettings.jsx";
import LanguageSettings from "../components/accessibility/LanguageSettings.jsx";
import SecuritySettings from "../components/accessibility/SecuritySettings.jsx";
import SightLossSettings from "../components/accessibility/SightLossSettings.jsx";
import { useAuth } from "../auth.jsx";
import { useAccessibilityPreferences } from "../hooks/useAccessibilityPreferences.jsx";

const TAB_IDS = ["sight-loss", "display", "language", "security", "account"];

function SignInPrompt() {
  return (
    <p>
      <Link to="/login">Log in</Link> to manage this.
    </p>
  );
}

/**
 * Settings that change how the site looks and behaves. Sight, display and
 * language settings work for anyone, signed in or not (they live in
 * localStorage either way, see useAccessibilityPreferences). Security and
 * account settings need a session, since they change the account itself.
 */
export default function Accessibility() {
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
      label: "Sight and vision",
      content: <SightLossSettings preferences={preferences} updatePreference={updatePreference} />,
    },
    {
      id: "display",
      label: "Display",
      content: <DisplaySettings preferences={preferences} updatePreference={updatePreference} />,
    },
    {
      id: "language",
      label: "Language and region",
      content: <LanguageSettings preferences={preferences} updatePreference={updatePreference} />,
    },
    {
      id: "security",
      label: "Security",
      content: signedIn ? <SecuritySettings lastChanged={user?.last_password_changed} /> : <SignInPrompt />,
    },
    {
      id: "account",
      label: "Account",
      content: signedIn ? <AccountSettings /> : <SignInPrompt />,
    },
  ];

  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">Settings</p>
        <h1 id="page-title">Accessibility</h1>
        <p className="lead">
          Change how T-SMILE looks and behaves for you. Signed in, these settings follow you to any
          device; signed out, they stay on this browser.
        </p>
      </section>

      <TabNav tabs={tabs} activeId={activeId} onChange={setActiveId} />
    </>
  );
}
