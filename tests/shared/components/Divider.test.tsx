import { act, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { Divider } from "@/shared/components";
import { useThemeStore } from "@/styles";
import { colors, darkColors } from "@/styles/tokens";

function styleOf(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID).props.style);
}

beforeEach(() => {
  act(() => useThemeStore.getState().setMode("light"));
});

describe("Divider", () => {
  it("draws a hairline-tall rule by default", () => {
    render(<Divider testID="divider" />);

    const style = styleOf("divider");

    expect(style.height).toBe(StyleSheet.hairlineWidth);
    expect(style.width).toBeUndefined();
    expect(style.backgroundColor).toBe(colors.border);
  });

  it("draws a hairline-wide rule when vertical", () => {
    render(<Divider orientation="vertical" testID="divider" />);

    const style = styleOf("divider");

    expect(style.width).toBe(StyleSheet.hairlineWidth);
    expect(style.height).toBeUndefined();
  });

  it("stretches to the container so an inset shortens it", () => {
    render(<Divider inset={16} testID="divider" />);

    const style = styleOf("divider");

    expect(style.alignSelf).toBe("stretch");
    expect(style.marginHorizontal).toBe(16);
  });

  it("insets a vertical rule along its own axis", () => {
    render(<Divider orientation="vertical" inset={8} testID="divider" />);

    expect(styleOf("divider").marginVertical).toBe(8);
  });

  it("follows the active color scheme", () => {
    render(<Divider testID="divider" />);

    expect(styleOf("divider").backgroundColor).toBe(colors.border);

    act(() => useThemeStore.getState().setMode("dark"));

    expect(styleOf("divider").backgroundColor).toBe(darkColors.border);
  });

  it("centers a label between two rules", () => {
    render(<Divider label="or" />);

    expect(screen.getByText("or")).toBeOnTheScreen();
  });

  it("ignores a label when vertical", () => {
    render(<Divider orientation="vertical" label="or" />);

    expect(screen.queryByText("or")).toBeNull();
  });
});
