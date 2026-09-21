import { fireEvent, render, screen } from "@testing-library/react-native";
import { ActivityIndicator, StyleSheet, Text } from "react-native";

import { Button } from "@/shared/components";
import { colors, fontSize, palette, spacing } from "@/styles/tokens";

function styleOf(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID).props.style);
}

describe("Button", () => {
  it("renders its title", () => {
    render(<Button title="Save" />);

    expect(screen.getByText("Save")).toBeOnTheScreen();
  });

  it("renders children alongside the title", () => {
    render(
      <Button title="Save">
        <Text>icon</Text>
      </Button>,
    );

    expect(screen.getByText("Save")).toBeOnTheScreen();
    expect(screen.getByText("icon")).toBeOnTheScreen();
  });

  it("calls onPress when tapped", () => {
    const onPress = jest.fn();
    render(<Button title="Save" onPress={onPress} />);

    fireEvent.press(screen.getByText("Save"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress while disabled", () => {
    const onPress = jest.fn();
    render(<Button title="Save" disabled onPress={onPress} testID="button" />);

    fireEvent.press(screen.getByTestId("button"));

    expect(onPress).not.toHaveBeenCalled();
  });

  it("does not call onPress while loading", () => {
    const onPress = jest.fn();
    render(<Button title="Save" loading onPress={onPress} testID="button" />);

    fireEvent.press(screen.getByTestId("button"));

    expect(onPress).not.toHaveBeenCalled();
  });

  it("shows a spinner only while loading", () => {
    const { rerender } = render(<Button title="Save" />);

    expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();

    rerender(<Button title="Save" loading />);

    expect(screen.UNSAFE_queryByType(ActivityIndicator)).not.toBeNull();
  });

  it("dims itself when disabled", () => {
    render(<Button title="Save" disabled testID="button" />);

    expect(styleOf("button").opacity).toBe(0.5);
  });

  describe("variants", () => {
    it.each([
      ["primary", colors.primary, colors.primaryForeground],
      ["secondary", colors.secondary, colors.secondaryForeground],
      ["destructive", colors.destructive, colors.destructiveForeground],
    ] as const)("%s uses its themed colors", (variant, background, label) => {
      render(<Button title="Save" variant={variant} testID="button" />);

      expect(styleOf("button").backgroundColor).toBe(background);
      expect(
        StyleSheet.flatten(screen.getByText("Save").props.style).color,
      ).toBe(label);
    });

    it("outline draws a border over a transparent background", () => {
      render(<Button title="Save" variant="outline" testID="button" />);

      const style = styleOf("button");

      expect(style.backgroundColor).toBe(palette.transparent);
      expect(style.borderWidth).toBe(1.5);
      expect(style.borderColor).toBe(colors.border);
    });

    it("ghost stays transparent and borderless", () => {
      render(<Button title="Save" variant="ghost" testID="button" />);

      const style = styleOf("button");

      expect(style.backgroundColor).toBe(palette.transparent);
      expect(style.borderWidth).toBe(0);
    });
  });

  describe("sizes", () => {
    it.each([
      ["sm", spacing[2], spacing[3], fontSize.sm],
      ["md", spacing[3], spacing[5], fontSize.base],
      ["lg", spacing[4], spacing[7], fontSize.lg],
    ] as const)("%s applies its padding and text size", (size, py, px, font) => {
      render(<Button title="Save" size={size} testID="button" />);

      const style = styleOf("button");

      expect(style.paddingVertical).toBe(py);
      expect(style.paddingHorizontal).toBe(px);
      expect(
        StyleSheet.flatten(screen.getByText("Save").props.style).fontSize,
      ).toBe(font);
    });
  });

  it("stretches to full width only when block is set", () => {
    const { rerender } = render(<Button title="Save" testID="button" />);

    expect(styleOf("button").width).toBeUndefined();

    rerender(<Button title="Save" block testID="button" />);

    expect(styleOf("button").width).toBe("100%");
  });

  it("merges a caller-provided style", () => {
    render(<Button title="Save" testID="button" style={{ marginTop: 24 }} />);

    expect(styleOf("button").marginTop).toBe(24);
  });
});
