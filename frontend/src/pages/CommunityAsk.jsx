import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { askQuestion, getPathways } from "../api.js";
import { useAuth } from "../auth.jsx";
import { Guidelines, TOPICS, moderationMessage } from "../community/CommunityParts.jsx";
import { SelectField, TextareaField, TextField } from "../components/FormFields.jsx";
import { AlertIcon } from "../components/Icons.jsx";
import { useT } from "../i18n/I18nProvider.jsx";

/**
 * Asking the Community a question (/community/ask). Needs an account.
 *
 * The guidelines sit beside the form, so they are read before posting. The
 * server checks every question (backend/community/moderation.py); if it is
 * stopped, the reason is shown here in the poster's own language, and if it
 * sounds like somebody at risk they get the support numbers instead.
 */
export default function CommunityAsk() {
  const t = useT();
  const navigate = useNavigate();
  const { user, checked } = useAuth();
  const errorRef = useRef(null);

  const [pathways, setPathways] = useState([]);
  const [fields, setFields] = useState({ title: "", body: "", topic: "tlevels", pathway: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [blocked, setBlocked] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | posting

  useEffect(() => {
    const controller = new AbortController();
    getPathways({ signal: controller.signal })
      .then(setPathways)
      .catch(() => {});
    return () => controller.abort();
  }, []);

  if (checked && !user) return <Navigate to="/login" replace />;

  function update(event) {
    const { name, value } = event.target;
    setFields((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setStatus("posting");
    setBlocked(null);
    setFieldErrors({});
    try {
      const question = await askQuestion({ ...fields, pathway: fields.pathway || null });
      navigate(`/community/${question.id}`);
    } catch (error) {
      setStatus("idle");
      const reason = moderationMessage(t, error);
      if (reason) {
        setBlocked(reason);
      } else if (error.body && typeof error.body === "object") {
        setFieldErrors(error.body);
      } else {
        setBlocked(t("community.somethingWrong"));
      }
      requestAnimationFrame(() => errorRef.current?.focus());
    }
  }

  const firstError = (name) => fieldErrors[name]?.[0];

  return (
    <section aria-labelledby="page-title">
      <div className="intro">
        <p className="label">{t("community.label")}</p>
        <h1 id="page-title">{t("community.askTitle")}</h1>
        <p className="lead">{t("community.askLead")}</p>
      </div>

      <div className="community-ask">
        <form className="community-ask__form" onSubmit={submit} noValidate>
          {blocked && (
            <div className="notice" role="alert" tabIndex={-1} ref={errorRef}>
              <AlertIcon />
              <div>
                <p>{blocked}</p>
              </div>
            </div>
          )}

          <TextField
            id="ask-title"
            name="title"
            label={t("community.questionLabel")}
            hint={t("community.questionHint")}
            error={firstError("title")}
            value={fields.title}
            onChange={update}
            maxLength={150}
            required
          />

          <TextareaField
            id="ask-body"
            name="body"
            label={t("community.detailsLabel")}
            hint={t("community.detailsHint")}
            error={firstError("body")}
            value={fields.body}
            onChange={update}
            maxLength={2000}
            rows={5}
          />

          <SelectField id="ask-topic" name="topic" label={t("community.topic")} value={fields.topic} onChange={update}>
            {TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {t(`community.topics.${topic}`)}
              </option>
            ))}
          </SelectField>

          <SelectField
            id="ask-pathway"
            name="pathway"
            label={t("community.pathwayOptional")}
            value={fields.pathway}
            onChange={update}
          >
            <option value="">{t("community.allPathways")}</option>
            {pathways.map((pathway) => (
              <option key={pathway.slug} value={pathway.slug}>
                {pathway.name}
              </option>
            ))}
          </SelectField>

          <div className="community-report__actions">
            <button type="submit" className="button button--primary" disabled={status === "posting"}>
              {status === "posting" ? t("community.posting") : t("community.postQuestion")}
            </button>
            <Link className="button" to="/community">
              {t("community.back")}
            </Link>
          </div>
        </form>

        <Guidelines />
      </div>
    </section>
  );
}
