import ContentLibrary from "./pages/ContentLibrary.jsx";

// Page shell: skip link, header, main, footer. Add a router here once there is
// more than one page.
export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="site-header">
        <div className="container site-header__inner">
          <a className="wordmark" href="/">
            T-<span className="wordmark__accent">SMILE</span>
          </a>
          <span className="label label--on-dark">Digital T Levels at Amazon</span>
        </div>
      </header>

      <main id="main" className="container" tabIndex={-1}>
        <ContentLibrary />
      </main>

      <footer className="site-footer">
        <div className="container">
          <p className="label">T-SMILE. Amazon Emerging Talent.</p>
        </div>
      </footer>
    </>
  );
}
