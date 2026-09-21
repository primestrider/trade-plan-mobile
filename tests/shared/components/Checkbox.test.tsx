import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import {
  CHECKBOX_BOX_TEST_ID,
  CHECKBOX_MARK_TEST_ID,
  Checkbox,
} from "@/shared/components/Checkbox";
import { useThemeStore } from "@/styles";
import { colors, darkColors, palette, radii, spacing } from "@/styles/tokens";

function styleOf(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID).props.style);
}

function box() {
  return styleOf(CHECKBOX_BOX_TEST_ID);
}

beforeEach(() => {
  // The mark animation would otherwise keep a timer pending past the test.
  jest.useFakeTimers();
  act(() => useThemeStore.getState().setMode("light"));
});

afterEach(() => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
});

describe("Checkbox", () => {
  it("renders its label and description", () => {
    render(<Checkbox label="Remember me" description="On this device only" />);

    expect(screen.getByText("Remember me")).toBeOnTheScreen();
    expect(screen.getByText("On this device only")).toBeOnTheScreen();
  });

  it("exposes the checkbox role", () => {
    render(<Checkbox testID="checkbox" label="Remember me" />);

    expect(screen.getByTestId("checkbox").props.accessibilityRole).toBe(
      "checkbox",
    );
  });

  it("reports its checked state to assistive tech", () => {
    const { rerender } = render(<Checkbox testID="checkbox" />);

    expect(screen.getByTestId("checkbox").props.accessibilityState).toEqual(
      expect.objectContaining({ checked: false }),
    );

    rerender(<Checkbox testID="checkbox" checked />);

    expect(screen.getByTestId("checkbox").props.accessibilityState).toEqual(
      expect.objectContaining({ checked: true }),
    );
  });

  it("reports indeterminate as mixed", () => {
    render(<Checkbox testID="checkbox" indeterminate />);

    expect(
      screen.getByTestId("checkbox").props.accessibilityState.checked,
    ).toBe("mixed");
  });

  it("calls onChange with the negated value", () => {
    const onChange = jest.fn();
    render(<Checkbox testID="checkbox" checked={false} onChange={onChange} />);

    fireEvent.press(screen.getByTestId("checkbox"));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("calls onChange with false when already checked", () => {
    const onChange = jest.fn();
    render(<Checkbox testID="checkbox" checked onChange={onChange} />);

    fireEvent.press(screen.getByTestId("checkbox"));

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("does not toggle itself while the caller keeps checked unchanged", () => {
    render(<Checkbox testID="checkbox" checked={false} onChange={jest.fn()} />);

    fireEvent.press(screen.getByTestId("checkbox"));

    expect(
      screen.getByTestId("checkbox").props.accessibilityState.checked,
    ).toBe(false);
    expect(box().backgroundColor).toBe(palette.transparent);
  });

  it("does not call onChange while disabled", () => {
    const onChange = jest.fn();
    render(<Checkbox testID="checkbox" disabled onChange={onChange} />);

    fireEvent.press(screen.getByTestId("checkbox"));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("dims itself when disabled", () => {
    render(<Checkbox testID="checkbox" disabled />);

    expect(styleOf("checkbox").opacity).toBe(0.5);
    expect(
      screen.getByTestId("checkbox").props.accessibilityState.disabled,
    ).toBe(true);
  });

  describe("box", () => {
    it("stays at the md radius so it never reads as a radio", () => {
      render(<Checkbox />);

      expect(box().borderRadius).toBe(radii.md);
      expect(box().borderRadius).not.toBe(radii.full);
    });

    it("outlines an unchecked box over a transparent fill", () => {
      render(<Checkbox />);

      expect(box().backgroundColor).toBe(palette.transparent);
      expect(box().borderColor).toBe(colors.border);
    });

    it("fills a checked box with the primary color", () => {
      render(<Checkbox checked />);

      expect(box().backgroundColor).toBe(colors.primary);
      expect(box().borderColor).toBe(colors.primary);
    });

    it("fills an indeterminate box even when unchecked", () => {
      render(<Checkbox indeterminate checked={false} />);

      expect(box().backgroundColor).toBe(colors.primary);
    });

    it.each([
      ["sm", spacing[4]],
      ["md", spacing[5]],
    ] as const)("sizes %s from the spacing scale", (size, expected) => {
      render(<Checkbox size={size} />);

      expect(box().width).toBe(expected);
      expect(box().height).toBe(expected);
    });

    it("follows the active color scheme", () => {
      render(<Checkbox checked />);

      expect(box().backgroundColor).toBe(colors.primary);

      act(() => useThemeStore.getState().setMode("dark"));

      expect(box().backgroundColor).toBe(darkColors.primary);
    });
  });

  describe("mark", () => {
    it("draws the checkmark from borders rather than a glyph", () => {
      render(<Checkbox checked />);

      const mark = styleOf(CHECKBOX_MARK_TEST_ID);

      expect(mark.borderBottomWidth).toBeGreaterThan(0);
      expect(mark.borderRightWidth).toBeGreaterThan(0);
      expect(mark.borderColor).toBe(colors.primaryForeground);
      expect(mark.transform).toEqual([{ rotate: "45deg" }]);
    });

    it("swaps the checkmark for a bar when indeterminate", () => {
      render(<Checkbox indeterminate checked />);

      const mark = styleOf(CHECKBOX_MARK_TEST_ID);

      expect(mark.transform).toBeUndefined();
      expect(mark.borderRadius).toBe(radii.full);
      expect(mark.backgroundColor).toBe(colors.primaryForeground);
    });
  });

  describe("error", () => {
    it("renders below the row in the destructive color", () => {
      render(<Checkbox label="I agree" error="Required" />);

      const error = screen.getByText("Required");

      expect(error).toBeOnTheScreen();
      expect(StyleSheet.flatten(error.props.style).color).toBe(
        colors.destructive,
      );
    });

    it("renders nothing when there is no error", () => {
      render(<Checkbox label="I agree" />);

      expect(screen.queryByText("Required")).toBeNull();
    });
  });

  it("merges a caller-provided style", () => {
    render(<Checkbox testID="checkbox" style={{ marginTop: spacing[6] }} />);

    expect(styleOf("checkbox").marginTop).toBe(spacing[6]);
  });

  it("forwards props to the underlying Pressable", () => {
    render(<Checkbox testID="checkbox" accessibilityLabel="Terms" />);

    expect(screen.getByTestId("checkbox").props.accessibilityLabel).toBe(
      "Terms",
    );
  });
});
