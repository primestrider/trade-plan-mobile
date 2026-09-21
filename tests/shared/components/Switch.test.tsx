import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { Switch } from "@/shared/components/Switch";
import { useThemeStore } from "@/styles";
import { palette, radii } from "@/styles/tokens";

function styleOf(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID).props.style);
}

beforeEach(() => {
  act(() => useThemeStore.getState().setMode("light"));
});

describe("Switch", () => {
  it("reports its state to assistive technology", () => {
    render(<Switch value onValueChange={jest.fn()} testID="switch" />);

    const control = screen.getByTestId("switch");

    expect(control.props.accessibilityRole).toBe("switch");
    expect(control.props.accessibilityState).toEqual(
      expect.objectContaining({ checked: true }),
    );
  });

  it("asks for the negated value when pressed", () => {
    const onValueChange = jest.fn();
    render(
      <Switch value={false} onValueChange={onValueChange} testID="switch" />,
    );

    fireEvent.press(screen.getByTestId("switch"));

    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it("asks to turn off when already on", () => {
    const onValueChange = jest.fn();
    render(<Switch value onValueChange={onValueChange} testID="switch" />);

    fireEvent.press(screen.getByTestId("switch"));

    expect(onValueChange).toHaveBeenCalledWith(false);
  });

  it("stays controlled — it does not flip itself", () => {
    render(<Switch value={false} onValueChange={jest.fn()} testID="switch" />);

    fireEvent.press(screen.getByTestId("switch"));

    expect(
      screen.getByTestId("switch").props.accessibilityState.checked,
    ).toBe(false);
  });

  it("does not respond while disabled", () => {
    const onValueChange = jest.fn();
    render(
      <Switch
        value={false}
        disabled
        onValueChange={onValueChange}
        testID="switch"
      />,
    );

    fireEvent.press(screen.getByTestId("switch"));

    expect(onValueChange).not.toHaveBeenCalled();
    expect(styleOf("switch").opacity).toBe(0.5);
  });

  it("renders a label and description", () => {
    render(
      <Switch
        value
        onValueChange={jest.fn()}
        label="Notifications"
        description="Push alerts for new messages"
      />,
    );

    expect(screen.getByText("Notifications")).toBeOnTheScreen();
    expect(screen.getByText("Push alerts for new messages")).toBeOnTheScreen();
  });

  it("uses the platform's own control metrics per size", () => {
    const { rerender } = render(
      <Switch value onValueChange={jest.fn()} size="md" />,
    );

    expect(styleOf("switch-track")).toEqual(
      expect.objectContaining({ width: 51, height: 31 }),
    );
    expect(styleOf("switch-thumb")).toEqual(
      expect.objectContaining({ width: 27, height: 27 }),
    );

    rerender(<Switch value onValueChange={jest.fn()} size="sm" />);

    expect(styleOf("switch-track")).toEqual(
      expect.objectContaining({ width: 40, height: 24 }),
    );
  });

  it("rounds the track and thumb fully", () => {
    render(<Switch value onValueChange={jest.fn()} />);

    expect(styleOf("switch-track").borderRadius).toBe(radii.full);
    expect(styleOf("switch-thumb").borderRadius).toBe(radii.full);
  });

  it("keeps the thumb white so it reads on either track color", () => {
    render(<Switch value onValueChange={jest.fn()} />);

    expect(styleOf("switch-thumb").backgroundColor).toBe(palette.white);
  });

  it("lifts the thumb with a shadow", () => {
    render(<Switch value onValueChange={jest.fn()} />);

    expect(styleOf("switch-thumb").elevation).toBeGreaterThan(0);
  });
});
