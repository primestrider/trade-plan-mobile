import { registerAuthAdapter, sessionHandlers } from "@/features/auth";
import { dummyJsonAuthAdapter } from "@/features/example/services/auth.adapter";
import { registerSessionHandlers } from "@/plugins/axios/session";

/**
 * Where the app is wired to a backend. Importing this module performs the
 * wiring, the same way `@/plugins/i18n` initializes i18next on import.
 *
 * To point the app at your own API, write an adapter like
 * `dummyJsonAuthAdapter` and register it here. Nothing else changes — not the
 * guard, not the store, not the interceptor.
 */
registerAuthAdapter(dummyJsonAuthAdapter);
registerSessionHandlers(sessionHandlers);
