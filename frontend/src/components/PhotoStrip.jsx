import { useT } from "../i18n/I18nProvider.jsx";
import { useReducedMotion } from "../useReducedMotion.js";
import officeMeeting from "../assets/pexels-office-meeting.jpg";
import studentsLibrary from "../assets/pexels-students-library.jpg";
import studentsOutdoors from "../assets/pexels-students-outdoors.jpg";
import warehouseTeam from "../assets/pexels-warehouse-team.jpg";

// Photos from Pexels (free to use):
//   pexels-students-library.jpg: Kampus Production, https://www.pexels.com/photo/concentrated-young-diverse-students-using-laptops-during-lesson-in-library-5940711/
//   pexels-students-outdoors.jpg: Keira Burton, https://www.pexels.com/photo/diverse-students-working-together-at-table-with-laptop-in-park-6147009/
//   pexels-warehouse-team.jpg: Tiger Lily, https://www.pexels.com/photo/men-working-in-a-warehouse-4480797/
//   pexels-office-meeting.jpg: Tima Miroshnichenko, https://www.pexels.com/photo/office-team-having-a-meeting-in-the-room-6914053/

// Only four photos because the loop needs them twice.
const PHOTOS = [
  { src: studentsLibrary, id: "students-library" },
  { src: warehouseTeam, id: "warehouse-team" },
  { src: officeMeeting, id: "office-meeting" },
  { src: studentsOutdoors, id: "students-outdoors" },
];

/**
 * A slow scrolling row of photos (decoration). Pauses on hover and focus.
 * With reduced motion it's a normal row you can scroll yourself.
 */
export default function PhotoStrip() {
  const t = useT();
  const reducedMotion = useReducedMotion();

  function card(photo, copyIndex) {
    return (
      <li className="photo-strip__item" key={`${photo.id}-${copyIndex}`} aria-hidden={copyIndex === 1}>
        <img src={photo.src} alt="" loading="lazy" decoding="async" />
      </li>
    );
  }

  return (
    <div
      className={reducedMotion ? "photo-strip photo-strip--static" : "photo-strip"}
      role="group"
      aria-label={t("about.photos")}
    >
      <ul className="photo-strip__track">
        {PHOTOS.map((photo) => card(photo, 0))}
        {/* The second run is what makes the loop seamless. Hidden from
            screen readers so the same photos are not announced twice. */}
        {!reducedMotion && PHOTOS.map((photo) => card(photo, 1))}
      </ul>
    </div>
  );
}
