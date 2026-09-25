import { useEffect, useState } from "react";
import { ApiError, getPathways, searchProviders } from "../api.js";
import { formErrors } from "../formErrors.js";
import { SelectField, TextField } from "../components/FormFields.jsx";
import { AlertIcon, ArrowIcon, PATHWAY_ICONS } from "../components/Icons.jsx";
import { useT } from "../i18n/I18nProvider.jsx";
import { translateServerMessage } from "../i18n/serverMessages.js";
import { makeTranslate } from "../i18n/translate.js";

// Find T-Levels near you. Searches GET /api/providers/search/ when you press Search.

// 15 is the server's default too.
const RADIUS_OPTIONS = [5, 10, 15, 25, 50];
const DEFAULT_RADIUS = "15";

const english = makeTranslate();

// Rough UK postcode check (same as POSTCODE_PATTERN in backend/providers/postcodes.py).
const POSTCODE_PATTERN = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\d[A-Za-z]{2}$/;

export function checkPostcode(postcode, t = english) {
  const typed = postcode.trim();
  if (!typed) return t("nearYou.errors.empty");
  if (!POSTCODE_PATTERN.test(typed.replace(/\s+/g, ""))) return t("nearYou.errors.notFull");
  return "";
}

const POSTCODE_FIELD_ID = "near-you-postcode";

function focusPostcode() {
  document.getElementById(POSTCODE_FIELD_ID)?.focus();
}

// Error message for a failed search. A 503 comes with its own message in "detail".
function searchError(error, t) {
  const found = formErrors(error, t);
  const detail = error instanceof ApiError ? error.body?.detail : null;
  return detail ? { ...found, form: translateServerMessage(detail, t) } : found;
}

// "Under 0.1 miles" looks better than "0 miles".
export function formatDistance(miles, t = english) {
  if (miles === 0) return t("nearYou.underTenth");
  if (miles === 1) return t("nearYou.oneMile");
  return t("nearYou.distance", { miles });
}

export default function NearYou() {
  const t = useT();
  const [pathways, setPathways] = useState([]);
  const [fields, setFields] = useState({ postcode: "", pathway: "", radius: DEFAULT_RADIUS });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [search, setSearch] = useState(null); // the answer to the last search

  // For the pathway filter. If this fails the filter is just empty.
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

    const problem = checkPostcode(fields.postcode, t);
    if (problem) {
      setErrors({ postcode: problem });
      focusPostcode();
      return;
    }

    setErrors({});
    setStatus("loading");
    try {
      setSearch(await searchProviders(fields));
      setStatus("ready");
    } catch (error) {
      // A 400 names the field (e.g. a postcode that doesn't exist), anything else goes under "form".
      const found = searchError(error, t);
      setErrors(found);
      setSearch(null); // don't leave old results under the error
      setStatus(found.postcode ? "idle" : "error");
      if (found.postcode) focusPostcode();
    }
  }

  const results = search?.results ?? [];

  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="label">{t("nearYou.label")}</p>
        <h1 id="page-title">{t("nearYou.title")}</h1>
        <p className="lead">{t("nearYou.lead")}</p>
      </section>

      <form className="filters near-you__form" aria-label={t("nearYou.form")} onSubmit={handleSubmit} noValidate>
        <TextField
          id={POSTCODE_FIELD_ID}
          label={t("nearYou.postcode")}
          name="postcode"
          hint={t("nearYou.postcodeHint")}
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
          label={t("nearYou.pathway")}
          name="pathway"
          value={fields.pathway}
          onChange={updateField}
          error={errors.pathway}
        >
          <option value="">{t("nearYou.allPathways")}</option>
          {pathways.map((pathway) => (
            <option key={pathway.slug} value={pathway.slug}>
              {t(`pathways.${pathway.slug}`)}
            </option>
          ))}
        </SelectField>

        <SelectField
          id="near-you-radius"
          label={t("nearYou.within")}
          name="radius"
          value={fields.radius}
          onChange={updateField}
          error={errors.radius}
        >
          {RADIUS_OPTIONS.map((miles) => (
            <option key={miles} value={String(miles)}>
              {t("nearYou.miles", { miles })}
            </option>
          ))}
        </SelectField>

        <button type="submit" className="button button--primary near-you__submit" disabled={status === "loading"}>
          {status === "loading" ? t("nearYou.searching") : t("nearYou.search")}
        </button>
      </form>

      {status === "error" ? (
        <div className="notice" role="alert">
          <AlertIcon />
          <div>
            <p className="notice__title">{t("nearYou.error")}</p>
            <p>{errors.form}</p>
            {import.meta.env.DEV && <p>Check the Django API is running on port 8000.</p>}
            <button type="button" className="button" onClick={handleSubmit}>
              {t("nearYou.tryAgain")}
            </button>
          </div>
        </div>
      ) : (
        <p className="label results-status" role="status">
          {searchStatus(status, search, t)}
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

// The line under the form. It's a live region so screen readers hear it change.
function searchStatus(status, search, t) {
  if (status === "loading") return t("nearYou.searching");
  if (!search) return t("nearYou.start");

  const { count, radius_miles: radius, postcode } = search;
  if (count === 0) return t("nearYou.none", { radius, postcode });
  if (count === 1) return t("nearYou.oneFound", { radius, postcode });
  return t("nearYou.found", { count, radius, postcode });
}

function ProviderCard({ provider }) {
  const t = useT();
  return (
    <li className="card">
      <div className="card__tags">
        <span className="tag tag--distance">{formatDistance(provider.distance_miles, t)}</span>
      </div>

      {/* h2 because the cards sit straight under the page's h1 */}
      <h2 className="card__title">{provider.name}</h2>
      <p className="card__text">
        {provider.address}, {provider.postcode}
      </p>

      <dl className="card__meta">
        <div>
          <dt className="label">{t("nearYou.pathways")}</dt>
          <dd>
            {provider.pathways.length === 0 ? (
              t("nearYou.askProvider")
            ) : (
              <ul className="near-you__pathways">
                {provider.pathways.map((pathway) => {
                  const PathwayIcon = PATHWAY_ICONS[pathway.slug];
                  return (
                    <li key={pathway.slug}>
                      {PathwayIcon && <PathwayIcon />}
                      {t(`pathways.${pathway.slug}`)}
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
          {t("nearYou.website")}
          <span className="sr-only">, {provider.name}</span>
          <ArrowIcon />
        </a>
      )}
    </li>
  );
}
