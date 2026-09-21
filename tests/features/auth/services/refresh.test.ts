import { act } from "@testing-library/react-native";

import type { AuthAdapter, AuthTokens, AuthUser } from "@/features/auth/models/session.model";
import { registerAuthAdapter, resetAuthAdapter } from "@/features/auth/services/adapter";
import { ensureFreshToken } from "@/features/auth/services/refresh";
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

/** Resolves only when the test says so, so overlap can be observed. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function adapterWith(refresh: AuthAdapter["refresh"]): AuthAdapter {
  return { signIn: jest.fn(), refresh };
}

beforeEach(() => {
  mmkvStorage.clearAll();
  resetAuthAdapter();
  act(() =>
    useSessionStore.setState({ user, tokens, signOutReason: null }),
  );
});

describe("ensureFreshToken", () => {
  it("stores the renewed tokens", async () => {
    registerAuthAdapter(adapterWith(jest.fn().mockResolvedValue(renewed)));

    await expect(ensureFreshToken()).resolves.toEqual(renewed);
    expect(useSessionStore.getState().tokens).toEqual(renewed);
  });

  it("passes the stored refresh token to the adapter", async () => {
    const refresh = jest.fn().mockResolvedValue(renewed);
    registerAuthAdapter(adapterWith(refresh));

    await ensureFreshToken();

    expect(refresh).toHaveBeenCalledWith("refresh-1");
  });

  it("refreshes once for ten overlapping callers", async () => {
    const gate = deferred<AuthTokens>();
    const refresh = jest.fn().mockReturnValue(gate.promise);
    registerAuthAdapter(adapterWith(refresh));

    const callers = Array.from({ length: 10 }, () => ensureFreshToken());
    gate.resolve(renewed);

    const results = await Promise.all(callers);

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(results.every((result) => result === results[0])).toBe(true);
    expect(results[0]).toEqual(renewed);
  });

  it("allows a fresh attempt after the first one settled", async () => {
    const refresh = jest.fn().mockResolvedValue(renewed);
    registerAuthAdapter(adapterWith(refresh));

    await ensureFreshToken();
    await ensureFreshToken();

    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it("answers null when the backend rejects the refresh", async () => {
    registerAuthAdapter(
      adapterWith(jest.fn().mockRejectedValue(new Error("nope"))),
    );

    await expect(ensureFreshToken()).resolves.toBeNull();
  });

  it("leaves the session untouched — signing out is the caller's decision", async () => {
    registerAuthAdapter(
      adapterWith(jest.fn().mockRejectedValue(new Error("nope"))),
    );

    await ensureFreshToken();

    expect(useSessionStore.getState().tokens).toEqual(tokens);
  });

  it("never calls the backend when no refresh token is stored", async () => {
    const refresh = jest.fn();
    registerAuthAdapter(adapterWith(refresh));
    act(() => useSessionStore.setState({ tokens: null }));

    await expect(ensureFreshToken()).resolves.toBeNull();
    expect(refresh).not.toHaveBeenCalled();
  });
});
