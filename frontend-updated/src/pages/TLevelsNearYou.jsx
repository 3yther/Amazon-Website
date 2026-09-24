import { useState } from "react";
import { getNearbyProviders } from "../api.js";
import { AlertIcon, ArrowIcon } from "../components/Icons.jsx";

const RADIUS_OPTIONS = [10, 25, 50, 100];
const UK_POSTCODE_PATTERN = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s?\d[A-Za-z]{2}$/;

/**
 * Postcode locator for T Level providers. Calls GET /api/providers/nearby/
 * with { postcode, radius } and expects { origin_postcode, radius_miles,
 * count, results }.
 *
 * NOTE: this endpoint isn't built yet - MODELS.md has no provider/college
 * model. See the comment on getNearbyProviders in api.js.
 */
export default function TLevelsNearYou() {
  const [postcode, setPostcode] = useState("");
  const [radius, setRadius] = useState(25);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(null);
  const [fieldError, setFieldError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmed = postcode.trim();

    if (!trimmed) {
      setFieldError("Enter a postcode to search.");
      return;
    }
    if (!UK_POSTCODE_PATTERN.test(trimmed)) {
      setFieldError('Enter a valid UK postcode, e.g. "SW1A 1AA".');
      return;
    }

    setFieldError("");
    setStatus("loading");

    try {
      const data = await getNearbyProviders({ postcode: trimmed, radius });
      setResults(data.results);
      setSearched({ postcode: data.origin_postcode, radius: data.radius_miles });
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">Find a provider</p>
        <h1 id="page-title">T Levels near you</h1>
        <p className="lead">Enter a postcode to find T Level providers in your area.</p>
      </section>

      <div className="notice">
        <AlertIcon />
        <div>
          <p className="notice__title">Prototype page.</p>
          <p>Needs a provider database and API endpoint that are not built yet. Do not treat this as working end to end until that is agreed with the team.</p>
        </div>
      </div>

      <form className="filters" aria-label="Search for T Level providers" onSubmit={handleSubmit}>
        <div className="field">
          <label className="label" htmlFor="postcode">
            Postcode
          </label>
          <input
            id="postcode"
            name="postcode"
            type="text"
            autoComplete="postal-code"
            value={postcode}
            onChange={(event) => setPostcode(event.target.value)}
            aria-invalid={fieldError ? "true" : undefined}
            aria-describedby={fieldError ? "postcode-error" : undefined}
            placeholder="e.g. SW1A 1AA"
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="radius">
            Within
          </label>
          <select id="radius" value={radius} onChange={(event) => setRadius(Number(event.target.value))}>
            {RADIUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option} miles
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="button button--primary" disabled={status === "loading"}>
          {status === "loading" ? "Searching" : "Search"}
        </button>
      </form>

      {fieldError && (
        <p id="postcode-error" role="alert" className="field-error">
          <AlertIcon /> {fieldError}
        </p>
      )}

      {status === "error" ? (
        <div className="notice" role="alert">
          <AlertIcon />
          <div>
            <p className="notice__title">Could not search for providers.</p>
            <p>Check the API is running, then try again.</p>
            <button type="button" className="button" onClick={handleSubmit}>
              Try again
            </button>
          </div>
        </div>
      ) : (
        searched && (
          <p className="label results-status" role="status">
            {results.length === 0
              ? `No providers found within ${searched.radius} miles of ${searched.postcode}.`
              : `${results.length} ${results.length === 1 ? "provider" : "providers"} within ${searched.radius} miles of ${searched.postcode}.`}
          </p>
        )
      )}

      {results.length > 0 && status !== "error" && (
        <ul className="card-grid" aria-busy={status === "loading"}>
          {results.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </ul>
      )}
    </>
  );
}

function ProviderCard({ provider }) {
  return (
    <li className="card">
      <h2 className="card__title">{provider.name}</h2>
      <p className="card__text">
        {provider.address_line1}, {provider.town}, {provider.postcode}
      </p>

      <dl className="card__meta">
        <div>
          <dt className="label">Distance</dt>
          <dd>{provider.distance_miles} miles</dd>
        </div>
        {provider.courses_offered?.length > 0 && (
          <div>
            <dt className="label">Courses</dt>
            <dd>{provider.courses_offered.join(", ")}</dd>
          </div>
        )}
      </dl>

      {provider.website_url && (
        <a
          className="button button--primary card__action"
          href={provider.website_url}
          target="_blank"
          rel="noreferrer"
        >
          Visit website<span className="sr-only"> for {provider.name}</span>
          <ArrowIcon />
        </a>
      )}
    </li>
  );
}
