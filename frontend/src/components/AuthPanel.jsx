import { Link } from "react-router-dom";
import studentsPhoto from "../assets/pexels-students-library.jpg";

// Photo from Pexels, under the Pexels Licence (https://www.pexels.com/license/):
// free to use, attribution not required. Credited here for the asset log.
//   pexels-students-library.jpg: Kampus Production,
//     https://www.pexels.com/photo/concentrated-young-diverse-students-using-laptops-during-lesson-in-library-5940711/

/**
 * The branded half of the log in and sign up pages: the wordmark and one
 * line of copy over a photo, with the same flat scrim the homepage audience
 * cards use so the text keeps its contrast whatever the photo is doing.
 * Decorative only, so it is hidden from screen readers: the form beside it
 * carries everything a visitor needs.
 */
export default function AuthPanel() {
  return (
    <aside className="auth-panel">
      <img className="auth-panel__photo" src={studentsPhoto} alt="" aria-hidden="true" loading="lazy" decoding="async" />
      <div className="auth-panel__content">
        <Link className="wordmark auth-panel__wordmark" to="/">
          T-<span className="wordmark__accent">SMILE</span>
        </Link>
        <p className="auth-panel__line">
          Free resources for Amazon&rsquo;s Digital T-Level pathway.
        </p>
      </div>
    </aside>
  );
}
