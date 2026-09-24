import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import ContentLibrary from "./pages/ContentLibrary.jsx";
import TLevelsNearYou from "./pages/TLevelsNearYou.jsx";
import TermsAndConditions from "./pages/legal/TermsAndConditions.jsx";
import AccessibilityStatement from "./pages/legal/AccessibilityStatement.jsx";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy.jsx";

// Page shell: skip link, header (brand row + nav row), main, footer.
export default function App() {
  return (
    <BrowserRouter>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="site-header">
        <div className="container site-header__inner">
          <NavLink className="wordmark" to="/">
            T-<span className="wordmark__accent">SMILE</span>
          </NavLink>
          <span className="label label--on-dark">Digital T Levels at Amazon</span>
        </div>
        <nav aria-label="Primary" className="container site-nav-row">
          <ul className="site-nav">
            <li>
              <NavLink to="/" end>
                Content library
              </NavLink>
            </li>
            <li>
              <NavLink to="/t-levels-near-you">T Levels near you</NavLink>
            </li>
          </ul>
        </nav>
      </header>

      <main id="main" className="container" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<ContentLibrary />} />
          <Route path="/t-levels-near-you" element={<TLevelsNearYou />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/accessibility" element={<AccessibilityStatement />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <div className="container site-footer__inner">
          <p className="label">T-SMILE. Amazon Emerging Talent.</p>
          <nav aria-label="Legal">
            <ul className="footer-nav">
              <li>
                <NavLink to="/terms">Terms</NavLink>
              </li>
              <li>
                <NavLink to="/accessibility">Accessibility</NavLink>
              </li>
              <li>
                <NavLink to="/privacy">Privacy</NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </footer>
    </BrowserRouter>
  );
}
