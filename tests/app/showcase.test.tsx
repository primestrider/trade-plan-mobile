import { render, screen } from "@testing-library/react-native";
import type { ComponentType, ReactNode } from "react";

import FormExample from "@/app/(public)/example/form";
import ComponentsIndex from "@/app/(public)/example/components/index";
import DisplayComponents from "@/app/(public)/example/components/display";
import FormComponents from "@/app/(public)/example/components/form";
import LayoutComponents from "@/app/(public)/example/components/layout";
import OverlayComponents from "@/app/(public)/example/components/overlay";
import Index from "@/app/(public)/index";
import { ToastProvider } from "@/shared/components";

/**
 * The showcase screens are the only place every component is composed together
 * with real props. Type-checking proves the props line up; this proves the
 * screens actually render — compound sub-components, slots, and all.
 */
jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ push: jest.fn() }),
  Link: ({ children }: { children: ReactNode }) => children,
}));

// Several of these screens mount looping animations (Skeleton, an
// indeterminate ProgressBar). Fake timers keep those callbacks from firing
// against a torn-down environment once a test finishes.
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

function renderScreen(Component: ComponentType) {
  return render(
    <ToastProvider>
      <Component />
    </ToastProvider>,
  );
}

describe("component showcase screens", () => {
  it("renders the components index", () => {
    renderScreen(ComponentsIndex);

    expect(screen.getByText("Component Library")).toBeOnTheScreen();
    expect(screen.getByText("Layout & Surfaces")).toBeOnTheScreen();
    expect(screen.getByText("Overlays & Feedback")).toBeOnTheScreen();
  });

  it("renders every layout and surface component", () => {
    renderScreen(LayoutComponents);

    expect(screen.getByText("Elevated")).toBeOnTheScreen();
    expect(screen.getByText("Outlined")).toBeOnTheScreen();
    expect(screen.getByText("Sign out")).toBeOnTheScreen();
    expect(screen.getByText("What radius does this use?")).toBeOnTheScreen();
  });

  it("renders every data display component", () => {
    renderScreen(DisplayComponents);

    expect(screen.getByText("Destructive")).toBeOnTheScreen();
    expect(screen.getByText("Removable")).toBeOnTheScreen();
    expect(screen.getByText("No messages yet")).toBeOnTheScreen();
  });

  it("renders every form control", () => {
    renderScreen(FormComponents);

    expect(screen.getByText("Accept terms")).toBeOnTheScreen();
    expect(screen.getByText("Notifications")).toBeOnTheScreen();
    expect(screen.getByText("Pick one")).toBeOnTheScreen();
    // Icon-only controls are identified by their label alone, so each must be
    // reachable on its own.
    expect(screen.getByLabelText("Add note")).toBeTruthy();
    expect(screen.getByLabelText("Add task")).toBeTruthy();
    expect(screen.getByLabelText("Add urgent item")).toBeTruthy();
  });

  it("renders every overlay trigger", () => {
    renderScreen(OverlayComponents);

    expect(screen.getByText("Open dialog")).toBeOnTheScreen();
    expect(screen.getByText("Heads up")).toBeOnTheScreen();
    expect(screen.getByText("Could not save")).toBeOnTheScreen();
  });

  it("renders the form example screen", () => {
    renderScreen(FormExample);

    expect(screen.getByText("Form Example")).toBeOnTheScreen();
    expect(screen.getByText("Full Name")).toBeOnTheScreen();
  });

  it("renders the home screen", () => {
    renderScreen(Index);

    expect(screen.getByText("RN Expo Boilerplate")).toBeOnTheScreen();
    expect(screen.getByText("Open Components")).toBeOnTheScreen();
  });
});
