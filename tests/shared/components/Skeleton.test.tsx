import { act, render, screen } from "@testing-library/react-native";
import { Animated, StyleSheet, View } from "react-native";

import { Skeleton } from "@/shared/components/Skeleton";
import { useThemeStore } from "@/styles";
import { colors, darkColors, radii, spacing } from "@/styles/tokens";

/**
 * Skeletons hide themselves from accessibility, which also hides them from the
 * default queries — so every lookup here has to opt back in.
 */
function elementOf(testID: string) {
  return screen.getByTestId(testID, { includeHiddenElements: true });
}

function styleOf(testID: string) {
  return StyleSheet.flatten(elementOf(testID).props.style);
}

/** `Skeleton.Text` renders one bar per line inside a single wrapper View. */
function bars() {
  return screen.UNSAFE_getAllByType(View).slice(1);
}

beforeEach(() => {
  // The pulse loop never settles on its own, so it is drained in `afterEach`.
  jest.useFakeTimers();
  act(() => useThemeStore.getState().setMode("light"));
});

afterEach(() => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
});

describe("Skeleton", () => {
  it("renders a full-width bar by default", () => {
    render(<Skeleton testID="bar" />);

    const style = styleOf("bar");

    expect(style.width).toBe("100%");
    expect(style.height).toBe(spacing[4]);
  });

  it("paints the secondary surface", () => {
    render(<Skeleton testID="bar" />);

    expect(styleOf("bar").backgroundColor).toBe(colors.secondary);
  });

  it("follows the active color scheme", () => {
    render(<Skeleton testID="bar" />);

    expect(styleOf("bar").backgroundColor).toBe(colors.secondary);

    act(() => useThemeStore.getState().setMode("dark"));

    expect(styleOf("bar").backgroundColor).toBe(darkColors.secondary);
  });

  it("accepts an explicit width and height", () => {
    render(<Skeleton width={spacing[20]} height={spacing[12]} testID="bar" />);

    expect(styleOf("bar").width).toBe(spacing[20]);
    expect(styleOf("bar").height).toBe(spacing[12]);
  });

  it("accepts a percentage width", () => {
    render(<Skeleton width="50%" testID="bar" />);

    expect(styleOf("bar").width).toBe("50%");
  });

  it("rounds a block at the 2xl radius", () => {
    render(<Skeleton testID="bar" />);

    expect(styleOf("bar").borderRadius).toBe(radii["2xl"]);
  });

  it("honours an explicit radius", () => {
    render(<Skeleton radius={radii.sm} testID="bar" />);

    expect(styleOf("bar").borderRadius).toBe(radii.sm);
  });

  it("squares a circle off its height and rounds it fully", () => {
    render(<Skeleton circle height={spacing[10]} width="100%" testID="bar" />);

    const style = styleOf("bar");

    expect(style.width).toBe(spacing[10]);
    expect(style.height).toBe(spacing[10]);
    expect(style.borderRadius).toBe(radii.full);
  });

  it("starts fully opaque", () => {
    render(<Skeleton testID="bar" />);

    expect(styleOf("bar").opacity).toBe(1);
  });

  it("stops pulsing when unmounted", () => {
    const loop = jest.spyOn(Animated, "loop");

    const { unmount } = render(<Skeleton testID="bar" />);

    const pulse = loop.mock.results[0].value as Animated.CompositeAnimation;
    const stop = jest.spyOn(pulse, "stop");

    unmount();

    expect(stop).toHaveBeenCalled();

    loop.mockRestore();
  });

  it("is hidden from screen readers", () => {
    render(<Skeleton testID="bar" />);

    const element = elementOf("bar");

    expect(element.props.accessibilityRole).toBe("none");
    expect(element.props.accessibilityElementsHidden).toBe(true);
    expect(element.props.importantForAccessibility).toBe("no-hide-descendants");
  });

  it("lets an external style win", () => {
    render(<Skeleton style={{ height: 99 }} testID="bar" />);

    expect(styleOf("bar").height).toBe(99);
  });

  it("forwards props to the underlying View", () => {
    render(<Skeleton testID="bar" accessibilityLabel="placeholder" />);

    expect(elementOf("bar").props.accessibilityLabel).toBe("placeholder");
  });

  describe("Text", () => {
    it("stacks three bars by default", () => {
      render(<Skeleton.Text />);

      expect(bars()).toHaveLength(3);
    });

    it("stacks as many bars as asked", () => {
      render(<Skeleton.Text lines={5} />);

      expect(bars()).toHaveLength(5);
    });

    it("shortens the last bar", () => {
      render(<Skeleton.Text />);

      const widths = bars().map(
        (bar) => StyleSheet.flatten(bar.props.style).width,
      );

      expect(widths).toEqual(["100%", "100%", "60%"]);
    });

    it("accepts a custom last-line width", () => {
      render(<Skeleton.Text lines={2} lastLineWidth="30%" />);

      const widths = bars().map(
        (bar) => StyleSheet.flatten(bar.props.style).width,
      );

      expect(widths).toEqual(["100%", "30%"]);
    });

    it("applies a shared height to every bar", () => {
      render(<Skeleton.Text lines={2} height={spacing[3]} />);

      for (const bar of bars()) {
        expect(StyleSheet.flatten(bar.props.style).height).toBe(spacing[3]);
      }
    });

    it("gaps the bars with a spacing token", () => {
      render(<Skeleton.Text testID="paragraph" />);

      expect(styleOf("paragraph").gap).toBe(spacing[2]);
    });

    it("is hidden from screen readers", () => {
      render(<Skeleton.Text testID="paragraph" />);

      expect(elementOf("paragraph").props.accessibilityElementsHidden).toBe(
        true,
      );
    });
  });
});
