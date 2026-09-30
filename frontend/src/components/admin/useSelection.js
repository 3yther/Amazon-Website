import { useCallback, useMemo, useState } from "react";

/**
 * Which rows are ticked, for the bulk controls.
 *
 * Kept by id rather than by index, so it survives the list being refetched,
 * sorted or filtered. A selection held by row position quietly starts
 * pointing at different records the moment anything reorders, which on a
 * control whose job is deleting things is the worst possible bug.
 *
 * It is NOT kept across pages on purpose. "Select all" means the page you can
 * see, and a tick you cannot see is a tick you did not mean.
 */
export default function useSelection(rows = []) {
  const [chosen, setChosen] = useState(() => new Set());

  const ids = useMemo(() => rows.map((row) => row.id), [rows]);

  // Anything ticked that is no longer on screen is dropped, so the count and
  // the confirmation always describe what is actually in front of somebody.
  const onPage = useMemo(() => ids.filter((id) => chosen.has(id)), [ids, chosen]);

  const toggle = useCallback((id) => {
    setChosen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allOnPage = ids.length > 0 && onPage.length === ids.length;

  const toggleAll = useCallback(() => {
    setChosen((current) => {
      const next = new Set(current);
      const everyOne = ids.length > 0 && ids.every((id) => next.has(id));
      for (const id of ids) {
        if (everyOne) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  }, [ids]);

  const clear = useCallback(() => setChosen(new Set()), []);

  return {
    selected: onPage,
    count: onPage.length,
    has: (id) => chosen.has(id),
    toggle,
    toggleAll,
    allOnPage,
    clear,
  };
}
