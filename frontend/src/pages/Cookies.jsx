import LegalPage from "../components/LegalPage.jsx";
import { COOKIES } from "../legalContent.js";

/** Cookie Policy. The wording lives in legalContent.js. */
export default function Cookies() {
  return <LegalPage page={COOKIES} />;
}
