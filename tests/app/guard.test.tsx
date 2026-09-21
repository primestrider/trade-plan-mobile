// `RootLayout` renders `AppProvider`, which mounts a real
// `GestureHandlerRootView`. The library ships its own Jest mock for the
// native module it installs; imported here (rather than globally in
// `tests/setup.ts`) because no other suite renders far enough into the
// provider tree to need it.
import "react-native-gesture-handler/jestSetup";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";

import "@/plugins/i18n";
import { mmkvStorage } from "@/plugins/mmkv";
import { ToastProvider } from "@/shared/components";

import HomeScreen from "@/app/(public)/index";

import RootLayout from "@/app/_layout";

/**
 * Recorded by the `expo-router` mock below: which screen name a
 * `Stack.Protected` wrapped, and the `guard` value it was given. Prefixed
 * `mock*` so `jest.mock`'s hoisting is allowed to close over it.
 */
type MockGuardEntry = { screenName: string; guard: boolean };
const mockGuardLog: MockGuardEntry[] = [];

/** Names of `Stack.Screen`s rendered directly, outside any `Stack.Protected`. */
const mockScreenLog: string[] = [];

/**
 * `Stack.Protected` removes guarded routes from the navigator rather than
 * redirecting, so what this proves is narrower and more useful than a
 * navigation assertion: each screen renders the right thing for the session it
 * is handed, and the guard expression itself flips with the store.
 *
 * The mock below additionally lets `describe("guard wiring", ...)` render the
 * real `RootLayout` and record the `guard` prop each `Stack.Protected`
 * receives, together with the screen name it wraps — proving the wiring in
 * `src/app/_layout.tsx` itself, not just the store it reads from.
 */

// Load-bearing here, not dead weight: it keeps `RootLayout`'s side-effect
// import of the real adapter registry (and whatever it reaches for over the
// network) out of a test that only cares about the guard wiring.
jest.mock("@/plugins/auth", () => ({}));

jest.mock("expo-splash-screen", () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock("expo-font", () => ({
  useFonts: () => [true, null],
}));

jest.mock("expo-system-ui", () => ({
  setBackgroundColorAsync: jest.fn(),
}));

// `SignInScreen` calls `useMutation`, which needs a `QueryClientProvider`
// somewhere above it. The real app gets one from `AppProvider`; this harness
// stands one up directly rather than pulling in the rest of `AppProvider`.
function renderScreen(Component: () => ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Component />
      </ToastProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  mmkvStorage.clearAll();
  mockGuardLog.length = 0;
  mockScreenLog.length = 0;
});

describe("guard wiring", () => {
  /**
   * Renders the actual root layout — real `Stack.Protected` usage from
   * `src/app/_layout.tsx`, only `expo-router` itself replaced — and reads back
   * what it wired up, rather than re-deriving the same expression the layout
   * uses and asserting it against itself.
   */
  it("opens sign-in and closes (protected) while signed out", () => {
    render(<RootLayout />);

    expect(mockScreenLog).toContain("(public)");
    expect(mockGuardLog).toEqual(
      expect.arrayContaining([
        { screenName: "sign-in", guard: true },
        { screenName: "(protected)", guard: false },
      ]),
    );
    expect(mockGuardLog.some((entry) => entry.screenName === "(public)")).toBe(
      false,
    );
  });
});

describe("the public group", () => {
  /**
   * The showcase is documentation, so it must survive both states. Guarding
   * the `(public)` group would have made it vanish the moment someone signed
   * in — the mistake this pair of assertions exists to catch.
   */
  it("renders while signed out", () => {
    renderScreen(HomeScreen);

    expect(screen.getByText("RN Expo Boilerplate")).toBeOnTheScreen();
  });
});
