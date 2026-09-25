import { Link } from "react-router-dom";
import { GROWTH } from "../amazonContent.js";
import amazonPhoto from "../assets/amazon-hero.jpg";
import warehousePhoto from "../assets/pexels-warehouse-operations.jpg";
import { PATHWAY_ICONS } from "../components/Icons.jsx";
import { IconCards, PageHero, RouteSteps } from "../components/InfoBlocks.jsx";
import { useSiteContent } from "../i18n/content.js";
import { useT } from "../i18n/I18nProvider.jsx";
import "../about.css";

// Photos from Pexels (free to use):
//   amazon-hero.jpg: Mikhail Nilov (not an Amazon photo),
//     https://www.pexels.com/photo/young-professionals-working-with-computers-7988745/
//   pexels-warehouse-operations.jpg: GB The Green Brand,
//     https://www.pexels.com/photo/modern-warehouse-operations-with-employees-and-forklift-30824313/

// The biggest figure sets the full width of the growth bars.
const MOST = Math.max(...GROWTH.map((point) => point.value));

// T-Levels at Amazon page.
export default function TLevelsAtAmazon() {
  const t = useT();
  // amazonContent.js and the pathways from aboutContent.js, in the visitor's language.
  const { about, amazon } = useSiteContent();
  const { PATHWAYS } = about;
  const { AMAZON_SOURCES, PLACEMENT_SHAPE, ROUTE_IN, SUPPORT } = amazon;
  const growth = amazon.GROWTH;

  return (
    <>
      <PageHero label={t("amazon.hero.label")} title={t("amazon.hero.title")} lead={t("amazon.hero.lead")} photo={amazonPhoto} />

      <section className="about-section" aria-labelledby="shape-title">
        <div className="section-intro">
          <p className="label">{t("amazon.shape.label")}</p>
          <h2 id="shape-title">{t("amazon.shape.title")}</h2>
        </div>

        <IconCards items={PLACEMENT_SHAPE} />

        {/* Stock photo, not an Amazon site, so empty alt and no caption. */}
        <img
          className="about-figure"
          src={warehousePhoto}
          alt=""
          width="900"
          height="600"
          loading="lazy"
          decoding="async"
        />
      </section>

      <section className="about-section" aria-labelledby="support-title">
        <div className="section-intro">
          <p className="label">{t("amazon.support.label")}</p>
          <h2 id="support-title">{t("amazon.support.title")}</h2>
        </div>

        <IconCards items={SUPPORT} />
      </section>

      <section className="about-section" aria-labelledby="pathways-title">
        <div className="section-intro">
          <p className="label">{t("amazon.pathways.label")}</p>
          <h2 id="pathways-title">{t("amazon.pathways.title")}</h2>
          <p className="section-intro__lead">
            {t("amazon.pathways.leadBefore")} <Link to="/about">{t("amazon.pathways.leadLink")}</Link>
            {t("amazon.pathways.leadAfter")}
          </p>
        </div>

        {/* A definition list rather than the tab switcher used on the About
            page: here the point is to compare all five at once. */}
        <dl className="pathway-summary">
          {PATHWAYS.map((pathway) => {
            const PathwayIcon = PATHWAY_ICONS[pathway.slug];
            return (
              <div className="pathway-summary__row" key={pathway.slug}>
                <dt>
                  <span className="pictogram pictogram--small" aria-hidden="true">
                    <PathwayIcon />
                  </span>
                  {pathway.name}
                </dt>
                <dd>
                  {pathway.summary}{" "}
                  {/* Only the pathways Amazon has named publicly carry a status
                      line, so the page never invents a placement. */}
                  {pathway.amazonStatus && (
                    <strong className="pathway-summary__status">{pathway.amazonStatus}</strong>
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </section>

      <section className="about-section" aria-labelledby="route-title">
        <div className="section-intro">
          <p className="label">{t("amazon.route.label")}</p>
          <h2 id="route-title">{t("amazon.route.title")}</h2>
        </div>

        <RouteSteps steps={ROUTE_IN} />

        <Link className="button button--primary route__action" to="/register-interest">
          {t("footer.links.registerInterest")}
        </Link>
      </section>

      <section className="about-section" aria-labelledby="growth-title">
        <div className="section-intro">
          <p className="label">{t("amazon.growth.label")}</p>
          <h2 id="growth-title">{t("amazon.growth.title")}</h2>
          <p className="section-intro__lead">{t("amazon.growth.lead")}</p>
        </div>

        <ol className="growth">
          {growth.map((point) => (
            <li className="growth__item" key={point.year}>
              <p className="label">{point.year}</p>
              <p className="growth__value">{point.value}</p>
              <p className="growth__caption">{point.caption}</p>
              {/* The bar shows the number as a length, so the growth can be
                  seen at a glance. The number above already says it in text. */}
              <span className="growth__bar" aria-hidden="true">
                <span style={{ width: `${(point.value / MOST) * 100}%` }} />
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="about-sources" aria-labelledby="sources-title">
        <h2 id="sources-title" className="label">
          {t("about.sources.title")}
        </h2>
        <p>{t("amazon.sourcesNote")}</p>
        <ol>
          {AMAZON_SOURCES.map((source) => (
            <li key={source.url}>
              <a href={source.url} lang="en-GB">
                {source.title}
              </a>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
