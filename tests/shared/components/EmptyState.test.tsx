import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Pressable, StyleSheet, Text } from "react-native";

import { EmptyState } from "@/shared/components/EmptyState";
import { useThemeStore } from "@/styles";
import { colors, darkColors, fontSize, radii, spacing } from "@/styles/tokens";

function styleOf(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID).props.style);
}

function styleOfText(content: string) {
  return StyleSheet.flatten(screen.getByText(content).props.style);
}

beforeEach(() => {
  act(() => useThemeStore.getState().setMode("light"));
});

describe("EmptyState", () => {
  it("renders the title", () => {
    render(<EmptyState title="No messages yet" />);

    expect(screen.getByText("No messages yet")).toBeOnTheScreen();
  });

  it("renders the title at the title size", () => {
    render(<EmptyState title="No messages yet" />);

    expect(styleOfText("No messages yet").fontSize).toBe(fontSize.lg);
  });

  it("omits the description when there is none", () => {
    render(<EmptyState title="No messages yet" />);

    expect(screen.queryByText("Nothing here")).toBeNull();
  });

  it("renders a muted, centered description", () => {
    render(
      <EmptyState title="No messages yet" description="Start a conversation." />,
    );

    const style = styleOfText("Start a conversation.");

    expect(style.color).toBe(colors.muted);
    expect(style.textAlign).toBe("center");
  });

  it("caps the description at a readable measure", () => {
    render(
      <EmptyState title="No messages yet" description="Start a conversation." />,
    );

    expect(styleOfText("Start a conversation.").maxWidth).toBe(spacing[80]);
  });

  it("renders the icon slot", () => {
    render(<EmptyState icon={<Text testID="icon">*</Text>} title="Empty" />);

    expect(screen.getByTestId("icon")).toBeOnTheScreen();
  });

  it("renders the action slot and keeps it interactive", () => {
    const onPress = jest.fn();

    render(
      <EmptyState
        title="Empty"
        action={
          <Pressable testID="action" onPress={onPress}>
            <Text>Start a chat</Text>
          </Pressable>
        }
      />,
    );

    fireEvent.press(screen.getByTestId("action"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("centers its column with generous vertical padding", () => {
    render(<EmptyState title="Empty" testID="empty" />);

    const style = styleOf("empty");

    expect(style.alignItems).toBe("center");
    expect(style.justifyContent).toBe("center");
    expect(style.paddingVertical).toBe(spacing[12]);
    expect(style.paddingHorizontal).toBe(spacing[6]);
    expect(style.gap).toBe(spacing[3]);
  });

  it("rounds the block at the 2xl radius", () => {
    render(<EmptyState title="Empty" testID="empty" />);

    expect(styleOf("empty").borderRadius).toBe(radii["2xl"]);
  });

  it("follows the active color scheme", () => {
    render(<EmptyState title="Empty" description="Nothing here" />);

    expect(styleOfText("Empty").color).toBe(colors.foreground);
    expect(styleOfText("Nothing here").color).toBe(colors.muted);

    act(() => useThemeStore.getState().setMode("dark"));

    expect(styleOfText("Empty").color).toBe(darkColors.foreground);
    expect(styleOfText("Nothing here").color).toBe(darkColors.muted);
  });

  it("lets an external style win", () => {
    render(<EmptyState title="Empty" style={{ paddingVertical: 0 }} testID="e" />);

    expect(styleOf("e").paddingVertical).toBe(0);
  });

  it("forwards props to the underlying View", () => {
    render(<EmptyState title="Empty" testID="empty" pointerEvents="box-none" />);

    expect(screen.getByTestId("empty").props.pointerEvents).toBe("box-none");
  });
});
