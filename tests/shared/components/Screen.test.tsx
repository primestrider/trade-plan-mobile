import { act, render, screen } from "@testing-library/react-native";
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Screen } from "@/shared/components";
import { useThemeStore } from "@/styles";
import { colors, spacing } from "@/styles/tokens";

/** The safe-area mock reports zero insets, so only the gutter remains. */
const BOTTOM_CLEARANCE = spacing[6];

function contentStyle() {
  return StyleSheet.flatten(
    screen.UNSAFE_getByType(ScrollView).props.contentContainerStyle,
  );
}

beforeEach(() => {
  act(() => useThemeStore.getState().setMode("light"));
});

describe("Screen", () => {
  it("renders its children", () => {
    render(
      <Screen>
        <Text>Body</Text>
      </Screen>,
    );

    expect(screen.getByText("Body")).toBeOnTheScreen();
  });

  it("paints the themed background on the container", () => {
    render(
      <Screen>
        <Text>Body</Text>
      </Screen>,
    );

    const container = screen.UNSAFE_getAllByType(View)[0];

    expect(StyleSheet.flatten(container.props.style)).toEqual(
      expect.objectContaining({
        flex: 1,
        backgroundColor: colors.background,
      }),
    );
  });

  it("scrolls by default", () => {
    render(
      <Screen>
        <Text>Body</Text>
      </Screen>,
    );

    expect(screen.UNSAFE_queryByType(ScrollView)).not.toBeNull();
  });

  it("does not scroll when told not to", () => {
    render(
      <Screen scroll={false}>
        <Text>Body</Text>
      </Screen>,
    );

    expect(screen.UNSAFE_queryByType(ScrollView)).toBeNull();
    expect(screen.getByText("Body")).toBeOnTheScreen();
  });

  it("applies the standard gutter", () => {
    render(
      <Screen>
        <Text>Body</Text>
      </Screen>,
    );

    expect(contentStyle().padding).toBe(spacing[4]);
  });

  it("drops the gutter when padded is off", () => {
    render(
      <Screen padded={false}>
        <Text>Body</Text>
      </Screen>,
    );

    expect(contentStyle().padding).toBeUndefined();
  });

  it("clears the bottom inset below the content", () => {
    render(
      <Screen>
        <Text>Body</Text>
      </Screen>,
    );

    expect(contentStyle().paddingBottom).toBe(BOTTOM_CLEARANCE);
  });

  it("hands the bottom inset to the footer instead of the content", () => {
    render(
      <Screen footer={<Text>Save</Text>}>
        <Text>Body</Text>
      </Screen>,
    );

    expect(screen.getByText("Save")).toBeOnTheScreen();
    expect(contentStyle().paddingBottom).toBe(0);
  });

  it("wraps in a KeyboardAvoidingView only when asked", () => {
    const { rerender } = render(
      <Screen>
        <Text>Body</Text>
      </Screen>,
    );

    expect(screen.UNSAFE_queryByType(KeyboardAvoidingView)).toBeNull();

    rerender(
      <Screen keyboardAvoiding>
        <Text>Body</Text>
      </Screen>,
    );

    expect(screen.UNSAFE_queryByType(KeyboardAvoidingView)).not.toBeNull();
  });

  it("forwards ScrollView props", () => {
    render(
      <Screen showsVerticalScrollIndicator={false}>
        <Text>Body</Text>
      </Screen>,
    );

    expect(
      screen.UNSAFE_getByType(ScrollView).props.showsVerticalScrollIndicator,
    ).toBe(false);
  });

  it("keeps taps working while the keyboard is up", () => {
    render(
      <Screen>
        <Text>Body</Text>
      </Screen>,
    );

    expect(
      screen.UNSAFE_getByType(ScrollView).props.keyboardShouldPersistTaps,
    ).toBe("handled");
  });
});
