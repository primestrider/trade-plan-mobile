import type { SessionHandlers } from "@/plugins/axios/session";

import { useSessionStore } from "../stores/session.store";
import { ensureFreshToken } from "./refresh";

/**
 * What the request layer is allowed to know about the session.
 *
 * This is kept apart from `@/plugins/auth`, which only registers it: that
 * module runs its wiring as an import side effect and cannot be tested, and
 * the decision below — that a refusal to refresh ends the session as *expired*
 * rather than as a deliberate sign-out — is the behaviour this whole feature
 * turns on.
 *
 * Nothing here navigates. Clearing the session is what moves the guard.
 */
export const sessionHandlers: SessionHandlers = {
  getAccessToken: () => useSessionStore.getState().tokens?.accessToken,

  refreshSession: async () => {
    const tokens = await ensureFreshToken();

    if (!tokens) {
      // Once per expiry, not once per failed request. Every request that met
      // the 401 awaits the same refresh and arrives here together; a straggler
      // landing after the toast has consumed the reason would otherwise raise
      // a second one for the same dead session — or overwrite a deliberate
      // sign-out with "expired".
      if (useSessionStore.getState().tokens !== null) {
        useSessionStore.getState().signOut("expired");
      }

      return null;
    }

    return tokens.accessToken;
  },
};
