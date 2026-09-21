import { act, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { AppText } from "@/shared/components";
import { useThemeStore } from "@/styles";
import { colors, darkColors, fontFamily, fontSize } from "@/styles/tokens";

function styleOf(content: string) {
  return StyleSheet.flatten(screen.getByText(content).props.style);
}

beforeEach(() => {
  act(() => useThemeStore.getState().setMode("light"));
});

describe("AppText", () => {
  it("renders its children", () => {
    render(<AppText>Hello</AppText>);

    expect(screen.getByText("Hello")).toBeOnTheScreen();
  });

  it("defaults to body size, regular weight, and the foreground color", () => {
    render(<AppText>Hello</AppText>);

    expect(styleOf("Hello")).toEqual(
      expect.objectContaining({
        fontSize: fontSize.base,
        fontFamily: fontFamily.sans,
        color: colors.foreground,
      }),
    );
  });

  it("sets size and weight together from the variant", () => {
    render(<AppText variant="h1">Title</AppText>);

    expect(styleOf("Title")).toEqual(
      expect.objectContaining({
        fontSize: fontSize["3xl"],
        fontFamily: fontFamily.extrabold,
      }),
    );
  });

  it.each([
    ["h2", fontSize["2xl"], fontFamily.bold],
    ["h3", fontSize.xl, fontFamily.semibold],
    ["title", fontSize.lg, fontFamily.semibold],
    ["label", fontSize.sm, fontFamily.medium],
    ["caption", fontSize.xs, fontFamily.sans],
    ["mono", fontSize.sm, fontFamily.mono],
  ] as const)("maps variant %s to its own size and weight", (variant, size, family) => {
    render(<AppText variant={variant}>Sample</AppText>);

    expect(styleOf("Sample")).toEqual(
      expect.objectContaining({ fontSize: size, fontFamily: family }),
    );
  });

  it("lets an explicit weight override the variant's own", () => {
    render(
      <AppText variant="h1" weight="normal">
        Title
      </AppText>,
    );

    expect(styleOf("Title")).toEqual(
      expect.objectContaining({
        fontSize: fontSize["3xl"],
        fontFamily: fontFamily.sans,
      }),
    );
  });

  it.each([
    ["muted", colors.muted],
    ["primary", colors.primary],
    ["destructive", colors.destructive],
    ["success", colors.success],
    ["warning", colors.warning],
  ] as const)("resolves the %s color from the theme", (color, expected) => {
    render(<AppText color={color}>Sample</AppText>);

    expect(styleOf("Sample").color).toBe(expected);
  });

  it("uses the primary foreground for inverse text", () => {
    render(<AppText color="inverse">On primary</AppText>);

    expect(styleOf("On primary").color).toBe(colors.primaryForeground);
  });

  it("follows the active color scheme", () => {
    render(<AppText>Hello</AppText>);

    expect(styleOf("Hello").color).toBe(colors.foreground);

    act(() => useThemeStore.getState().setMode("dark"));

    expect(styleOf("Hello").color).toBe(darkColors.foreground);
  });

  it("applies text alignment", () => {
    render(<AppText align="center">Centered</AppText>);

    expect(styleOf("Centered").textAlign).toBe("center");
  });

  it("lets an external style win over the variant", () => {
    render(<AppText style={{ fontSize: 99 }}>Hello</AppText>);

    expect(styleOf("Hello").fontSize).toBe(99);
  });

  it("forwards props to the underlying Text", () => {
    render(
      <AppText numberOfLines={2} testID="text">
        Hello
      </AppText>,
    );

    expect(screen.getByTestId("text").props.numberOfLines).toBe(2);
  });
});
