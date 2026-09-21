import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { Dialog } from "@/shared/components/Dialog";
import { useThemeStore } from "@/styles";
import { colors, darkColors, radii } from "@/styles/tokens";

function cardStyle() {
  return StyleSheet.flatten(screen.getByTestId("dialog-card").props.style);
}

/**
 * The card is marked `accessibilityViewIsModal`, which by definition hides its
 * siblings — the scrim included — from assistive technology. It is still a
 * touch target, so it has to be queried past that filter.
 */
function backdrop() {
  return screen.getByTestId("overlay-backdrop", { includeHiddenElements: true });
}

beforeEach(() => {
  act(() => useThemeStore.getState().setMode("light"));
});

describe("Dialog", () => {
  it("renders nothing while closed", () => {
    render(
      <Dialog visible={false} onClose={jest.fn()}>
        <Dialog.Title>Delete item?</Dialog.Title>
      </Dialog>,
    );

    expect(screen.queryByText("Delete item?")).toBeNull();
  });

  it("renders its content while open", () => {
    render(
      <Dialog visible onClose={jest.fn()}>
        <Dialog.Title>Delete item?</Dialog.Title>
        <Dialog.Body>This cannot be undone.</Dialog.Body>
      </Dialog>,
    );

    expect(screen.getByText("Delete item?")).toBeOnTheScreen();
    expect(screen.getByText("This cannot be undone.")).toBeOnTheScreen();
  });

  it("renders action children", () => {
    render(
      <Dialog visible onClose={jest.fn()}>
        <Dialog.Actions>
          <Dialog.Title>Cancel</Dialog.Title>
        </Dialog.Actions>
      </Dialog>,
    );

    expect(screen.getByText("Cancel")).toBeOnTheScreen();
  });

  it("closes when the scrim is tapped", () => {
    const onClose = jest.fn();
    render(
      <Dialog visible onClose={onClose}>
        <Dialog.Title>Delete item?</Dialog.Title>
      </Dialog>,
    );

    fireEvent.press(backdrop());

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("offers no scrim target when it cannot be dismissed", () => {
    render(
      <Dialog visible dismissable={false} onClose={jest.fn()}>
        <Dialog.Title>Delete item?</Dialog.Title>
      </Dialog>,
    );

    expect(
      screen.queryByTestId("overlay-backdrop", { includeHiddenElements: true }),
    ).toBeNull();
  });

  it("rounds the card to the 2xl radius", () => {
    render(
      <Dialog visible onClose={jest.fn()}>
        <Dialog.Title>Delete item?</Dialog.Title>
      </Dialog>,
    );

    expect(cardStyle().borderRadius).toBe(radii["2xl"]);
  });

  it("follows the active color scheme", () => {
    render(
      <Dialog visible onClose={jest.fn()}>
        <Dialog.Title>Delete item?</Dialog.Title>
      </Dialog>,
    );

    expect(cardStyle().backgroundColor).toBe(colors.card);

    act(() => useThemeStore.getState().setMode("dark"));

    expect(cardStyle().backgroundColor).toBe(darkColors.card);
  });
});
