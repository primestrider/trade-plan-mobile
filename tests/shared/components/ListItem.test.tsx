import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet, Text } from "react-native";

import {
  LIST_ITEM_CHEVRON_TEST_ID,
  ListItem,
} from "@/shared/components/ListItem";
import { useThemeStore } from "@/styles";
import { colors, darkColors, spacing } from "@/styles/tokens";

function styleOf(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID).props.style);
}

function textStyleOf(content: string) {
  return StyleSheet.flatten(screen.getByText(content).props.style);
}

beforeEach(() => {
  act(() => useThemeStore.getState().setMode("light"));
});

describe("ListItem", () => {
  it("renders the title and subtitle", () => {
    render(<ListItem title="Notifications" subtitle="Push, email" />);

    expect(screen.getByText("Notifications")).toBeOnTheScreen();
    expect(screen.getByText("Push, email")).toBeOnTheScreen();
  });

  it("mutes the subtitle", () => {
    render(<ListItem title="Notifications" subtitle="Push, email" />);

    expect(textStyleOf("Push, email").color).toBe(colors.muted);
  });

  it("stands at least a full row tall", () => {
    render(<ListItem title="Notifications" testID="row" />);

    expect(styleOf("row").minHeight).toBe(spacing[14]);
  });

  it("carries its own gutter so it reads inside an unpadded Card", () => {
    render(<ListItem title="Notifications" testID="row" />);

    expect(styleOf("row").paddingHorizontal).toBe(spacing[4]);
  });

  it("sets no radius — the Card owns the corners", () => {
    render(<ListItem title="Notifications" testID="row" />);

    expect(styleOf("row").borderRadius).toBeUndefined();
  });

  it("is not a button without onPress", () => {
    render(<ListItem title="Notifications" />);

    expect(screen.queryByRole("button")).toBeNull();
  });

  it("becomes a button that fires when given onPress", () => {
    const onPress = jest.fn();
    render(<ListItem title="Notifications" onPress={onPress} />);

    fireEvent.press(screen.getByRole("button"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("dims when disabled and blocks the press", () => {
    const onPress = jest.fn();
    render(
      <ListItem title="Notifications" onPress={onPress} disabled testID="row" />,
    );

    expect(styleOf("row").opacity).toBe(0.5);

    fireEvent.press(screen.getByTestId("row"));

    expect(onPress).not.toHaveBeenCalled();
  });

  it("paints a destructive title in the destructive color", () => {
    render(<ListItem title="Delete account" destructive />);

    expect(textStyleOf("Delete account").color).toBe(colors.destructive);
  });

  it("keeps a normal title on the foreground color", () => {
    render(<ListItem title="Delete account" />);

    expect(textStyleOf("Delete account").color).toBe(colors.foreground);
  });

  it("shows the chevron only when asked", () => {
    const { rerender } = render(<ListItem title="Notifications" />);

    expect(screen.queryByTestId(LIST_ITEM_CHEVRON_TEST_ID)).toBeNull();

    rerender(<ListItem title="Notifications" showChevron />);

    expect(screen.getByTestId(LIST_ITEM_CHEVRON_TEST_ID)).toBeOnTheScreen();
  });

  it("draws the chevron as a small rotated square", () => {
    render(<ListItem title="Notifications" showChevron />);

    const style = styleOf(LIST_ITEM_CHEVRON_TEST_ID);

    expect(style.width).toBe(spacing[2]);
    expect(style.height).toBe(spacing[2]);
    expect(style.transform).toEqual([{ rotate: "45deg" }]);
  });

  it("renders the left and right slots", () => {
    render(
      <ListItem title="Wi-Fi" left={<Text>icon</Text>} right={<Text>On</Text>} />,
    );

    expect(screen.getByText("icon")).toBeOnTheScreen();
    expect(screen.getByText("On")).toBeOnTheScreen();
  });

  it("truncates a long title instead of pushing the right slot off-screen", () => {
    render(
      <ListItem
        title="A title long enough to run past the edge of any phone"
        right={<Text>On</Text>}
      />,
    );

    expect(
      screen.getByText("A title long enough to run past the edge of any phone")
        .props.numberOfLines,
    ).toBe(1);
  });

  it("follows the active color scheme", () => {
    render(<ListItem title="Notifications" showChevron />);

    expect(styleOf(LIST_ITEM_CHEVRON_TEST_ID).borderColor).toBe(
      colors.mutedForeground,
    );
    expect(textStyleOf("Notifications").color).toBe(colors.foreground);

    act(() => useThemeStore.getState().setMode("dark"));

    expect(styleOf(LIST_ITEM_CHEVRON_TEST_ID).borderColor).toBe(
      darkColors.mutedForeground,
    );
    expect(textStyleOf("Notifications").color).toBe(darkColors.foreground);
  });

  it("forwards props to the underlying pressable", () => {
    render(<ListItem title="Notifications" accessibilityLabel="Row" testID="row" />);

    expect(screen.getByLabelText("Row")).toBeOnTheScreen();
  });
});
