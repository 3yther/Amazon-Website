import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./auth.jsx";
import { AccessibilityPreferencesProvider } from "./hooks/useAccessibilityPreferences.jsx";
import { I18nProvider } from "./i18n/I18nProvider.jsx";
import "./styles.css";
import "./i18n/i18n.css";

// Accessibility preferences sit above every page, inside AuthProvider because
// a signed-in user's settings come from their account. They used to be held
// by the Accessibility page itself, which meant they only applied while that
// page was open: high contrast, the theme and the rest all vanished on the
// next reload.
//
// The language sits inside AuthProvider for the same reason, so a signed-in
// visitor's saved language follows them.
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
