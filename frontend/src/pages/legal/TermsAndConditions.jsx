// Starting point only, not legal advice - have it reviewed before publishing.
// Replace [Organisation] and [contact email].

import LegalPageLayout from "../../components/legal/LegalPageLayout.jsx";

const SECTIONS = [
  { id: "acceptance", label: "1. Acceptance" },
  { id: "eligibility", label: "2. Who can use T-SMILE" },
  { id: "accounts", label: "3. Accounts" },
  { id: "content-access", label: "4. Content and access levels" },
  { id: "acceptable-use", label: "5. Acceptable use" },
  { id: "ip", label: "6. Intellectual property" },
  { id: "liability", label: "7. Liability" },
  { id: "changes", label: "8. Changes to these terms" },
  { id: "contact", label: "9. Contact us" },
];

export default function TermsAndConditions() {
  return (
    <LegalPageLayout title="Terms and Conditions" lastUpdated="22 September 2026" sections={SECTIONS}>
      <section id="acceptance">
        <h2>1. Acceptance</h2>
        <p>By using T-SMILE, the T Level Student Engagement Portal, you agree to these terms. If you do not agree, do not use the site.</p>
      </section>

      <section id="eligibility">
        <h2>2. Who can use T-SMILE</h2>
        <p>T-SMILE is for T Level students, alumni, teachers, parents and guardians. Some pages are open to guests. Others need an account.</p>
      </section>

      <section id="accounts">
        <h2>3. Accounts</h2>
        <p>Keep your login details private. You are responsible for anything done under your account.</p>
      </section>

      <section id="content-access">
        <h2>4. Content and access levels</h2>
        <p>Some content is free to everyone. Some needs sign-up. We can change which content is gated at any time.</p>
      </section>

      <section id="acceptable-use">
        <h2>5. Acceptable use</h2>
        <p>Do not:</p>
        <ul>
          <li>use T-SMILE for anything unlawful</li>
          <li>try to access parts of the site or systems you are not authorised to use</li>
          <li>upload harmful code, or content that is abusive or infringes someone else's rights</li>
          <li>scrape or bulk-download content without permission</li>
        </ul>
      </section>

      <section id="ip">
        <h2>6. Intellectual property</h2>
        <p>Text, graphics and downloadable resources on T-SMILE belong to [Organisation] unless stated otherwise. You may view and download them for personal, non-commercial use.</p>
      </section>

      <section id="liability">
        <h2>7. Liability</h2>
        <p>T-SMILE is provided as is. We keep information accurate where we can, but we do not guarantee the site is error-free, and we are not liable for decisions made from its content, to the extent the law allows.</p>
      </section>

      <section id="changes">
        <h2>8. Changes to these terms</h2>
        <p>We may update these terms. The date at the top shows when. Using T-SMILE after an update means you accept the new terms.</p>
      </section>

      <section id="contact">
        <h2>9. Contact us</h2>
        <p>
          Questions about these terms? Email <a href="mailto:placeholder@example.com">[contact email]</a>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
