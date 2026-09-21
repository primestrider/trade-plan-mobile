import { act, render, screen } from "@testing-library/react-native";
import { StyleSheet, Text } from "react-native";

import { Badge } from "@/shared/components/Badge";
import { useThemeStore } from "@/styles";
import {
  colors,
  darkColors,
  fontSize,
  palette,
  radii,
  spacing,
} from "@/styles/tokens";

function styleOf(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID).props.style);
}

function textStyleOf(content: string) {
  return StyleSheet.flatten(screen.getByText(content).props.style);
}

beforeEach(() => {
  act(() => useThemeStore.getState().setMode("light"));
});

describe("Badge", () => {
  it("renders its label", () => {
    render(<Badge label="New" />);

    expect(screen.getByText("New")).toBeOnTheScreen();
  });

  it("prefers children over the label", () => {
    render(<Badge label="New">3 open</Badge>);

    expect(screen.getByText("3 open")).toBeOnTheScreen();
    expect(screen.queryByText("New")).toBeNull();
  });

  it("renders element children untouched", () => {
    render(
      <Badge>
        <Text>icon</Text>
      </Badge>,
    );

    expect(screen.getByText("icon")).toBeOnTheScreen();
  });

  it("renders nothing readable without a label or children", () => {
    render(<Badge testID="badge" />);

    expect(screen.getByTestId("badge")).toBeOnTheScreen();
  });

  describe("variants", () => {
    it.each([
      ["default", colors.secondary, colors.secondaryForeground],
      ["primary", colors.primary, colors.primaryForeground],
      ["destructive", colors.destructive, colors.destructiveForeground],
      ["success", colors.success, palette.white],
      ["warning", colors.warning, palette.gray[950]],
      ["info", colors.info, palette.white],
    ] as const)(
      "%s fills with its themed color and a readable foreground",
      (variant, background, foreground) => {
        render(<Badge label="New" variant={variant} testID="badge" />);

        expect(styleOf("badge").backgroundColor).toBe(background);
        expect(textStyleOf("New").color).toBe(foreground);
      },
    );

    it("outlines rather than fills", () => {
      render(<Badge label="New" variant="outline" testID="badge" />);

      const style = styleOf("badge");

      expect(style.backgroundColor).toBe(palette.transparent);
      expect(style.borderWidth).toBe(1);
      expect(style.borderColor).toBe(colors.border);
      expect(textStyleOf("New").color).toBe(colors.foreground);
    });

    it("gives filled variants no border", () => {
      render(<Badge label="New" variant="primary" testID="badge" />);

      expect(styleOf("badge").borderWidth).toBe(0);
    });
  });

  describe("sizes", () => {
    it("pads and sizes text tightly when small", () => {
      render(<Badge label="New" size="sm" testID="badge" />);

      const style = styleOf("badge");

      expect(style.paddingHorizontal).toBe(spacing[2]);
      expect(style.paddingVertical).toBe(spacing[0.5]);
      expect(textStyleOf("New").fontSize).toBe(fontSize.xs);
    });

    it("defaults to the medium size", () => {
      render(<Badge label="New" testID="badge" />);

      const style = styleOf("badge");

      expect(style.paddingHorizontal).toBe(spacing[2.5]);
      expect(style.paddingVertical).toBe(spacing[1]);
      expect(textStyleOf("New").fontSize).toBe(fontSize.sm);
    });
  });

  it("is always fully rounded", () => {
    render(<Badge label="New" testID="badge" />);

    expect(styleOf("badge").borderRadius).toBe(radii.full);
  });

  it("follows the active color scheme", () => {
    render(<Badge label="New" variant="primary" testID="badge" />);

    expect(styleOf("badge").backgroundColor).toBe(colors.primary);

    act(() => useThemeStore.getState().setMode("dark"));

    expect(styleOf("badge").backgroundColor).toBe(darkColors.primary);
    expect(textStyleOf("New").color).toBe(darkColors.primaryForeground);
  });

  it("lets an external style win", () => {
    render(<Badge label="New" style={{ borderRadius: 2 }} testID="badge" />);

    expect(styleOf("badge").borderRadius).toBe(2);
  });

  it("forwards props to the underlying View", () => {
    render(<Badge label="New" accessibilityLabel="status" testID="badge" />);

    expect(screen.getByTestId("badge").props.accessibilityLabel).toBe("status");
  });
});
