import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./auth.jsx";
import { AccessibilityPreferencesProvider } from "./hooks/useAccessibilityPreferences.jsx";
import { I18nProvider } from "./i18n/I18nProvider.jsx";
import "./styles.css";
import "./i18n/i18n.css";

// Settings and language go inside AuthProvider so a signed-in user's saved choices load on every page.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AccessibilityPreferencesProvider>
          <I18nProvider>
            <App />
          </I18nProvider>
        </AccessibilityPreferencesProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
