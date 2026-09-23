import LegalPage from "../components/LegalPage.jsx";
import { PRIVACY } from "../legalContent.js";

/** Privacy Policy. The wording lives in legalContent.js. */
export default function Privacy() {
  return <LegalPage page={PRIVACY} />;
}
