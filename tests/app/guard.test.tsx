// `RootLayout` renders `AppProvider`, which mounts a real
// `GestureHandlerRootView`. The library ships its own Jest mock for the
// native module it installs; imported here (rather than globally in
// `tests/setup.ts`) because no other suite renders far enough into the
// provider tree to need it.
import "react-native-gesture-handler/jestSetup";

import { act, render } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { useProfileStore } from "@/features/onboarding/stores/profile.store";
import "@/plugins/i18n";
import { mmkvStorage } from "@/plugins/mmkv";

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
 * redirecting, so onboarding is not "navigated to" — it is what remains when
 * the rest of the app is taken away.
 *
 * Rendering the real `RootLayout` with only `expo-router` replaced reads back
 * the wiring in `src/app/_layout.tsx` itself, rather than re-deriving the same
 * expression here and asserting it against itself.
 */
jest.mock("expo-router", () => {
  const { Children, isValidElement } = require("react");

  return {
    Stack: Object.assign(({ children }: { children: ReactNode }) => children, {
      Screen: ({ name }: { name?: string }) => {
        if (name) mockScreenLog.push(name);
        return null;
      },
      Protected: ({
        guard,
        children,
      }: {
        guard: boolean;
        children: ReactNode;
      }) => {
        // `require("react")` above is untyped, so `isValidElement` cannot
        // narrow `child` for the type checker the way the real import does.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Children.forEach(children, (child: any) => {
          if (!isValidElement(child)) return;
          const screenName = (child.props as { name?: string }).name;
          if (screenName) mockGuardLog.push({ screenName, guard });
        });
        return null;
      },
    }),
    useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
    Link: ({ children }: { children: ReactNode }) => children,
  };
});

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

beforeEach(() => {
  mmkvStorage.clearAll();
  mockGuardLog.length = 0;
  mockScreenLog.length = 0;
  act(() =>
    useProfileStore.setState({
      name: "",
      balance: 0,
      hasCompletedOnboarding: false,
    }),
  );
});

describe("the onboarding gate", () => {
  it("leaves onboarding as the only way forward on a fresh install", () => {
    render(<RootLayout />);

    expect(mockGuardLog).toEqual(
      expect.arrayContaining([
        { screenName: "onboarding", guard: true },
        { screenName: "(public)", guard: false },
      ]),
    );
  });

  it("takes onboarding away once the profile is stored", () => {
    act(() =>
      useProfileStore
        .getState()
        .completeOnboarding({ name: "Ricky", balance: 10_000_000 }),
    );

    render(<RootLayout />);

    expect(mockGuardLog).toEqual(
      expect.arrayContaining([
        { screenName: "onboarding", guard: false },
        { screenName: "(public)", guard: true },
      ]),
    );
  });

  /**
   * A guard only removes a route node it can name. `(public)` earns its
   * `_layout.tsx` for exactly this reason — see `tests/app/routes.test.ts`.
   */
  it("guards (public) rather than leaving it permanently mounted", () => {
    render(<RootLayout />);

    expect(mockScreenLog).not.toContain("(public)");
  });
});
