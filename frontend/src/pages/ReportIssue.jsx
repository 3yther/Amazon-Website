import MessageForm from "../components/MessageForm.jsx";

const CATEGORIES = [
  { value: "bug", label: "Something is broken" },
  { value: "accessibility", label: "Something is hard to use or read" },
];

/** Report an Issue: tell the team about a bug or an accessibility problem. */
export default function ReportIssue() {
  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">Support</p>
        <h1 id="page-title">Report an issue</h1>
        <p className="lead">Tell us what went wrong and which page you were on.</p>
      </section>

      <MessageForm
        idPrefix="issue"
        categories={CATEGORIES}
        messageLabel="What happened?"
        submitLabel="Send report"
        sentText="Thanks, we have your report and will look into it."
      />
    </>
  );
}
