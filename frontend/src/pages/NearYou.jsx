import { useEffect, useState } from "react";
import { ApiError, getPathways, searchProviders } from "../api.js";
import { formErrors } from "../formErrors.js";
import { SelectField, TextField } from "../components/FormFields.jsx";
import {
  AlertIcon,
  ArrowIcon,
  BusinessIcon,
  DigitalIcon,
  EngineeringIcon,
  FinanceIcon,
  MediaIcon,
} from "../components/Icons.jsx";

// The T Level finder (/t-level-near-you): a postcode, an optional pathway and
// a distance go to GET /api/providers/search/, which measures every provider
// it holds and answers with the ones inside the radius, nearest first.
//
// It searches when the button is pressed, not as you type. A search costs a
// postcode lookup on the server, and half a postcode is not a place.

// The distances offered. 15 matches the server's default, so an untouched
// form and a bare request agree.
const RADIUS_OPTIONS = [5, 10, 15, 25, 50];
const DEFAULT_RADIUS = "15";

// The same pathway icons the homepage tiles and the resources cards use.
const PATHWAY_ICONS = {
  digital: DigitalIcon,
  business: BusinessIcon,
  media: MediaIcon,
  finance: FinanceIcon,
  engineering: EngineeringIcon,
};

/**
 * The loosest shape a UK postcode takes, so an obvious typo is caught before
 * anything is sent. Matches POSTCODE_PATTERN in backend/providers/postcodes.py
 * on purpose. Whether a postcode really exists is the server's answer, not
 * this one.
 */
const POSTCODE_PATTERN = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\d[A-Za-z]{2}$/;

export function checkPostcode(postcode) {
  const typed = postcode.trim();
  if (!typed) return "Enter a postcode.";
  if (!POSTCODE_PATTERN.test(typed.replace(/\s+/g, ""))) {
    return "Enter a full UK postcode, for example SW1A 1AA.";
  }
  return "";
}

const POSTCODE_FIELD_ID = "near-you-postcode";

function focusPostcode() {
  document.getElementById(POSTCODE_FIELD_ID)?.focus();
}

/**
 * What to tell the visitor when a search fails.
 *
 * formErrors() handles the shared cases: a 400 comes back keyed by field, and
 * anything else lands under "form" as a general apology. The one thing it
 * cannot know about is our 503, which carries its own explanation in "detail"
 * (the postcode lookup service being down, rather than us), and saying that
 * is more use than "something went wrong".
 */
function searchError(error) {
  const found = formErrors(error);
  const detail = error instanceof ApiError ? error.body?.detail : null;
  return detail ? { ...found, form: detail } : found;
}

/**
 * "1 mile", "8.4 miles", and "Under 0.1 miles" for a provider on the doorstep,
 * because a chip reading "0 miles" looks like missing data rather than a
 * college at the end of the road.
 */
export function formatDistance(miles) {
  if (miles === 0) return "Under 0.1 miles";
  return `${miles} ${miles === 1 ? "mile" : "miles"}`;
}

