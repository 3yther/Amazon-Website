import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "./api.js";

// Who is signed in, shared by the header and the account pages. A context
// rather than a plain hook, so every component sees the same user.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false); // true once the first check is done

  /** Ask the API who is signed in. Call after login, register or logout. */
  const refresh = useCallback(async (options) => {
    try {
      setUser(await getCurrentUser(options));
    } catch (error) {
      if (error.name === "AbortError") return;
      // API unreachable: keep what we knew. Pages report the outage themselves.
    }
    setChecked(true);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    refresh({ signal: controller.signal });
    return () => controller.abort();
  }, [refresh]);

  const value = useMemo(() => ({ user, checked, refresh }), [user, checked, refresh]);
  return <AuthContext value={value}>{children}</AuthContext>;
}

/** { user, checked, refresh }. user is null when nobody is signed in. */
export function useAuth() {
  return useContext(AuthContext);
}
