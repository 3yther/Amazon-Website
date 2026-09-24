import LegalPage from "../components/LegalPage.jsx";
import { TERMS } from "../legalContent.js";

/** Terms of Service. The wording lives in legalContent.js. */
export default function Terms() {
  return <LegalPage page={TERMS} />;
}
