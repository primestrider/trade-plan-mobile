import type { AuthAdapter } from "../models/session.model";

let registered: AuthAdapter | null = null;

/**
 * Points this feature at a backend. Call once at boot.
 *
 * @example
 * registerAuthAdapter(dummyJsonAuthAdapter);
 */
export function registerAuthAdapter(adapter: AuthAdapter): void {
  registered = adapter;
}

/**
 * The adapter in force.
 *
 * Throws rather than returning null: a missing adapter is a wiring mistake,
 * and it should surface at the first call with an instruction attached, not as
 * a confusing null somewhere deep in a request.
 */
export function getAuthAdapter(): AuthAdapter {
  if (!registered) {
    throw new Error(
      "No auth adapter registered. Call registerAuthAdapter() at boot — see src/plugins/auth.",
    );
  }

  return registered;
}

/** Clears the registration. Exists for tests, which must not leak into each other. */
export function resetAuthAdapter(): void {
  registered = null;
}
