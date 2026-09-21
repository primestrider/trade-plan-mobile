import { act } from "@testing-library/react-native";

import type {
  AuthAdapter,
  AuthTokens,
  AuthUser,
} from "@/features/auth/models/session.model";
import { registerAuthAdapter, resetAuthAdapter } from "@/features/auth/services/adapter";
import { sessionHandlers } from "@/features/auth/services/sessionHandlers";
import { useSessionStore } from "@/features/auth/stores/session.store";
import { mmkvStorage } from "@/plugins/mmkv";

const user: AuthUser = {
  id: 1,
  username: "emilys",
  email: "emily@example.com",
  firstName: "Emily",
  lastName: "Johnson",
  image: "https://example.com/emily.png",
};

const tokens: AuthTokens = { accessToken: "access-1", refreshToken: "refresh-1" };
const renewed: AuthTokens = { accessToken: "access-2", refreshToken: "refresh-2" };

function adapterWith(refresh: AuthAdapter["refresh"]): AuthAdapter {
  return { signIn: jest.fn(), refresh };
}

beforeEach(() => {
  mmkvStorage.clearAll();
  resetAuthAdapter();
  act(() => useSessionStore.setState({ user, tokens, signOutReason: null }));
});

describe("sessionHandlers.getAccessToken", () => {
  it("reads the token straight off the session", () => {
    expect(sessionHandlers.getAccessToken()).toBe("access-1");
  });

  it("answers undefined when signed out", () => {
    act(() => useSessionStore.setState({ tokens: null }));

    expect(sessionHandlers.getAccessToken()).toBeUndefined();
  });
});

describe("sessionHandlers.refreshSession", () => {
  it("hands back the renewed access token", async () => {
    registerAuthAdapter(adapterWith(jest.fn().mockResolvedValue(renewed)));

    await expect(sessionHandlers.refreshSession()).resolves.toBe("access-2");
  });

  it("keeps the session alive on a successful refresh", async () => {
    registerAuthAdapter(adapterWith(jest.fn().mockResolvedValue(renewed)));

    await sessionHandlers.refreshSession();

    expect(useSessionStore.getState().user).toEqual(user);
    expect(useSessionStore.getState().signOutReason).toBeNull();
  });

  it("ends the session when the refresh is refused", async () => {
    registerAuthAdapter(adapterWith(jest.fn().mockRejectedValue(new Error("no"))));

    await expect(sessionHandlers.refreshSession()).resolves.toBeNull();

    expect(useSessionStore.getState().tokens).toBeNull();
    expect(useSessionStore.getState().user).toBeNull();
  });

  it("records that the session expired rather than was left", async () => {
    registerAuthAdapter(adapterWith(jest.fn().mockRejectedValue(new Error("no"))));

    await sessionHandlers.refreshSession();

    expect(useSessionStore.getState().signOutReason).toBe("expired");
  });

  /**
   * One expiry, one announcement. Requests that meet a 401 together usually
   * batch into a single render, but a straggler arriving after the toast has
   * already consumed the reason would otherwise raise a second one for the
   * same dead session.
   */
  it("does not raise the reason again once the session is already gone", async () => {
    registerAuthAdapter(adapterWith(jest.fn().mockRejectedValue(new Error("no"))));

    await sessionHandlers.refreshSession();
    act(() => useSessionStore.getState().clearSignOutReason());

    await expect(sessionHandlers.refreshSession()).resolves.toBeNull();

    expect(useSessionStore.getState().signOutReason).toBeNull();
  });

  it("leaves a deliberate sign-out recorded as deliberate", async () => {
    registerAuthAdapter(adapterWith(jest.fn().mockRejectedValue(new Error("no"))));
    act(() => useSessionStore.getState().signOut("user"));

    await sessionHandlers.refreshSession();

    expect(useSessionStore.getState().signOutReason).toBe("user");
  });
});
