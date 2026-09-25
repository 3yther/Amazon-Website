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

// The T-Level finder (/t-level-near-you): a postcode, an optional pathway and
// a distance go to GET /api/providers/search/, which measures every provider
// it holds and answers with the ones inside the radius, nearest first.
//
// It searches when the button is pressed, not as you type. A search costs a
// postcode lookup on the server, and half a postcode is not a place.
//
// TWO LISTS WHEN A PATHWAY IS CHOSEN. The official register of T-Level
// providers says only THAT a school runs T-Levels, not which subjects, so for
// most of the 360 we hold nobody has checked. The server answers those
// separately (results and unconfirmed) and this page keeps them apart, under
// headings that say which is which. Showing them as one list would tell a
// visitor a college teaches something we never looked up; dropping them would
// empty the page the moment anyone touched the filter.

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

/** "provider" or "providers", so no sentence here reads "1 providers". */
function countOf(number, thing = "provider") {
  return `${number} ${thing}${number === 1 ? "" : "s"}`;
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
  const unconfirmed = search?.unconfirmed ?? [];
  // The name to put in a heading, from the slug the search was made with, so
  // it keeps saying "Digital" even after the filter is changed but not sent.
  const searchedPathway = pathways.find((pathway) => pathway.slug === search?.pathway);
  const showLists = status !== "error" && (results.length > 0 || unconfirmed.length > 0);

  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">Find a provider</p>
        <h1 id="page-title">Find T-Levels Near You</h1>
        <p className="lead">
          Enter your postcode to see the schools and colleges running T-Levels near you, closest
          first.
        </p>
      </section>

      <form
        className="filters near-you__form"
        aria-label="Search for T-Level providers"
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
          <SearchStatus status={status} search={search} pathway={searchedPathway} />
        </p>
      )}

      {showLists && (
        <>
          {results.length > 0 && (
            <ProviderList
              heading={
                searchedPathway ? `Offering ${searchedPathway.name}` : "Providers near you"
              }
              providers={results}
              busy={status === "loading"}
            />
          )}

          {unconfirmed.length > 0 && (
            <ProviderList
              heading="Subjects not confirmed"
              description={
                `The official register shows ${
                  unconfirmed.length === 1 ? "this provider runs" : "these providers run"
                } T-Levels, but not which subjects. ` +
                `${unconfirmed.length === 1 ? "It is" : "They are"} near you, so ${
                  searchedPathway ? `ask whether ${searchedPathway.name} is offered` : "ask what is offered"
                }.`
              }
              providers={unconfirmed}
              busy={status === "loading"}
            />
          )}
        </>
      )}
    </>
  );
}

/**
 * The one line under the form, read out as it changes (its parent is a live
 * region). Every state says something: a blank line would leave a screen
 * reader user with no idea whether the search had run.
 */
function SearchStatus({ status, search, pathway }) {
  if (status === "loading") return "Searching";
  // Also the state after a search that could not run, which is why this does
  // not say "to start": the error beside the field says what went wrong.
  if (!search) return "Enter a postcode to see providers near you.";

  const { count, radius_miles: radius, postcode, unconfirmed_count: unknown } = search;
  const where = `within ${radius} miles of ${postcode}`;

  // Nothing at all, filtered or not: the one message that suggests a fix.
  if (count === 0 && !unknown) {
    return `No providers found ${where}. Try a wider radius.`;
  }

  if (!pathway) return `${countOf(count)} ${where}.`;

  const unsure = `${countOf(unknown)} nearby ${
    unknown === 1 ? "has" : "have"
  } not had their subjects confirmed.`;

  if (count === 0) return `No confirmed ${pathway.name} providers ${where}. ${unsure}`;
  return `${countOf(count)} offering ${pathway.name} ${where}. ${unsure}`;
}

/** One headed group of provider cards. */
function ProviderList({ heading, description, providers, busy }) {
  return (
    <section className="near-you__group">
      {/* h2: the groups sit straight under the page's h1, and the provider
          names below them are h3, so the outline holds whether the visitor
          filtered by pathway or not. */}
      <h2 className="near-you__group-title">{heading}</h2>
      {description && <p className="near-you__group-note">{description}</p>}
      <ul className="card-grid" aria-busy={busy}>
        {providers.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </ul>
    </section>
  );
}

function ProviderCard({ provider }) {
  return (
    <li className="card">
      <div className="card__tags">
        <span className="tag tag--distance">{formatDistance(provider.distance_miles)}</span>
        {provider.foundation_year && <span className="tag">Foundation year</span>}
      </div>

      <h3 className="card__title">{provider.name}</h3>
      <p className="card__text">
        {/* The address is a locality for most of the register, and blank for
            the few whose postcode resolves nowhere. Leaving it out beats
            printing a stray comma in front of the postcode. */}
        {provider.address ? `${provider.address}, ${provider.postcode}` : provider.postcode}
      </p>

      <dl className="card__meta">
        {provider.provider_type && (
          <div>
            <dt className="label">Type</dt>
            <dd>{provider.provider_type}</dd>
          </div>
        )}
        <div>
          <dt className="label">Pathways</dt>
          <dd>
            <ProviderPathways provider={provider} />
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

/**
 * What a card says about subjects.
 *
 * An empty list means two different things, and the card has to tell them
 * apart: pathways_confirmed says whether anybody has actually checked. Saying
 * "none" about a provider nobody asked would be inventing an answer.
 */
function ProviderPathways({ provider }) {
  if (provider.pathways.length === 0) {
    return provider.pathways_confirmed ? "None of the five we cover" : "Not confirmed, ask the provider";
  }

  return (
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
  );
}
