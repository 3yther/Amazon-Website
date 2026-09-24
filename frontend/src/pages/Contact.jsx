import { Link } from "react-router-dom";
import MessageForm from "../components/MessageForm.jsx";

const CATEGORIES = [
  { value: "general", label: "A question or anything else" },
  { value: "feature", label: "An idea for the site" },
];

/**
 * Contact us: a short form that sends a message to the team. Problems with
 * the site go to Report an Issue instead, so each page has one job.
 */
export default function Contact() {
  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">Support</p>
        <h1 id="page-title">Contact us</h1>
        <p className="lead">
          Send the team a message. Something broken? Use <Link to="/report-issue">Report an issue</Link>.
        </p>
      </section>

      <MessageForm
        idPrefix="contact"
        categories={CATEGORIES}
        messageLabel="Your message"
        submitLabel="Send message"
        sentText="Thanks, your message has reached the team."
      />
    </>
  );
}
