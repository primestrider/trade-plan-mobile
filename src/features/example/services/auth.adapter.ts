import type { AuthAdapter } from "@/features/auth/models/session.model";

import { login, refreshSession } from "./api";

/**
 * Teaches the auth feature how to talk to DummyJSON.
 *
 * This is the whole surface a backend has to satisfy. Pointing the app at a
 * real API means writing a file like this one and registering it instead — the
 * guard, the store, and the interceptor stay exactly as they are.
 */
export const dummyJsonAuthAdapter: AuthAdapter = {
  signIn: async (credentials) => {
    const response = await login(credentials);

    return {
      user: {
        id: response.id,
        username: response.username,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        image: response.image,
      },
      tokens: {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      },
    };
  },

  refresh: (refreshToken) => refreshSession(refreshToken),
};
