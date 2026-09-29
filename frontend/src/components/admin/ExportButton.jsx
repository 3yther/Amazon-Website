import { useRef, useState } from "react";
import { useT } from "../../i18n/I18nProvider.jsx";

/**
 * Download the current view as a CSV.
 *
 * FETCHED, NOT LINKED. A plain <a download> would work, but it cannot show
 * that anything is happening, cannot report a failure, and on a 403 it
 * silently downloads the error page as a .csv. Fetching means the button can
 * be busy, can say when it failed, and can tell a screen reader it finished.
 *
 * SAME FILTERS AS THE SCREEN. The query string comes from the same hook the
 * numbers use, so the file always matches the view it was taken from. The
 * server re-applies those filters itself; this is not trusted to narrow
 * anything.
 *
 * THE SERVER NAMES THE FILE. Content-Disposition carries the name, so a
 * download always says what it is and when it was taken, whoever asked for it.
 */
export default function ExportButton({ url, query }) {
  const t = useT();
  const [status, setStatus] = useState("idle"); // idle | busy | done | error
  const announcement = useRef(null);

  async function download() {
    setStatus("busy");
    try {
      const response = await fetch(query ? `${url}?${query}` : url, {
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error(String(response.status));

      const blob = await response.blob();
      const nameFromServer = /filename="([^"]+)"/.exec(
        response.headers.get("Content-Disposition") ?? "",
      );

      // A temporary object URL and a click, then let it go: keeping the URL
      // alive holds the whole file in memory for as long as the page lives.
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = nameFromServer?.[1] ?? "tsmile-export.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(href);

      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <button type="button" className="button" onClick={download} disabled={status === "busy"}>
        {status === "busy" ? t("admin.export.working") : t("admin.export.button")}
      </button>

      {/* Announced, because a download that lands in a folder somewhere is
          invisible to somebody who cannot see the browser's download shelf. */}
      <p className="sr-only" role="status" ref={announcement}>
        {status === "done" ? t("admin.export.done") : ""}
      </p>

      {status === "error" && (
        <p className="field__error" role="alert">
          {t("admin.export.failed")}
        </p>
      )}
    </>
  );
}
