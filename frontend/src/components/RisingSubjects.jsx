import { useState } from "react";
import { T_LEVEL_SUBJECTS } from "../tlevelSubjects.js";

// Decorative background for the homepage: T-Level subject names drifting
// upwards behind the content. Hidden from assistive tech, never takes clicks,
// and not shown at all to visitors who ask for reduced motion (see styles.css).

let nextId = 0;

function random(min, max) {
  return min + Math.random() * (max - min);
}

/** One subject with a random position, size, speed and strength. */
function makeSubject({ startPartWay = false } = {}) {
  const duration = random(18, 34); // seconds to cross the screen
  return {
    id: nextId++,
    name: T_LEVEL_SUBJECTS[Math.floor(Math.random() * T_LEVEL_SUBJECTS.length)],
    style: {
      "--x": `${random(0, 90)}%`,
      "--size": `${random(0.875, 2.25)}rem`,
      "--opacity": random(0.03, 0.05).toFixed(3),
      "--duration": `${duration}s`,
      // The first set starts part way up, so the screen is not empty on load.
      "--delay": startPartWay ? `${-random(0, duration)}s` : `${random(0, 4)}s`,
    },
  };
}

export default function RisingSubjects() {
  // Fewer subjects on narrow screens so the background never gets busy.
  const [subjects, setSubjects] = useState(() => {
    const count = window.innerWidth < 640 ? 6 : 12;
    return Array.from({ length: count }, () => makeSubject({ startPartWay: true }));
  });

  // When a subject reaches the top, swap it for a fresh one at the bottom.
  function replace(id) {
    setSubjects((current) => current.map((subject) => (subject.id === id ? makeSubject() : subject)));
  }

  return (
    <div className="rising-subjects" aria-hidden="true">
      {subjects.map((subject) => (
        <span
          key={subject.id}
          className="rising-subjects__item"
          data-subject={subject.name}
          style={subject.style}
          onAnimationEnd={() => replace(subject.id)}
        />
      ))}
    </div>
  );
}
