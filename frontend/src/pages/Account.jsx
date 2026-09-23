import { Link } from "react-router-dom";

// Placeholder until the full account page is built. Profile and security are
// already editable from the accessibility settings tabs, so this links there
// rather than repeating them.
export default function Account() {
  return (
    <section className="intro" aria-labelledby="page-title">
      <p className="label">Account</p>
      <h1 id="page-title">My account</h1>
      <p className="lead">
        A dedicated account page is coming soon. Until then, manage your profile and password from{" "}
        <Link to="/accessibility">Accessibility Settings</Link>.
      </p>
    </section>
  );
}
