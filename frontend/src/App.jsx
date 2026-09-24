import { useLayoutEffect } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import amazonLogo from "./assets/amazon-wordmark.png";
import ChatWidget from "./assistant/ChatWidget.jsx";
import AccountDropdown from "./components/AccountDropdown.jsx";
import Footer from "./components/Footer.jsx";
import PageTitle from "./components/PageTitle.jsx";
import SiteNav from "./components/SiteNav.jsx";
import About from "./pages/About.jsx";
import Accessibility from "./pages/Accessibility.jsx";
import AccessibilityHelp from "./pages/AccessibilityHelp.jsx";
import Contact from "./pages/Contact.jsx";
import Cookies from "./pages/Cookies.jsx";
import DataRights from "./pages/DataRights.jsx";
import Faqs from "./pages/Faqs.jsx";
import Feedback from "./pages/Feedback.jsx";
import GetInvolved from "./pages/GetInvolved.jsx";
import ContentLibrary from "./pages/ContentLibrary.jsx";
import Help from "./pages/Help.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import NearYou from "./pages/NearYou.jsx";
import Pathways from "./pages/Pathways.jsx";
import Privacy from "./pages/Privacy.jsx";
import Quiz from "./pages/Quiz.jsx";
import Register from "./pages/Register.jsx";
import RegisterInterest from "./pages/RegisterInterest.jsx";
import StaffDashboard from "./pages/StaffDashboard.jsx";
import ReportIssue from "./pages/ReportIssue.jsx";
import Terms from "./pages/Terms.jsx";
import TLevels from "./pages/TLevels.jsx";
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

          {/* Third column, balancing the menu button on the left. Empty until
              someone is signed in, when it shows the account menu. */}
          <AccountDropdown />
        </div>
      </header>

      <main id="main" className="container" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<PageTitle title="Home"><Home /></PageTitle>} />
          <Route path="/about" element={<PageTitle title="About T-Level"><About /></PageTitle>} />
          <Route path="/t-levels-at-amazon" element={<PageTitle title="T-Levels at Amazon"><TLevelsAtAmazon /></PageTitle>} />
          <Route path="/resources" element={<PageTitle title="T-Level Resources"><ContentLibrary /></PageTitle>} />
          <Route path="/t-level-near-you" element={<PageTitle title="T-Level Near You"><NearYou /></PageTitle>} />
          <Route path="/t-levels" element={<PageTitle title="All T-Levels"><TLevels /></PageTitle>} />
          <Route path="/get-involved" element={<PageTitle title="Get involved"><GetInvolved /></PageTitle>} />
          <Route path="/quiz" element={<PageTitle title="Quiz"><Quiz /></PageTitle>} />
          <Route path="/help" element={<PageTitle title="Help"><Help /></PageTitle>} />
          <Route path="/register-interest" element={<PageTitle title="Register interest"><RegisterInterest /></PageTitle>} />
          <Route path="/pathways" element={<PageTitle title="Learning Pathways"><Pathways /></PageTitle>} />
          <Route path="/faqs" element={<PageTitle title="FAQs"><Faqs /></PageTitle>} />
          <Route path="/register" element={<PageTitle title="Sign up"><Register /></PageTitle>} />
          <Route path="/login" element={<PageTitle title="Login"><Login /></PageTitle>} />
          {/* Linked from the footer. */}
          <Route path="/terms" element={<PageTitle title="Terms of Service"><Terms /></PageTitle>} />
          <Route path="/privacy" element={<PageTitle title="Privacy Policy"><Privacy /></PageTitle>} />
          <Route path="/cookies" element={<PageTitle title="Cookie Policy"><Cookies /></PageTitle>} />
          <Route path="/data-rights" element={<PageTitle title="GDPR and data rights"><DataRights /></PageTitle>} />
          <Route path="/accessibility-help" element={<PageTitle title="Accessibility help"><AccessibilityHelp /></PageTitle>} />
          <Route path="/report-issue" element={<PageTitle title="Report an issue"><ReportIssue /></PageTitle>} />
          <Route path="/accessibility" element={<PageTitle title="Accessibility"><Accessibility /></PageTitle>} />
          <Route path="/contact" element={<PageTitle title="Contact us"><Contact /></PageTitle>} />
          <Route path="/feedback" element={<PageTitle title="Feedback"><Feedback /></PageTitle>} />
          {/* Amazon staff only. The page itself sends anyone else to "/", and
              the API behind it refuses them regardless. */}
          <Route path="/staff" element={<PageTitle title="Submissions"><StaffDashboard /></PageTitle>} />
          {/* /account is gone: profile and accessibility settings live at /accessibility now. */}
          <Route path="/account" element={<Navigate to="/accessibility" replace />} />
          <Route path="*" element={<PageTitle title="Page not found"><NotFound /></PageTitle>} />
        </Routes>
      </main>

      <Footer />

      {/* On every page, outside <main> so it is not part of the page
          content and comes last in the keyboard order. */}
      <ChatWidget />
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