export default function NearYou() {
  const [pathways, setPathways] = useState([]);
  const [fields, setFields] = useState({ postcode: "", pathway: "", radius: DEFAULT_RADIUS });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [search, setSearch] = useState(null); // the answer to the last search

  // For the pathway filter. A dead pathways call leaves the filter empty
  // rather than breaking the page: a postcode on its own is still a search.
  useEffect(() => {
    const controller = new AbortController();
    getPathways({ signal: controller.signal })
      .then(setPathways)
      .catch(() => {});
    return () => controller.abort();
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setFields((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const problem = checkPostcode(fields.postcode);
    if (problem) {
      setErrors({ postcode: problem });
      // Land the visitor on the field to fix, rather than making them find it.
      focusPostcode();
      return;
    }

    setErrors({});
    setStatus("loading");
    try {
      setSearch(await searchProviders(fields));
      setStatus("ready");
    } catch (error) {
      // A 400 names the field it is about (a postcode that does not exist, an
      // unknown pathway); anything else lands under "form".
      const found = searchError(error);
      setErrors(found);
      // Drop the last answer too. Leaving it would put a summary and a list
      // for one postcode under an error about a different one.
      setSearch(null);
      setStatus(found.postcode ? "idle" : "error");
      if (found.postcode) focusPostcode();
    }
  }

  const results = search?.results ?? [];

  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">Find a provider</p>
        <h1 id="page-title">T-Level Near You</h1>
        <p className="lead">
          Enter your postcode to see the schools and colleges running T Levels near you, closest
          first.
        </p>
      </section>

      <form
        className="filters near-you__form"
        aria-label="Search for T Level providers"
        onSubmit={handleSubmit}
        noValidate
      >
        <TextField
          id={POSTCODE_FIELD_ID}
          label="Postcode"
          name="postcode"
          hint="For example SW1A 1AA."
          value={fields.postcode}
          onChange={updateField}
          autoComplete="postal-code"
          autoCapitalize="characters"
          maxLength={8}
          required
          error={errors.postcode}
        />

        <SelectField
          id="near-you-pathway"
          label="Pathway"
          name="pathway"
          value={fields.pathway}
          onChange={updateField}
          error={errors.pathway}
        >
          <option value="">All pathways</option>
          {pathways.map((pathway) => (
            <option key={pathway.slug} value={pathway.slug}>
              {pathway.name}
            </option>
          ))}
        </SelectField>

        <SelectField
          id="near-you-radius"
          label="Within"
          name="radius"
          value={fields.radius}
          onChange={updateField}
          error={errors.radius}
        >
          {RADIUS_OPTIONS.map((miles) => (
            <option key={miles} value={String(miles)}>
              {miles} miles
            </option>
          ))}
        </SelectField>

        <button
          type="submit"
          className="button button--primary near-you__submit"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Searching" : "Search"}
        </button>
      </form>

      {status === "error" ? (
        <div className="notice" role="alert">
          <AlertIcon />
          <div>
            <p className="notice__title">Could not search for providers.</p>
            <p>{errors.form}</p>
            {import.meta.env.DEV && <p>Check the Django API is running on port 8000.</p>}
            <button type="button" className="button" onClick={handleSubmit}>
              Try again
            </button>
          </div>
        </div>
      ) : (
        <p className="label results-status" role="status">
          <SearchStatus status={status} search={search} />
        </p>
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

/**
 * The one line under the form, read out as it changes (its parent is a live
 * region). Every state says something: a blank line would leave a screen
 * reader user with no idea whether the search had run.
 */
function SearchStatus({ status, search }) {
  if (status === "loading") return "Searching";
  // Also the state after a search that could not run, which is why this does
  // not say "to start": the error beside the field says what went wrong.
  if (!search) return "Enter a postcode to see providers near you.";

  const { count, radius_miles: radius, postcode } = search;
  if (count === 0) {
    return `No providers found within ${radius} miles of ${postcode}. Try a wider radius.`;
  }
  return `${count} ${count === 1 ? "provider" : "providers"} within ${radius} miles of ${postcode}.`;
}

function ProviderCard({ provider }) {
  return (
    <li className="card">
      <div className="card__tags">
        <span className="tag tag--distance">{formatDistance(provider.distance_miles)}</span>
      </div>

      {/* h2: the cards sit straight under the page's h1. */}
      <h2 className="card__title">{provider.name}</h2>
      <p className="card__text">
        {provider.address}, {provider.postcode}
      </p>

      <dl className="card__meta">
        <div>
          <dt className="label">Pathways</dt>
          <dd>
            {provider.pathways.length === 0 ? (
              "Ask the provider"
            ) : (
              <ul className="near-you__pathways">
                {provider.pathways.map((pathway) => {
                  const PathwayIcon = PATHWAY_ICONS[pathway.slug];
                  return (
                    <li key={pathway.slug}>
                      {PathwayIcon && <PathwayIcon />}
                      {pathway.name}
                    </li>
                  );
                })}
              </ul>
            )}
          </dd>
        </div>
      </dl>

      {provider.website_url && (
        <a className="button button--primary card__action" href={provider.website_url}>
          Visit website
          <span className="sr-only">, {provider.name}</span>
          <ArrowIcon />
        </a>
      )}
    </li>
  );
}
