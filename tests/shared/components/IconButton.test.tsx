import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { ActivityIndicator, StyleSheet, Text } from "react-native";

import { IconButton } from "@/shared/components/IconButton";
import { useThemeStore } from "@/styles";
import { colors, darkColors, palette, radii, spacing } from "@/styles/tokens";

function styleOf(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID).props.style);
}

const icon = <Text>icon</Text>;

beforeEach(() => {
  act(() => useThemeStore.getState().setMode("light"));
});

describe("IconButton", () => {
  it("renders its icon", () => {
    render(<IconButton icon={icon} accessibilityLabel="Search" />);

    expect(screen.getByText("icon")).toBeOnTheScreen();
  });

  it("puts the required label on the host element", () => {
    render(
      <IconButton icon={icon} accessibilityLabel="Search" testID="button" />,
    );

    const button = screen.getByTestId("button");

    expect(button.props.accessibilityLabel).toBe("Search");
    expect(button.props.accessibilityRole).toBe("button");
    expect(screen.getByLabelText("Search")).toBeOnTheScreen();
  });

  it("calls onPress when tapped", () => {
    const onPress = jest.fn();
    render(
      <IconButton
        icon={icon}
        accessibilityLabel="Search"
        onPress={onPress}
        testID="button"
      />,
    );

    fireEvent.press(screen.getByTestId("button"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress while disabled", () => {
    const onPress = jest.fn();
    render(
      <IconButton
        icon={icon}
        accessibilityLabel="Search"
        disabled
        onPress={onPress}
        testID="button"
      />,
    );

    fireEvent.press(screen.getByTestId("button"));

    expect(onPress).not.toHaveBeenCalled();
    expect(styleOf("button").opacity).toBe(0.5);
  });

  it("swaps the icon for a spinner while loading and blocks the press", () => {
    const onPress = jest.fn();
    render(
      <IconButton
        icon={icon}
        accessibilityLabel="Search"
        loading
        onPress={onPress}
        testID="button"
      />,
    );

    fireEvent.press(screen.getByTestId("button"));

    expect(onPress).not.toHaveBeenCalled();
    expect(screen.queryByText("icon")).toBeNull();
    expect(screen.UNSAFE_queryByType(ActivityIndicator)).not.toBeNull();
  });

  it("shows no spinner when idle", () => {
    render(<IconButton icon={icon} accessibilityLabel="Search" />);

    expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
  });

  it("is fully rounded", () => {
    render(
      <IconButton icon={icon} accessibilityLabel="Search" testID="button" />,
    );

    expect(styleOf("button").borderRadius).toBe(radii.full);
  });

  describe("variants", () => {
    it.each([
      ["primary", colors.primary],
      ["secondary", colors.secondary],
      ["destructive", colors.destructive],
    ] as const)("%s paints its themed background", (variant, background) => {
      render(
        <IconButton
          icon={icon}
          accessibilityLabel="Search"
          variant={variant}
          testID="button"
        />,
      );

      expect(styleOf("button").backgroundColor).toBe(background);
    });

    it("ghost stays transparent", () => {
      render(
        <IconButton
          icon={icon}
          accessibilityLabel="Search"
          variant="ghost"
          testID="button"
        />,
      );

      expect(styleOf("button").backgroundColor).toBe(palette.transparent);
    });

    it("follows the active color scheme", () => {
      render(
        <IconButton icon={icon} accessibilityLabel="Search" testID="button" />,
      );

      expect(styleOf("button").backgroundColor).toBe(colors.primary);

      act(() => useThemeStore.getState().setMode("dark"));

      expect(styleOf("button").backgroundColor).toBe(darkColors.primary);
    });
  });

  describe("sizes", () => {
    it.each([
      ["sm", spacing[8]],
      ["md", spacing[10]],
      ["lg", spacing[12]],
    ] as const)("%s stays square on the spacing scale", (size, expected) => {
      render(
        <IconButton
          icon={icon}
          accessibilityLabel="Search"
          size={size}
          testID="button"
        />,
      );

      const style = styleOf("button");

      expect(style.width).toBe(expected);
      expect(style.height).toBe(expected);
    });
  });

  it("merges a caller-provided style", () => {
    render(
      <IconButton
        icon={icon}
        accessibilityLabel="Search"
        testID="button"
        style={{ marginLeft: spacing[4] }}
      />,
    );

    expect(styleOf("button").marginLeft).toBe(spacing[4]);
  });
});
