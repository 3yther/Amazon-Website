
import React from 'react';

export default function Accessibility() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 text-gray-900">
      <article className="prose prose-slate max-w-none">
        <h1 className="text-3xl font-extrabold mb-4">Accessibility Statement</h1>
        <p className="text-sm text-gray-500 mb-8">Target Standard: WCAG 2.2 AA Compliance</p>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Our Commitment</h2>
          <p className="text-gray-700">
            Amazon T-SMILE is dedicated to making this portal accessible to everyone, including users relying on screen readers, keyboard navigation, or assistive technologies.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Accessibility Features</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li><strong>Keyboard Navigation:</strong> All form elements, buttons, and links feature high-visibility focus rings.</li>
            <li><strong>ARIA Live Regions:</strong> Dynamic content updates announce automatically via <code>aria-live="polite"</code>.</li>
            <li><strong>Semantic HTML:</strong> Pages use standard landmarks (<code>&lt;main&gt;</code>, <code>&lt;header&gt;</code>, <code>&lt;section&gt;</code>, <code>&lt;nav&gt;</code>) for straightforward screen reader navigation.</li>
          </ul>
        </section>
      </article>
    </main>
  );
}

import { Link, useSearchParams } from "react-router-dom";
import TabNav from "../components/TabNav.jsx";
import AccountSettings from "../components/accessibility/AccountSettings.jsx";
import DisplaySettings from "../components/accessibility/DisplaySettings.jsx";
import LanguageSettings from "../components/accessibility/LanguageSettings.jsx";
import SecuritySettings from "../components/accessibility/SecuritySettings.jsx";
import SightLossSettings from "../components/accessibility/SightLossSettings.jsx";
import { useAuth } from "../auth.jsx";
import { useAccessibilityPreferences } from "../hooks/useAccessibilityPreferences.js";

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
