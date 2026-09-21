/**
 * How the request layer reaches the session without knowing what a session is.
 *
 * `plugins/**` never imports from `features/**`; the auth feature fills these
 * in at boot instead. Keeping it a seam also fixes an ordering problem: the
 * error-normalizing interceptor is installed when the instance is created, so
 * anything registered afterwards would receive an `ApiError` that has already
 * lost the `config` needed to retry.
 */
export type SessionHandlers = {
  /** The token to attach, or undefined when signed out. */
  getAccessToken: () => string | undefined;
  /**
   * Renews the session. Answers the new access token, or null when the session
   * is gone for good — the auth feature decides what that means.
   */
  refreshSession: () => Promise<string | null>;
};

let handlers: SessionHandlers | null = null;

/** Wires the session into the request layer. Call once at boot. */
export function registerSessionHandlers(next: SessionHandlers): void {
  handlers = next;
}

/** The handlers in force, or null when the app ships without auth. */
export function getSessionHandlers(): SessionHandlers | null {
  return handlers;
}

/** Clears the registration. Exists for tests. */
export function resetSessionHandlers(): void {
  handlers = null;
}
