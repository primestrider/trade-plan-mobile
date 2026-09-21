import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { ScrollView, StyleSheet, Text } from "react-native";

import { BottomSheet } from "@/shared/components/BottomSheet";
import { useThemeStore } from "@/styles";
import { colors, darkColors, radii, spacing } from "@/styles/tokens";

function sheetStyle() {
  return StyleSheet.flatten(screen.getByTestId("bottom-sheet").props.style);
}

/**
 * The sheet is marked `accessibilityViewIsModal`, which by definition hides its
 * siblings — the scrim included — from assistive technology. It is still a
 * touch target, so it has to be queried past that filter.
 */
function backdrop() {
  return screen.getByTestId("overlay-backdrop", { includeHiddenElements: true });
}

beforeEach(() => {
  act(() => useThemeStore.getState().setMode("light"));
});

describe("BottomSheet", () => {
  it("renders nothing while closed", () => {
    render(
      <BottomSheet visible={false} onClose={jest.fn()}>
        <Text>Sort by</Text>
      </BottomSheet>,
    );

    expect(screen.queryByText("Sort by")).toBeNull();
  });

  it("renders its content while open", () => {
    render(
      <BottomSheet visible onClose={jest.fn()}>
        <Text>Newest first</Text>
      </BottomSheet>,
    );

    expect(screen.getByText("Newest first")).toBeOnTheScreen();
  });

  it("renders an optional title", () => {
    render(
      <BottomSheet visible onClose={jest.fn()} title="Sort by">
        <Text>Newest first</Text>
      </BottomSheet>,
    );

    expect(screen.getByText("Sort by")).toBeOnTheScreen();
  });

  it("shows a drag handle", () => {
    render(
      <BottomSheet visible onClose={jest.fn()}>
        <Text>Newest first</Text>
      </BottomSheet>,
    );

    expect(screen.getByTestId("bottom-sheet-handle")).toBeOnTheScreen();
  });

  it("closes when the scrim is tapped", () => {
    const onClose = jest.fn();
    render(
      <BottomSheet visible onClose={onClose}>
        <Text>Newest first</Text>
      </BottomSheet>,
    );

    fireEvent.press(backdrop());

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("offers no scrim target when it cannot be dismissed", () => {
    render(
      <BottomSheet visible dismissable={false} onClose={jest.fn()}>
        <Text>Newest first</Text>
      </BottomSheet>,
    );

    expect(
      screen.queryByTestId("overlay-backdrop", { includeHiddenElements: true }),
    ).toBeNull();
  });

  it("rounds only its top corners", () => {
    render(
      <BottomSheet visible onClose={jest.fn()}>
        <Text>Newest first</Text>
      </BottomSheet>,
    );

    const style = sheetStyle();

    expect(style.borderTopLeftRadius).toBe(radii["2xl"]);
    expect(style.borderTopRightRadius).toBe(radii["2xl"]);
    expect(style.borderBottomLeftRadius).toBeUndefined();
  });

  it("scrolls content rather than letting it run off the screen", () => {
    render(
      <BottomSheet visible onClose={jest.fn()}>
        <Text>Newest first</Text>
      </BottomSheet>,
    );

    const scroller = screen.UNSAFE_getByType(ScrollView);
    const style = StyleSheet.flatten(scroller.props.style);

    expect(style.maxHeight).toBeGreaterThan(0);
  });

  it("applies the standard gutter by default", () => {
    render(
      <BottomSheet visible onClose={jest.fn()}>
        <Text>Newest first</Text>
      </BottomSheet>,
    );

    const content = StyleSheet.flatten(
      screen.UNSAFE_getByType(ScrollView).props.contentContainerStyle,
    );

    expect(content.paddingHorizontal).toBe(spacing[4]);
  });

  it("drops the gutter for rows that carry their own", () => {
    render(
      <BottomSheet visible onClose={jest.fn()} padded={false}>
        <Text>Newest first</Text>
      </BottomSheet>,
    );

    const content = StyleSheet.flatten(
      screen.UNSAFE_getByType(ScrollView).props.contentContainerStyle,
    );

    expect(content?.paddingHorizontal).toBeUndefined();
  });

  it("follows the active color scheme", () => {
    render(
      <BottomSheet visible onClose={jest.fn()}>
        <Text>Newest first</Text>
      </BottomSheet>,
    );

    expect(sheetStyle().backgroundColor).toBe(colors.card);

    act(() => useThemeStore.getState().setMode("dark"));

    expect(sheetStyle().backgroundColor).toBe(darkColors.card);
  });
});
