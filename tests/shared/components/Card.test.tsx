import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet, Text } from "react-native";

import { Card } from "@/shared/components/Card";
import { useThemeStore } from "@/styles";
import { colors, darkColors, radii, spacing } from "@/styles/tokens";

function styleOf(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID).props.style);
}

beforeEach(() => {
  act(() => useThemeStore.getState().setMode("light"));
});

describe("Card", () => {
  it("renders its children", () => {
    render(
      <Card>
        <Text>Body</Text>
      </Card>,
    );

    expect(screen.getByText("Body")).toBeOnTheScreen();
  });

  it("raises the elevated variant off the card surface", () => {
    render(<Card testID="card" />);

    const style = styleOf("card");

    expect(style.backgroundColor).toBe(colors.card);
    expect(style.elevation).toBeGreaterThan(0);
    expect(style.borderWidth).toBe(0);
  });

  it("outlines the outlined variant instead of shadowing it", () => {
    render(<Card variant="outlined" testID="card" />);

    const style = styleOf("card");

    expect(style.backgroundColor).toBe(colors.card);
    expect(style.borderWidth).toBe(1);
    expect(style.borderColor).toBe(colors.border);
    expect(style.elevation).toBeFalsy();
  });

  it("fills the filled variant with the secondary surface", () => {
    render(<Card variant="filled" testID="card" />);

    const style = styleOf("card");

    expect(style.backgroundColor).toBe(colors.secondary);
    expect(style.borderWidth).toBe(0);
    expect(style.elevation).toBeFalsy();
  });

  it("rounds every variant to the 2xl radius", () => {
    render(<Card testID="card" />);

    expect(styleOf("card").borderRadius).toBe(radii["2xl"]);
  });

  it("never clips, so the elevated shadow survives on Android", () => {
    render(<Card testID="card" />);

    expect(styleOf("card").overflow).toBeUndefined();
  });

  it("applies the card gutter by default", () => {
    render(<Card testID="card" />);

    expect(styleOf("card").padding).toBe(spacing[4]);
  });

  it("drops the gutter and the gap when padded is off", () => {
    render(<Card padded={false} testID="card" />);

    const style = styleOf("card");

    expect(style.padding).toBeUndefined();
    expect(style.gap).toBeUndefined();
  });

  it("is not a button without onPress", () => {
    render(<Card testID="card" />);

    expect(screen.queryByRole("button")).toBeNull();
  });

  it("becomes a button that fires when given onPress", () => {
    const onPress = jest.fn();
    render(<Card onPress={onPress} testID="card" />);

    fireEvent.press(screen.getByRole("button"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("keeps the variant styling when pressable", () => {
    render(<Card variant="outlined" onPress={jest.fn()} testID="card" />);

    const style = styleOf("card");

    expect(style.borderRadius).toBe(radii["2xl"]);
    expect(style.borderColor).toBe(colors.border);
  });

  it("follows the active color scheme", () => {
    render(<Card testID="card" />);

    expect(styleOf("card").backgroundColor).toBe(colors.card);

    act(() => useThemeStore.getState().setMode("dark"));

    expect(styleOf("card").backgroundColor).toBe(darkColors.card);
  });

  it("follows the active color scheme on the outlined border", () => {
    render(<Card variant="outlined" testID="card" />);

    expect(styleOf("card").borderColor).toBe(colors.border);

    act(() => useThemeStore.getState().setMode("dark"));

    expect(styleOf("card").borderColor).toBe(darkColors.border);
  });

  it("lets an external style win over the variant", () => {
    render(<Card style={{ backgroundColor: "#123456" }} testID="card" />);

    expect(styleOf("card").backgroundColor).toBe("#123456");
  });

  it("forwards props to the underlying view", () => {
    render(<Card accessibilityLabel="Summary" testID="card" />);

    expect(screen.getByLabelText("Summary")).toBeOnTheScreen();
  });
});

describe("Card.Header", () => {
  it("renders the title and subtitle", () => {
    render(<Card.Header title="Storage" subtitle="12.4 GB of 50 GB" />);

    expect(screen.getByText("Storage")).toBeOnTheScreen();
    expect(screen.getByText("12.4 GB of 50 GB")).toBeOnTheScreen();
  });

  it("mutes the subtitle", () => {
    render(<Card.Header title="Storage" subtitle="Almost full" />);

    expect(
      StyleSheet.flatten(screen.getByText("Almost full").props.style).color,
    ).toBe(colors.muted);
  });

  it("renders the right slot alongside the title", () => {
    render(<Card.Header title="Team" right={<Text>2</Text>} />);

    expect(screen.getByText("Team")).toBeOnTheScreen();
    expect(screen.getByText("2")).toBeOnTheScreen();
  });

  it("truncates a long title rather than pushing the right slot away", () => {
    render(<Card.Header title="A very long header title" />);

    expect(screen.getByText("A very long header title").props.numberOfLines).toBe(1);
  });

  it("renders children instead of the title pair when given", () => {
    render(
      <Card.Header title="Ignored">
        <Text>Custom</Text>
      </Card.Header>,
    );

    expect(screen.getByText("Custom")).toBeOnTheScreen();
    expect(screen.queryByText("Ignored")).toBeNull();
  });
});

describe("Card.Body", () => {
  it("renders its children", () => {
    render(
      <Card.Body>
        <Text>Everything is up to date</Text>
      </Card.Body>,
    );

    expect(screen.getByText("Everything is up to date")).toBeOnTheScreen();
  });
});

describe("Card.Footer", () => {
  it("lays its actions out in a row aligned to the end", () => {
    render(
      <Card.Footer testID="footer">
        <Text>Save</Text>
      </Card.Footer>,
    );

    const style = styleOf("footer");

    expect(style.flexDirection).toBe("row");
    expect(style.justifyContent).toBe("flex-end");
    expect(screen.getByText("Save")).toBeOnTheScreen();
  });
});

describe("Card composition", () => {
  it("does not double the gutter when sections are nested inside", () => {
    render(
      <Card testID="card">
        <Card.Header title="Storage" testID="header" />
        <Card.Body testID="body" />
        <Card.Footer testID="footer" />
      </Card>,
    );

    expect(styleOf("card").padding).toBe(spacing[4]);
    expect(styleOf("header").padding).toBeUndefined();
    expect(styleOf("body").padding).toBeUndefined();
    expect(styleOf("footer").padding).toBeUndefined();
  });
});
