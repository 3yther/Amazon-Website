import { Link } from "react-router-dom";
import studentsPhoto from "../assets/pexels-students-library.jpg";
import { useT } from "../i18n/I18nProvider.jsx";

// Photo from Pexels (free to use): pexels-students-library.jpg by Kampus Production,
// https://www.pexels.com/photo/concentrated-young-diverse-students-using-laptops-during-lesson-in-library-5940711/

// The photo side of the log in and sign up pages. Decoration only.
export default function AuthPanel() {
  const t = useT();
  return (
    <aside className="auth-panel">
      <img className="auth-panel__photo" src={studentsPhoto} alt="" aria-hidden="true" loading="lazy" decoding="async" />
      <div className="auth-panel__content">
        <Link className="wordmark auth-panel__wordmark" to="/">
          T-<span className="wordmark__accent">SMILE</span>
        </Link>
        <p className="auth-panel__line">{t("forms.panelLine")}</p>
      </div>
    </aside>
  );
}
