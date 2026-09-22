import { useLayoutEffect } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import amazonLogo from "./assets/amazon-wordmark.png";
import Footer from "./components/Footer.jsx";
import PageTitle from "./components/PageTitle.jsx";
import SiteNav from "./components/SiteNav.jsx";
import About from "./pages/About.jsx";
import Accessibility from "./pages/Accessibility.jsx";
import ContentLibrary from "./pages/ContentLibrary.jsx";
import Help from "./pages/Help.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import NearYou from "./pages/NearYou.jsx";
import Privacy from "./pages/Privacy.jsx";
import Register from "./pages/Register.jsx";
import Terms from "./pages/Terms.jsx";
import TLevelsAtAmazon from "./pages/TLevelsAtAmazon.jsx";

// Page shell: skip link, header, main, footer. The page inside <main> comes
// from the current route, and each route sets its own browser tab title.
export default function App() {
  const { pathname } = useLocation();

  // Start each new page at the top, as a normal page load would. Runs before
  // the pages' own effects, so a page can still choose where to scroll.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="site-header">
        <div className="container site-header__inner">
          {/* Menu button first, so it sits in the left corner and comes first
              in the keyboard order too. */}
          <SiteNav />

          <div className="site-header__brand">
            {/* Approved logo file, used unaltered: transparent, sitting
                straight on the dark header. */}
            <img className="site-header__logo" src={amazonLogo} alt="Amazon" width="95" height="53" />
            <Link className="wordmark" to="/">
              T-<span className="wordmark__accent">SMILE</span>
            </Link>
          </div>
        </div>
      </header>

      <main id="main" className="container" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<PageTitle title="Home"><Home /></PageTitle>} />
          <Route path="/about" element={<PageTitle title="About T-Level"><About /></PageTitle>} />
          <Route path="/t-levels-at-amazon" element={<PageTitle title="T-Levels at Amazon"><TLevelsAtAmazon /></PageTitle>} />
          <Route path="/resources" element={<PageTitle title="T-Level Resources"><ContentLibrary /></PageTitle>} />
          <Route path="/t-level-near-you" element={<PageTitle title="T-Level Near you"><NearYou /></PageTitle>} />
          <Route path="/help" element={<PageTitle title="Help"><Help /></PageTitle>} />
          <Route path="/register" element={<PageTitle title="Sign up"><Register /></PageTitle>} />
          <Route path="/login" element={<PageTitle title="Login"><Login /></PageTitle>} />
          {/* Linked from the footer. */}
          <Route path="/terms" element={<PageTitle title="Terms and Conditions"><Terms /></PageTitle>} />
          <Route path="/privacy" element={<PageTitle title="Privacy Policy"><Privacy /></PageTitle>} />
          <Route path="/accessibility" element={<PageTitle title="Accessibility"><Accessibility /></PageTitle>} />
          {/* Earlier placeholder addresses, sent on to About. */}
          <Route path="/t-levels" element={<Navigate to="/about" replace />} />
          <Route path="/get-involved" element={<Navigate to="/about" replace />} />
          <Route path="*" element={<PageTitle title="Page not found"><NotFound /></PageTitle>} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}

function NotFound() {
  return (
    <section className="intro" aria-labelledby="page-title">
      <p className="label">Error 404</p>
      <h1 id="page-title">Page not found</h1>
      <p className="lead">
        <Link to="/resources">Go to the content library</Link>
      </p>
    </section>
  );
}
