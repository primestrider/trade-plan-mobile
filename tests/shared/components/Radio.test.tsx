import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import {
  RADIO_RING_TEST_ID,
  Radio,
  type RadioGroupOption,
} from "@/shared/components/Radio";
import { useThemeStore } from "@/styles";
import { colors, darkColors, radii, spacing } from "@/styles/tokens";

function styleOf(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID).props.style);
}

function ring() {
  return styleOf(RADIO_RING_TEST_ID);
}

function radios() {
  return screen.getAllByRole("radio");
}

beforeEach(() => {
  // The dot animation would otherwise keep a timer pending past the test.
  jest.useFakeTimers();
  act(() => useThemeStore.getState().setMode("light"));
});

afterEach(() => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
});

describe("Radio", () => {
  it("renders its label and description", () => {
    render(<Radio label="Monthly" description="Billed every month" />);

    expect(screen.getByText("Monthly")).toBeOnTheScreen();
    expect(screen.getByText("Billed every month")).toBeOnTheScreen();
  });

  it("exposes the radio role", () => {
    render(<Radio testID="radio" label="Monthly" />);

    expect(screen.getByTestId("radio").props.accessibilityRole).toBe("radio");
  });

  it("reports its selected state to assistive tech", () => {
    const { rerender } = render(<Radio testID="radio" />);

    expect(
      screen.getByTestId("radio").props.accessibilityState.selected,
    ).toBe(false);

    rerender(<Radio testID="radio" selected />);

    expect(
      screen.getByTestId("radio").props.accessibilityState.selected,
    ).toBe(true);
  });

  it("calls onSelect when tapped", () => {
    const onSelect = jest.fn();
    render(<Radio testID="radio" onSelect={onSelect} />);

    fireEvent.press(screen.getByTestId("radio"));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("does not call onSelect while disabled", () => {
    const onSelect = jest.fn();
    render(<Radio testID="radio" disabled onSelect={onSelect} />);

    fireEvent.press(screen.getByTestId("radio"));

    expect(onSelect).not.toHaveBeenCalled();
    expect(styleOf("radio").opacity).toBe(0.5);
  });

  describe("ring", () => {
    it("is fully rounded", () => {
      render(<Radio />);

      expect(ring().borderRadius).toBe(radii.full);
    });

    it("tints its outline once selected", () => {
      const { rerender } = render(<Radio />);

      expect(ring().borderColor).toBe(colors.border);

      rerender(<Radio selected />);

      expect(ring().borderColor).toBe(colors.primary);
    });

    it.each([
      ["sm", spacing[4]],
      ["md", spacing[5]],
    ] as const)("sizes %s from the spacing scale", (size, expected) => {
      render(<Radio size={size} />);

      expect(ring().width).toBe(expected);
      expect(ring().height).toBe(expected);
    });

    it("follows the active color scheme", () => {
      render(<Radio selected />);

      expect(ring().borderColor).toBe(colors.primary);

      act(() => useThemeStore.getState().setMode("dark"));

      expect(ring().borderColor).toBe(darkColors.primary);
    });
  });

  it("merges a caller-provided style", () => {
    render(<Radio testID="radio" style={{ marginTop: spacing[6] }} />);

    expect(styleOf("radio").marginTop).toBe(spacing[6]);
  });

  describe("Group", () => {
    type Period = "monthly" | "yearly";

    const options: RadioGroupOption<Period>[] = [
      { value: "monthly", label: "Monthly" },
      { value: "yearly", label: "Yearly", description: "Two months free" },
    ];

    it("renders one radio per option", () => {
      render(
        <Radio.Group options={options} value="monthly" onChange={jest.fn()} />,
      );

      expect(radios()).toHaveLength(2);
      expect(screen.getByText("Monthly")).toBeOnTheScreen();
      expect(screen.getByText("Two months free")).toBeOnTheScreen();
    });

    it("carries the radiogroup role and a label", () => {
      render(
        <Radio.Group
          testID="group"
          accessibilityLabel="Billing period"
          options={options}
          value="monthly"
          onChange={jest.fn()}
        />,
      );

      const group = screen.getByTestId("group");

      expect(group.props.accessibilityRole).toBe("radiogroup");
      expect(group.props.accessibilityLabel).toBe("Billing period");
    });

    it("selects exactly the option matching value", () => {
      render(
        <Radio.Group options={options} value="yearly" onChange={jest.fn()} />,
      );

      const selected = radios().map(
        (radio) => radio.props.accessibilityState.selected,
      );

      expect(selected).toEqual([false, true]);
    });

    it("calls onChange with the option value", () => {
      const onChange = jest.fn();
      render(
        <Radio.Group options={options} value="monthly" onChange={onChange} />,
      );

      fireEvent.press(screen.getByText("Yearly"));

      expect(onChange).toHaveBeenCalledWith("yearly");
    });

    it("keeps a numeric option value numeric", () => {
      // Typed as `(value: number) => void`: this only compiles while the
      // generic actually flows from `options` through to `onChange`.
      const received: number[] = [];
      const onChange = (value: number) => received.push(value);

      render(
        <Radio.Group
          options={[
            { value: 1, label: "One" },
            { value: 2, label: "Two" },
          ]}
          value={1}
          onChange={onChange}
        />,
      );

      fireEvent.press(screen.getByText("Two"));

      expect(received).toEqual([2]);
    });

    it("never selects more than one option at a time", () => {
      const { rerender } = render(
        <Radio.Group options={options} value="monthly" onChange={jest.fn()} />,
      );

      rerender(
        <Radio.Group options={options} value="yearly" onChange={jest.fn()} />,
      );

      const selected = radios().filter(
        (radio) => radio.props.accessibilityState.selected,
      );

      expect(selected).toHaveLength(1);
    });

    it("disables the options that ask for it", () => {
      const onChange = jest.fn();
      render(
        <Radio.Group
          options={[
            { value: "a", label: "Available" },
            { value: "b", label: "Sold out", disabled: true },
          ]}
          value="a"
          onChange={onChange}
        />,
      );

      const soldOut = radios()[1];

      expect(soldOut.props.accessibilityState.disabled).toBe(true);

      fireEvent.press(soldOut);

      expect(onChange).not.toHaveBeenCalled();
    });

    it("renders an error in the destructive color", () => {
      render(
        <Radio.Group
          options={options}
          value="monthly"
          onChange={jest.fn()}
          error="Pick a plan"
        />,
      );

      const error = screen.getByText("Pick a plan");

      expect(StyleSheet.flatten(error.props.style).color).toBe(
        colors.destructive,
      );
    });

    it("gaps its options with a spacing token", () => {
      render(
        <Radio.Group
          testID="group"
          options={options}
          value="monthly"
          onChange={jest.fn()}
        />,
      );

      expect(styleOf("group").gap).toBe(spacing[3]);
    });
  });
});
