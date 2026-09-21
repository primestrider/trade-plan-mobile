import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "@/plugins/mmkv/zustand";

import type {
  AuthTokens,
  AuthUser,
  SignOutReason,
} from "../models/session.model";

type SessionState = {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  /** Set when a session ends; cleared once the app has announced it. */
  signOutReason: SignOutReason | null;
  signIn: (payload: { user: AuthUser; tokens: AuthTokens }) => void;
  setTokens: (tokens: AuthTokens) => void;
  signOut: (reason: SignOutReason) => void;
  clearSignOutReason: () => void;
};

/**
 * The session, and the only place it lives.
 *
 * Tokens are held here rather than in a separate storage key so the store and
 * the request layer can never disagree about whether a session exists. Axios
 * reads this through `useSessionStore.getState()`, which works outside React.
 *
 * MMKV is synchronous, so the persisted session is rehydrated before the first
 * render and the guard never flashes the sign-in screen on a cold start.
 *
 * @example
 * const user = useSessionStore((state) => state.user);
 */
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      signOutReason: null,

      signIn: ({ user, tokens }) => set({ user, tokens, signOutReason: null }),

      setTokens: (tokens) => set({ tokens }),

      signOut: (reason) =>
        set({ user: null, tokens: null, signOutReason: reason }),

      clearSignOutReason: () => set({ signOutReason: null }),
    }),
    {
      name: "auth.session",
      storage: createJSONStorage(() => zustandStorage),
      // The reason is a one-shot announcement, not session state. Persisting it
      // would re-raise the "session expired" toast on every cold start.
      partialize: (state) => ({ user: state.user, tokens: state.tokens }),
    },
  ),
);

/**
 * True once a session exists.
 *
 * Deliberately keyed on the tokens rather than the profile: the token is what
 * decides whether a request can succeed.
 */
export const selectIsAuthenticated = (state: SessionState): boolean =>
  state.tokens !== null;

/** The signed-in user's display name, or an empty string when signed out. */
export const selectFullName = (state: SessionState): string =>
  state.user ? `${state.user.firstName} ${state.user.lastName}` : "";
