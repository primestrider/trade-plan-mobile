import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import {
  TABS_INDICATOR_TEST_ID,
  Tabs,
  type TabItem,
} from "@/shared/components/Tabs";
import { useThemeStore } from "@/styles";
import { colors, darkColors, radii, spacing } from "@/styles/tokens";

type Range = "week" | "month" | "year";

const items: TabItem<Range>[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

/** Resolved style of the tab carrying this accessibility label. */
function styleOf(label: string) {
  return StyleSheet.flatten(screen.getByLabelText(label).props.style);
}

function isSelected(label: string) {
  return screen.getByLabelText(label).props.accessibilityState.selected;
}

function trackStyle() {
  return StyleSheet.flatten(screen.getByTestId("tabs").props.style);
}

/**
 * `Animated.View` resolves its animated style before handing it to the host
 * view, so the indicator's `left`/`width` read back here as plain numbers.
 */
function indicatorStyle() {
  return StyleSheet.flatten(
    screen.getByTestId(TABS_INDICATOR_TEST_ID).props.style,
  );
}

function measure(label: string, x: number, width: number) {
  fireEvent(screen.getByLabelText(label), "layout", {
    nativeEvent: { layout: { x, y: 0, width, height: spacing[10] } },
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  act(() => useThemeStore.getState().setMode("light"));
});

afterEach(() => {
  act(() => jest.runOnlyPendingTimers());
  jest.useRealTimers();
});

describe("Tabs", () => {
  it("renders a tab per item", () => {
    render(
      <Tabs testID="tabs" items={items} value="week" onChange={jest.fn()} />,
    );

    expect(screen.getByLabelText("Week")).toBeOnTheScreen();
    expect(screen.getByLabelText("Month")).toBeOnTheScreen();
    expect(screen.getByLabelText("Year")).toBeOnTheScreen();
  });

  it("exposes the strip and its tabs to assistive technology", () => {
    render(
      <Tabs testID="tabs" items={items} value="week" onChange={jest.fn()} />,
    );

    expect(screen.getByTestId("tabs").props.accessibilityRole).toBe("tablist");
    expect(screen.getByLabelText("Week").props.accessibilityRole).toBe("tab");
  });

  it("marks exactly one tab as selected", () => {
    render(
      <Tabs testID="tabs" items={items} value="month" onChange={jest.fn()} />,
    );

    const selected = items
      .map((item) => item.label)
      .filter((label) => isSelected(label));

    expect(selected).toEqual(["Month"]);
  });

  it("calls onChange with the tapped item's value", () => {
    const onChange = jest.fn();
    render(
      <Tabs testID="tabs" items={items} value="week" onChange={onChange} />,
    );

    fireEvent.press(screen.getByLabelText("Year"));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("year");
  });

  it("stays quiet when the already-active tab is tapped", () => {
    const onChange = jest.fn();
    render(
      <Tabs testID="tabs" items={items} value="week" onChange={onChange} />,
    );

    fireEvent.press(screen.getByLabelText("Week"));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("is controlled — the selection does not move on its own", () => {
    render(
      <Tabs testID="tabs" items={items} value="week" onChange={jest.fn()} />,
    );

    fireEvent.press(screen.getByLabelText("Month"));

    expect(isSelected("Week")).toBe(true);
    expect(isSelected("Month")).toBe(false);
  });

  it("moves the selection when the value prop changes", () => {
    const { rerender } = render(
      <Tabs testID="tabs" items={items} value="week" onChange={jest.fn()} />,
    );

    rerender(
      <Tabs testID="tabs" items={items} value="month" onChange={jest.fn()} />,
    );

    expect(isSelected("Month")).toBe(true);
    expect(isSelected("Week")).toBe(false);
  });

  describe("segmented", () => {
    it("lays the tabs on a fully rounded secondary track", () => {
      render(
        <Tabs testID="tabs" items={items} value="week" onChange={jest.fn()} />,
      );

      expect(trackStyle()).toEqual(
        expect.objectContaining({
          backgroundColor: colors.secondary,
          borderRadius: radii.full,
          padding: spacing[1],
          flexDirection: "row",
        }),
      );
    });

    it("raises the active tab onto a fully rounded card thumb", () => {
      render(
        <Tabs testID="tabs" items={items} value="week" onChange={jest.fn()} />,
      );

      expect(styleOf("Week")).toEqual(
        expect.objectContaining({
          backgroundColor: colors.card,
          borderRadius: radii.full,
          flex: 1,
        }),
      );
      expect(styleOf("Month").backgroundColor).toBeUndefined();
    });

    it("has no indicator bar", () => {
      render(
        <Tabs testID="tabs" items={items} value="week" onChange={jest.fn()} />,
      );

      expect(screen.queryByTestId(TABS_INDICATOR_TEST_ID)).toBeNull();
    });

    it("tightens its padding at the sm size", () => {
      render(
        <Tabs
          testID="tabs"
          size="sm"
          items={items}
          value="week"
          onChange={jest.fn()}
        />,
      );

      expect(styleOf("Week").paddingVertical).toBe(spacing[1.5]);
      expect(styleOf("Week").paddingHorizontal).toBe(spacing[2.5]);
    });

    it("follows the active color scheme", () => {
      render(
        <Tabs testID="tabs" items={items} value="week" onChange={jest.fn()} />,
      );

      expect(trackStyle().backgroundColor).toBe(colors.secondary);
      expect(styleOf("Week").backgroundColor).toBe(colors.card);

      act(() => useThemeStore.getState().setMode("dark"));

      expect(trackStyle().backgroundColor).toBe(darkColors.secondary);
      expect(styleOf("Week").backgroundColor).toBe(darkColors.card);
    });
  });

  describe("underline", () => {
    it("drops the track and draws a primary indicator instead", () => {
      render(
        <Tabs
          testID="tabs"
          variant="underline"
          items={items}
          value="week"
          onChange={jest.fn()}
        />,
      );

      expect(trackStyle().backgroundColor).toBeUndefined();
      expect(indicatorStyle()).toEqual(
        expect.objectContaining({
          backgroundColor: colors.primary,
          borderRadius: radii.full,
          height: spacing[1],
          position: "absolute",
          bottom: 0,
        }),
      );
    });

    it("places the indicator on the measured active tab", () => {
      render(
        <Tabs
          testID="tabs"
          variant="underline"
          items={items}
          value="week"
          onChange={jest.fn()}
        />,
      );

      measure("Week", spacing[0], spacing[20]);

      expect(indicatorStyle().left).toBe(spacing[0]);
      expect(indicatorStyle().width).toBe(spacing[20]);
    });

    it("animates the indicator across when the active tab changes", () => {
      const { rerender } = render(
        <Tabs
          testID="tabs"
          variant="underline"
          items={items}
          value="week"
          onChange={jest.fn()}
        />,
      );

      measure("Week", spacing[0], spacing[20]);
      measure("Month", spacing[20], spacing[24]);

      rerender(
        <Tabs
          testID="tabs"
          variant="underline"
          items={items}
          value="month"
          onChange={jest.fn()}
        />,
      );

      act(() => jest.advanceTimersByTime(400));

      expect(indicatorStyle().left).toBe(spacing[20]);
      expect(indicatorStyle().width).toBe(spacing[24]);
    });

    it("still reports tab roles and selection", () => {
      render(
        <Tabs
          testID="tabs"
          variant="underline"
          items={items}
          value="year"
          onChange={jest.fn()}
        />,
      );

      expect(screen.getByTestId("tabs").props.accessibilityRole).toBe("tablist");
      expect(screen.getByLabelText("Year").props.accessibilityRole).toBe("tab");
      expect(isSelected("Year")).toBe(true);
    });

    it("follows the active color scheme", () => {
      render(
        <Tabs
          testID="tabs"
          variant="underline"
          items={items}
          value="week"
          onChange={jest.fn()}
        />,
      );

      expect(indicatorStyle().backgroundColor).toBe(colors.primary);

      act(() => useThemeStore.getState().setMode("dark"));

      expect(indicatorStyle().backgroundColor).toBe(darkColors.primary);
    });
  });
});
