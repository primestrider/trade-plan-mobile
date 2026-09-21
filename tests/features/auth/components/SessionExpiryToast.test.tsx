import { act, render, screen } from "@testing-library/react-native";

import { SessionExpiryToast } from "@/features/auth/components/SessionExpiryToast";
import { useSessionStore } from "@/features/auth";
import "@/plugins/i18n";
import { mmkvStorage } from "@/plugins/mmkv";
import { ToastProvider } from "@/shared/components";

function renderWatcher() {
  return render(
    <ToastProvider>
      <SessionExpiryToast />
    </ToastProvider>,
  );
}

beforeEach(() => {
  jest.useFakeTimers();
  mmkvStorage.clearAll();
  act(() =>
    useSessionStore.setState({ user: null, tokens: null, signOutReason: null }),
  );
});

afterEach(() => {
  jest.useRealTimers();
});

describe("SessionExpiryToast", () => {
  it("stays quiet while the session is fine", () => {
    renderWatcher();

    expect(screen.queryByTestId("toast-container")).not.toBeOnTheScreen();
  });

  it("announces a session that expired", () => {
    renderWatcher();

    act(() => useSessionStore.getState().signOut("expired"));

    expect(screen.getByTestId("toast-container")).toBeOnTheScreen();
    expect(
      screen.getByText("Your session has expired. Please sign in again."),
    ).toBeOnTheScreen();
  });

  it("says nothing when the user signed out deliberately", () => {
    renderWatcher();

    act(() => useSessionStore.getState().signOut("user"));

    expect(screen.queryByTestId("toast-container")).not.toBeOnTheScreen();
  });

  it("clears the reason so it is announced only once", () => {
    renderWatcher();

    act(() => useSessionStore.getState().signOut("expired"));

    expect(useSessionStore.getState().signOutReason).toBeNull();
  });
});
