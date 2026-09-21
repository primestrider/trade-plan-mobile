import { act, render, screen } from "@testing-library/react-native";
import { ActivityIndicator, StyleSheet } from "react-native";

import { Spinner } from "@/shared/components/Spinner";
import { useThemeStore } from "@/styles";
import { colors, darkColors, spacing } from "@/styles/tokens";

function styleOf(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID).props.style);
}

function indicator() {
  return screen.UNSAFE_getByType(ActivityIndicator);
}

beforeEach(() => {
  act(() => useThemeStore.getState().setMode("light"));
});

describe("Spinner", () => {
  it("renders an activity indicator", () => {
    render(<Spinner testID="spinner" />);

    expect(screen.UNSAFE_queryByType(ActivityIndicator)).not.toBeNull();
  });

  it("centers its content", () => {
    render(<Spinner testID="spinner" />);

    const style = styleOf("spinner");

    expect(style.alignItems).toBe("center");
    expect(style.justifyContent).toBe("center");
  });

  it.each([
    ["sm", "small", spacing[1]],
    ["md", "small", spacing[2]],
    ["lg", "large", spacing[3]],
  ] as const)("maps size %s to its indicator and gap", (size, glyph, gap) => {
    render(<Spinner size={size} testID="spinner" />);

    expect(indicator().props.size).toBe(glyph);
    expect(styleOf("spinner").gap).toBe(gap);
  });

  it.each([
    ["primary", colors.primary],
    ["muted", colors.mutedForeground],
    ["inverse", colors.primaryForeground],
  ] as const)("tints the %s variant from the theme", (variant, expected) => {
    render(<Spinner variant={variant} />);

    expect(indicator().props.color).toBe(expected);
  });

  it("renders a caption under the spinner", () => {
    render(<Spinner label="Uploading" />);

    expect(screen.getByText("Uploading")).toBeOnTheScreen();
  });

  it("announces itself as a progress indicator", () => {
    render(<Spinner testID="spinner" />);

    const element = screen.getByTestId("spinner");

    expect(element.props.accessibilityRole).toBe("progressbar");
    expect(element.props.accessibilityLabel).toBe("Loading");
  });

  it("prefers the label as the accessibility label", () => {
    render(<Spinner label="Uploading" testID="spinner" />);

    expect(screen.getByTestId("spinner").props.accessibilityLabel).toBe(
      "Uploading",
    );
  });

  it("lets the caller override the accessibility label", () => {
    render(<Spinner label="Uploading" accessibilityLabel="Busy" testID="s" />);

    expect(screen.getByTestId("s").props.accessibilityLabel).toBe("Busy");
  });

  it("stays inline unless asked to overlay", () => {
    render(<Spinner testID="spinner" />);

    const style = styleOf("spinner");

    expect(style.position).toBeUndefined();
    expect(style.backgroundColor).toBeUndefined();
  });

  it("fills its parent with a scrim when overlaying", () => {
    render(<Spinner overlay testID="spinner" />);

    const style = styleOf("spinner");

    expect(style.position).toBe("absolute");
    expect(style).toEqual(
      expect.objectContaining({ top: 0, right: 0, bottom: 0, left: 0 }),
    );
    expect(style.backgroundColor).toBe(`${colors.background}CC`);
  });

  it("follows the active color scheme", () => {
    render(<Spinner overlay testID="spinner" />);

    expect(indicator().props.color).toBe(colors.primary);
    expect(styleOf("spinner").backgroundColor).toBe(`${colors.background}CC`);

    act(() => useThemeStore.getState().setMode("dark"));

    expect(indicator().props.color).toBe(darkColors.primary);
    expect(styleOf("spinner").backgroundColor).toBe(
      `${darkColors.background}CC`,
    );
  });

  it("lets an external style win", () => {
    render(<Spinner overlay style={{ backgroundColor: "red" }} testID="s" />);

    expect(styleOf("s").backgroundColor).toBe("red");
  });

  it("forwards props to the underlying View", () => {
    render(<Spinner testID="spinner" pointerEvents="none" />);

    expect(screen.getByTestId("spinner").props.pointerEvents).toBe("none");
  });
});
