import Pictogram from "./Pictogram.jsx";

// Building blocks shared by the About, T-Levels at Amazon and Help pages, so
// all three show a picture, a short heading and one line in the same way.

/** The opening band: label, heading, one line, and a decorative photo. */
export function PageHero({ label, title, lead, photo }) {
  return (
    <section className="about-hero about-hero--photo" aria-labelledby="page-title">
      <div className="about-hero__text">
        <p className="label">{label}</p>
        <h1 id="page-title">{title}</h1>
        <p className="about-hero__lead">{lead}</p>
      </div>
      {/* Decoration, so alt is empty */}
      <img className="about-hero__photo" src={photo} alt="" width="720" height="480" />
    </section>
  );
}

/** A grid of cards, each with a picture, a heading and a line of text. */
export function IconCards({ items, children }) {
  return (
    <ul className="info-grid">
      {items.map((item) => (
        <li className="info-card" key={item.title}>
          <Pictogram name={item.icon} />
          <h3>{item.title}</h3>
          <p>{item.text}</p>
          {/* Optional extra per card, e.g. a link on the Help page. */}
          {children?.(item)}
        </li>
      ))}
    </ul>
  );
}

/** A list of short points, each with a small picture in place of a bullet. */
export function IconList({ items }) {
  return (
    <ul className="icon-list">
      {items.map((item) => (
        <li key={item.text}>
          <Pictogram name={item.icon} size="small" />
          <span>{item.text}</span>
        </li>
      ))}
    </ul>
  );
}

/** Numbered steps, each with a picture (the design doc's descending route). */
export function RouteSteps({ steps }) {
  return (
    <ol className="route">
      {steps.map((step) => (
        <li className="route__step" key={step.number}>
          {/* The number is decoration on top of the ordered list, so it is
              hidden from screen readers to avoid "01 one" being read out. */}
          <span className="route__number" aria-hidden="true">
            {step.number}
          </span>
          <Pictogram name={step.icon} />
          <div>
            <h3 className="route__title">{step.title}</h3>
            <p className="route__text">{step.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

// A bar split into parts (e.g. 80/20) with a key underneath for screen readers.
export function ShareBar({ parts, label }) {
  return (
    <figure className="share-bar">
      <div className="share-bar__bar" aria-hidden="true">
        {parts.map((part, index) => (
          <span
            key={part.label}
            className={index === 0 ? "share-bar__part" : "share-bar__part share-bar__part--accent"}
            style={{ flexGrow: part.share }}
          >
            <Pictogram name={part.icon} size="small" />
          </span>
        ))}
      </div>
      <figcaption className="share-bar__key">
        <span className="sr-only">{label}: </span>
        {parts.map((part, index) => (
          <span className="share-bar__key-item" key={part.label}>
            <span
              className={index === 0 ? "share-bar__swatch" : "share-bar__swatch share-bar__swatch--accent"}
              aria-hidden="true"
            />
            <strong>{part.label}</strong> {part.detail}
            {index < parts.length - 1 && <span className="sr-only">,</span>}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
