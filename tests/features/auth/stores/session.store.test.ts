import { act } from "@testing-library/react-native";

import type { AuthTokens, AuthUser } from "@/features/auth/models/session.model";
import {
  selectFullName,
  selectIsAuthenticated,
  useSessionStore,
} from "@/features/auth/stores/session.store";
import { mmkvStorage } from "@/plugins/mmkv";

const user: AuthUser = {
  id: 1,
  username: "emilys",
  email: "emily@example.com",
  firstName: "Emily",
  lastName: "Johnson",
  image: "https://example.com/emily.png",
};

const tokens: AuthTokens = {
  accessToken: "access-1",
  refreshToken: "refresh-1",
};

beforeEach(() => {
  mmkvStorage.clearAll();
  act(() =>
    useSessionStore.setState({ user: null, tokens: null, signOutReason: null }),
  );
});

describe("useSessionStore", () => {
  it("starts signed out", () => {
    expect(selectIsAuthenticated(useSessionStore.getState())).toBe(false);
    expect(useSessionStore.getState().tokens).toBeNull();
  });

  it("holds the tokens itself rather than a side channel", () => {
    act(() => useSessionStore.getState().signIn({ user, tokens }));

    expect(useSessionStore.getState().tokens).toEqual(tokens);
    expect(selectIsAuthenticated(useSessionStore.getState())).toBe(true);
  });

  it("treats the tokens, not the profile, as what makes a session", () => {
    act(() => useSessionStore.setState({ user, tokens: null }));

    expect(selectIsAuthenticated(useSessionStore.getState())).toBe(false);
  });

  it("replaces only the tokens on refresh", () => {
    act(() => useSessionStore.getState().signIn({ user, tokens }));
    act(() =>
      useSessionStore.getState().setTokens({
        accessToken: "access-2",
        refreshToken: "refresh-2",
      }),
    );

    expect(useSessionStore.getState().tokens?.accessToken).toBe("access-2");
    expect(useSessionStore.getState().user).toEqual(user);
  });

  it("records why the session ended", () => {
    act(() => useSessionStore.getState().signIn({ user, tokens }));
    act(() => useSessionStore.getState().signOut("expired"));

    expect(useSessionStore.getState().user).toBeNull();
    expect(useSessionStore.getState().tokens).toBeNull();
    expect(useSessionStore.getState().signOutReason).toBe("expired");
  });

  it("clears the reason once it has been shown", () => {
    act(() => useSessionStore.getState().signOut("expired"));
    act(() => useSessionStore.getState().clearSignOutReason());

    expect(useSessionStore.getState().signOutReason).toBeNull();
  });

  it("drops a stale reason when a new session starts", () => {
    act(() => useSessionStore.getState().signOut("expired"));
    act(() => useSessionStore.getState().signIn({ user, tokens }));

    expect(useSessionStore.getState().signOutReason).toBeNull();
  });

  it("persists the session so a restart stays signed in", () => {
    act(() => useSessionStore.getState().signIn({ user, tokens }));

    const persisted = mmkvStorage.getString("auth.session");

    expect(persisted).toBeDefined();
    expect(persisted).toContain("access-1");
  });

  it("never persists the sign-out reason, so a restart raises no toast", () => {
    act(() => useSessionStore.getState().signOut("expired"));

    expect(mmkvStorage.getString("auth.session")).not.toContain("expired");
  });
});
