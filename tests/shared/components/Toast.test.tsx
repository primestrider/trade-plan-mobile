import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { Button } from "@/shared/components/Button";
import { ToastProvider, useToast } from "@/shared/components/Toast";
import { useThemeStore } from "@/styles";
import { colors } from "@/styles/tokens";

/** Exercises the hook the way a screen would. */
function Harness() {
  const toast = useToast();

  return (
    <>
      <Button title="Raise" onPress={() => toast.success("Saved", "All good")} />
      <Button title="Raise error" onPress={() => toast.error("Failed")} />
      <Button title="Raise all" onPress={() => toast.dismissAll()} />
    </>
  );
}

function renderWithProvider() {
  return render(
    <ToastProvider>
      <Harness />
    </ToastProvider>,
  );
}

beforeEach(() => {
  act(() => useThemeStore.getState().setMode("light"));
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("Toast", () => {
  it("refuses to work outside a provider", () => {
    // The thrown error is the point of the test; keep it out of the output.
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<Harness />)).toThrow(
      "useToast must be used within a ToastProvider",
    );

    spy.mockRestore();
  });

  it("renders nothing until something is raised", () => {
    renderWithProvider();

    expect(screen.queryByTestId("toast-container")).toBeNull();
  });

  it("shows a toast with its title and description", () => {
    renderWithProvider();

    fireEvent.press(screen.getByText("Raise"));

    expect(screen.getByText("Saved")).toBeOnTheScreen();
    expect(screen.getByText("All good")).toBeOnTheScreen();
  });

  it("accents a toast with its variant color", () => {
    renderWithProvider();

    fireEvent.press(screen.getByText("Raise"));

    const accent = StyleSheet.flatten(
      screen.getByTestId("toast-accent-success").props.style,
    );

    expect(accent.backgroundColor).toBe(colors.success);
  });

  it("stacks several toasts", () => {
    renderWithProvider();

    fireEvent.press(screen.getByText("Raise"));
    fireEvent.press(screen.getByText("Raise error"));

    expect(screen.getByText("Saved")).toBeOnTheScreen();
    expect(screen.getByText("Failed")).toBeOnTheScreen();
  });

  it("dismisses itself once its duration elapses", () => {
    renderWithProvider();

    fireEvent.press(screen.getByText("Raise"));

    expect(screen.getByText("Saved")).toBeOnTheScreen();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.queryByText("Saved")).toBeNull();
  });

  it("dismisses when the close affordance is pressed", () => {
    renderWithProvider();

    fireEvent.press(screen.getByText("Raise"));
    fireEvent.press(screen.getByLabelText("Dismiss"));

    expect(screen.queryByText("Saved")).toBeNull();
  });

  it("clears every toast at once", () => {
    renderWithProvider();

    fireEvent.press(screen.getByText("Raise"));
    fireEvent.press(screen.getByText("Raise error"));
    fireEvent.press(screen.getByText("Raise all"));

    expect(screen.queryByText("Saved")).toBeNull();
    expect(screen.queryByText("Failed")).toBeNull();
  });
});
