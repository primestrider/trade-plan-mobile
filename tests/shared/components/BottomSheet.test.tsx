import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { useEffect } from "react";
import { Dimensions, ScrollView, StyleSheet, Text } from "react-native";

import {
  BottomSheet,
  SHEET_EXIT_DURATION,
} from "@/shared/components/BottomSheet";
import { useThemeStore } from "@/styles";
import { colors, darkColors, spacing } from "@/styles/tokens";

/**
 * The native sheet is replaced in `tests/setup.ts` by a stand-in that keeps
 * `isPresented`, `onDismiss` and the paint color on a node these tests reach.
 */
const nativeSheet = () => screen.getByTestId("native-bottom-sheet");

const gutter = () =>
  StyleSheet.flatten(
    screen.UNSAFE_getByType(ScrollView).props.contentContainerStyle,
  );

beforeEach(() => {
  jest.useFakeTimers();
  act(() => useThemeStore.getState().setMode("light"));
});

afterEach(() => {
  jest.useRealTimers();
});

describe("BottomSheet", () => {
  it("renders nothing while closed", () => {
    render(
      <BottomSheet visible={false} onClose={jest.fn()}>
        <Text>Sort by</Text>
      </BottomSheet>,
    );

    expect(nativeSheet().props.isPresented).toBe(false);
    expect(screen.queryByTestId("bottom-sheet")).toBeNull();
    expect(screen.queryByText("Sort by")).toBeNull();
  });

  it("presents its content and optional title while open", () => {
    render(
      <BottomSheet visible onClose={jest.fn()} title="Sort by">
        <Text>Newest first</Text>
      </BottomSheet>,
    );

    expect(nativeSheet().props.isPresented).toBe(true);
    expect(screen.getByText("Sort by")).toBeOnTheScreen();
    expect(screen.getByText("Newest first")).toBeOnTheScreen();
  });

  it("closes when the user dismisses the native sheet", () => {
    const onClose = jest.fn();
    render(
      <BottomSheet visible onClose={onClose}>
        <Text>Newest first</Text>
      </BottomSheet>,
    );

    fireEvent(nativeSheet(), "dismiss");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("keeps its content through the exit, then lets it go", () => {
    const { rerender } = render(
      <BottomSheet visible onClose={jest.fn()}>
        <Text>Newest first</Text>
      </BottomSheet>,
    );

    rerender(
      <BottomSheet visible={false} onClose={jest.fn()}>
        <Text>Newest first</Text>
      </BottomSheet>,
    );

    // Still there while the sheet slides away, so it never empties mid-exit.
    expect(screen.getByText("Newest first")).toBeOnTheScreen();

    act(() => jest.advanceTimersByTime(SHEET_EXIT_DURATION));

    expect(screen.queryByText("Newest first")).toBeNull();
  });

  it("mounts its content afresh on every open", () => {
    const mounts = jest.fn();

    function Probe() {
      useEffect(() => mounts(), []);
      return <Text>Probe</Text>;
    }

    const sheet = (visible: boolean) => (
      <BottomSheet visible={visible} onClose={jest.fn()}>
        <Probe />
      </BottomSheet>
    );

    const { rerender } = render(sheet(true));
    rerender(sheet(false));
    act(() => jest.advanceTimersByTime(SHEET_EXIT_DURATION));
    rerender(sheet(true));

    expect(mounts).toHaveBeenCalledTimes(2);
  });

  it("paints itself with the theme's card color", () => {
    render(
      <BottomSheet visible onClose={jest.fn()}>
        <Text>Newest first</Text>
      </BottomSheet>,
    );

    expect(nativeSheet().props.containerColor).toBe(colors.card);

    act(() => useThemeStore.getState().setMode("dark"));

    expect(nativeSheet().props.containerColor).toBe(darkColors.card);
  });

  it("pins its content to the sheet width, so the gutter stays on screen", () => {
    render(
      <BottomSheet visible onClose={jest.fn()}>
        <Text>Newest first</Text>
      </BottomSheet>,
    );

    const { width } = StyleSheet.flatten(
      screen.getByTestId("bottom-sheet").props.style,
    );

    expect(width).toBe(Math.min(Dimensions.get("window").width, 640));
  });

  it("scrolls content rather than letting it run off the screen", () => {
    render(
      <BottomSheet visible onClose={jest.fn()}>
        <Text>Newest first</Text>
      </BottomSheet>,
    );

    const style = StyleSheet.flatten(
      screen.UNSAFE_getByType(ScrollView).props.style,
    );

    expect(style.maxHeight).toBeGreaterThan(0);
  });

  it("applies the standard gutter by default", () => {
    render(
      <BottomSheet visible onClose={jest.fn()}>
        <Text>Newest first</Text>
      </BottomSheet>,
    );

    expect(gutter().paddingHorizontal).toBe(spacing[4]);
  });

  it("drops the gutter for rows that carry their own", () => {
    render(
      <BottomSheet visible onClose={jest.fn()} padded={false}>
        <Text>Newest first</Text>
      </BottomSheet>,
    );

    expect(gutter()?.paddingHorizontal).toBeUndefined();
  });
});
