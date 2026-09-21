import { render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";

import NotFoundScreen from "@/app/+not-found";
import { ErrorBoundary } from "@/app/_layout";
import { AppErrorBoundary } from "@/shared/components/AppErrorBoundary";
import "@/plugins/i18n";

jest.mock("expo-router", () => ({
  Stack: Object.assign(() => null, {
    Screen: () => null,
    Protected: ({ children }: { children: ReactNode }) => children,
  }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  Link: ({ children }: { children: ReactNode }) => children,
}));

jest.mock("@/plugins/auth", () => ({}));

// Importing `@/app/_layout` for the re-export assertion below runs its module
// side effects, so the modules it touches at import time are stubbed here.
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

describe("+not-found", () => {
  it("explains that the route does not exist", () => {
    render(<NotFoundScreen />);

    expect(screen.getByText("This screen does not exist")).toBeOnTheScreen();
  });

  it("offers a way back", () => {
    render(<NotFoundScreen />);

    expect(screen.getByText("Go to home")).toBeOnTheScreen();
  });
});

describe("AppErrorBoundary", () => {
  /**
   * Rendered bare, with no providers around it. That is not a shortcut — it is
   * the situation this component exists for: when the root layout itself
   * throws, the fallback replaces it and every provider the layout mounts is
   * gone with it.
   */
  it("renders without any provider in scope", () => {
    render(<AppErrorBoundary error={new Error("boom")} retry={jest.fn()} />);

    expect(screen.getByText("Something went wrong")).toBeOnTheScreen();
  });

  it("offers a retry", () => {
    const retry = jest.fn();

    render(<AppErrorBoundary error={new Error("boom")} retry={retry} />);

    expect(screen.getByText("Try again")).toBeOnTheScreen();
  });

  it("shows the real message while developing", () => {
    render(<AppErrorBoundary error={new Error("boom")} retry={jest.fn()} />);

    // __DEV__ is true under Jest, which is exactly the case being asserted.
    expect(screen.getByText("boom")).toBeOnTheScreen();
  });

  /**
   * The tests above import the component directly, so they would all stay
   * green if `src/app/_layout.tsx` stopped re-exporting it — and the app would
   * quietly lose its error boundary, because the re-export is the whole of how
   * Expo Router finds it.
   */
  it("is what the root layout hands Expo Router", () => {
    expect(ErrorBoundary).toBeDefined();
    expect(ErrorBoundary).toBe(AppErrorBoundary);
  });
});
