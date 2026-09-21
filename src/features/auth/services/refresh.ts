import type { AuthTokens } from "../models/session.model";
import { useSessionStore } from "../stores/session.store";
import { getAuthAdapter } from "./adapter";

/**
 * The refresh currently in progress, if any.
 *
 * Module state rather than store state: nothing re-renders when a refresh
 * starts, and React must not be able to observe it mid-flight.
 */
let inFlight: Promise<AuthTokens | null> | null = null;

async function runRefresh(): Promise<AuthTokens | null> {
  const { tokens, setTokens } = useSessionStore.getState();

  // Nothing to exchange — there is no session to save.
  if (!tokens?.refreshToken) return null;

  try {
    const next = await getAuthAdapter().refresh(tokens.refreshToken);
    setTokens(next);
    return next;
  } catch {
    // Why it failed does not change what the caller can do about it.
    return null;
  }
}

/**
 * Renews the session, at most once at a time.
 *
 * Ten requests that all meet a 401 together await the same refresh and then
 * each retry themselves. Without this, ten refreshes would race and the last
 * one to land would overwrite tokens the others are already using.
 *
 * Answers `null` when the session cannot be renewed. Deciding what that means
 * — signing out, announcing it — belongs to the caller, so this stays usable
 * from anywhere.
 *
 * @example
 * const tokens = await ensureFreshToken();
 * if (!tokens) useSessionStore.getState().signOut("expired");
 */
export function ensureFreshToken(): Promise<AuthTokens | null> {
  if (inFlight) return inFlight;

  inFlight = runRefresh().finally(() => {
    inFlight = null;
  });

  return inFlight;
}
