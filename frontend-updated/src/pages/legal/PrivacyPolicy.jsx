// Starting point only, not legal advice - have it reviewed before publishing.
// Worded to match what's planned rather than asserting unbuilt infra as live.
// Update section 6 once hosting is actually wired up.

import LegalPageLayout from "../../components/legal/LegalPageLayout.jsx";

const SECTIONS = [
  { id: "who", label: "1. Who we are" },
  { id: "data", label: "2. Data we collect" },
  { id: "guest", label: "3. Guest and session tracking" },
  { id: "use", label: "4. How we use your data" },
  { id: "basis", label: "5. Our lawful basis" },
  { id: "sharing", label: "6. Who we share data with" },
  { id: "retention", label: "7. How long we keep data" },
  { id: "rights", label: "8. Your rights" },
  { id: "cookies", label: "9. Cookies and local storage" },
  { id: "contact", label: "10. Contact and complaints" },
];

export default function PrivacyPolicy() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="24 September 2026" sections={SECTIONS}>
      <section id="who">
        <h2>1. Who we are</h2>
        <p>T-SMILE, the T Level Student Engagement Portal, is a project for Amazon's Emerging Talent programme. [Organisation] is the data controller for the personal data described here.</p>
      </section>

      <section id="data">
        <h2>2. Data we collect</h2>
        <ul>
          <li>account details: name, email, and user type (student, parent, teacher or Amazon staff)</li>
          <li>expressions of interest you submit</li>
          <li>messages sent through the chat feature, where enabled</li>
          <li>basic technical data such as browser type, for keeping the site working</li>
        </ul>
      </section>

      <section id="guest">
        <h2>3. Guest and session tracking</h2>
        <p>If you use T-SMILE without an account, your browser gets a random session ID, stored in local storage, so your expressions of interest and chat history can be linked together during a visit. It does not identify you personally, and you do not need to register to use it.</p>
      </section>

      <section id="use">
        <h2>4. How we use your data</h2>
        <p>We use your data to run T-SMILE, respond to expressions of interest, and understand how the site is used so we can improve it.</p>
      </section>

      <section id="basis">
        <h2>5. Our lawful basis</h2>
        <p>We rely on legitimate interests to run and improve the site, consent where you have opted in, and steps taken at your request, such as arranging work experience.</p>
      </section>

      <section id="sharing">
        <h2>6. Who we share data with</h2>
        <p>T-SMILE is built to run on Amazon Web Services (AWS) infrastructure. Where AWS services are used to host our data, they process it on our behalf and do not use it for their own purposes.</p>
      </section>

      <section id="retention">
        <h2>7. How long we keep data</h2>
        <p>We keep account and expression of interest data while your account is active, and for a limited time after for reporting and legal reasons. Guest session data is kept for a shorter, limited time.</p>
      </section>

      <section id="rights">
        <h2>8. Your rights</h2>
        <p>Under UK GDPR, you can:</p>
        <ul>
          <li>ask what data we hold about you</li>
          <li>ask us to correct it</li>
          <li>ask us to delete it, in some cases</li>
          <li>restrict or object to some processing</li>
          <li>ask for your data in a portable format</li>
          <li>withdraw consent at any time</li>
        </ul>
      </section>

      <section id="cookies">
        <h2>9. Cookies and local storage</h2>
        <p>T-SMILE uses local storage to keep you signed in and to store your guest session ID. We do not use third-party advertising cookies.</p>
      </section>

      <section id="contact">
        <h2>10. Contact and complaints</h2>
        <p>
          To use your rights, email <a href="mailto:placeholder@example.com">[privacy contact email]</a>. You can also complain to the{" "}
          <a href="https://ico.org.uk" target="_blank" rel="noreferrer">
            Information Commissioner's Office
          </a>
          .
        </p>
      </section>
    </LegalPageLayout>
  );
}
