import { useLayoutEffect } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import amazonLogo from "./assets/amazon-wordmark.png";
import ChatWidget from "./assistant/ChatWidget.jsx";
import { reportEasterEgg } from "./assistant/assistantBus.js";
import AccountDropdown from "./components/AccountDropdown.jsx";
import Footer from "./components/Footer.jsx";
import PageTitle from "./components/PageTitle.jsx";
import SiteNav from "./components/SiteNav.jsx";
import { useT } from "./i18n/I18nProvider.jsx";
import TranslationNotice from "./i18n/TranslationNotice.jsx";
import About from "./pages/About.jsx";
import Accessibility from "./pages/Accessibility.jsx";
import AccessibilityHelp from "./pages/AccessibilityHelp.jsx";
import Contact from "./pages/Contact.jsx";
import Cookies from "./pages/Cookies.jsx";
import DataRights from "./pages/DataRights.jsx";
import Community from "./pages/Community.jsx";
import CommunityAsk from "./pages/CommunityAsk.jsx";
import CommunityQuestion from "./pages/CommunityQuestion.jsx";
import Faqs from "./pages/Faqs.jsx";
import Feedback from "./pages/Feedback.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
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
import ResetPassword from "./pages/ResetPassword.jsx";
import StaffDashboard from "./pages/StaffDashboard.jsx";
import ReportIssue from "./pages/ReportIssue.jsx";
import Terms from "./pages/Terms.jsx";
import TLevels from "./pages/TLevels.jsx";
import TLevelsAtAmazon from "./pages/TLevelsAtAmazon.jsx";

// Page shell: skip link, header, main, footer. The page inside <main> comes
// from the current route, and each route sets its own browser tab title.
export default function App() {
  const { pathname } = useLocation();
  const t = useT();

  // Start each new page at the top, as a normal page load would. Runs before
  // the pages' own effects, so a page can still choose where to scroll.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <a className="skip-link" href="#main">
        {t("shell.skip")}
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
            <Link className="wordmark" to="/" onClick={countWordmarkClick}>
              T-<span className="wordmark__accent">SMILE</span>
            </Link>
          </div>

          {/* Third column, balancing the menu button on the left: the account
              menu, which also holds the language menu. */}
          <div className="site-header__end">
            <AccountDropdown />
          </div>
        </div>
      </header>

      <TranslationNotice pathname={pathname} />

      <main id="main" className="container" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<PageTitle title="Home"><Home /></PageTitle>} />
          <Route path="/about" element={<PageTitle title="About T-Level"><About /></PageTitle>} />
          <Route path="/t-levels-at-amazon" element={<PageTitle title="T-Levels at Amazon"><TLevelsAtAmazon /></PageTitle>} />
          <Route path="/resources" element={<PageTitle title="T-Level Resources"><ContentLibrary /></PageTitle>} />
          <Route path="/t-level-near-you" element={<PageTitle title="Find T-Levels Near You"><NearYou /></PageTitle>} />
          <Route path="/t-levels" element={<PageTitle title="All T-Levels"><TLevels /></PageTitle>} />
          <Route path="/get-involved" element={<PageTitle title="Get involved"><GetInvolved /></PageTitle>} />
          <Route path="/quiz" element={<PageTitle title="Quiz"><Quiz /></PageTitle>} />
          <Route path="/help" element={<PageTitle title="Help"><Help /></PageTitle>} />
          <Route path="/register-interest" element={<PageTitle title="Register interest"><RegisterInterest /></PageTitle>} />
          <Route path="/pathways" element={<PageTitle title="Learning Pathways"><Pathways /></PageTitle>} />
          <Route path="/faqs" element={<PageTitle title="FAQs"><Faqs /></PageTitle>} />
          {/* "ask" before ":id", so /community/ask is never read as a question number. */}
          <Route path="/community" element={<PageTitle title="Community"><Community /></PageTitle>} />
          <Route path="/community/ask" element={<PageTitle title="Ask the Community"><CommunityAsk /></PageTitle>} />
          <Route path="/community/:id" element={<PageTitle title="Community question"><CommunityQuestion /></PageTitle>} />
          <Route path="/register" element={<PageTitle title="Sign up"><Register /></PageTitle>} />
          <Route path="/login" element={<PageTitle title="Login"><Login /></PageTitle>} />
          <Route path="/forgot-password" element={<PageTitle title="Forgotten password"><ForgotPassword /></PageTitle>} />
          <Route path="/reset-password" element={<PageTitle title="Reset password"><ResetPassword /></PageTitle>} />
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
          {/* old link, settings are on /accessibility now */}
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

// An easter egg: click the T-SMILE name five times quickly and Smiley says
// hello. Each click still goes home as normal.
let wordmarkClicks = [];

function countWordmarkClick() {
  const now = Date.now();
  wordmarkClicks = [...wordmarkClicks.filter((time) => now - time < 2500), now];
  if (wordmarkClicks.length >= 5) {
    wordmarkClicks = [];
    reportEasterEgg("wordmark");
  }
}

function NotFound() {
  const t = useT();
  return (
    <section className="intro" aria-labelledby="page-title">
      <p className="label">{t("shell.error404")}</p>
      <h1 id="page-title">{t("shell.notFound")}</h1>
      <p className="lead">
        <Link to="/resources">{t("shell.toLibrary")}</Link>
      </p>
    </section>
  );
}
