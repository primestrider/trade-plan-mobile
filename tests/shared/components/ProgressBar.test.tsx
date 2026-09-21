import { act, render, screen } from "@testing-library/react-native";
import { Animated, StyleSheet, View } from "react-native";

import { ProgressBar } from "@/shared/components/ProgressBar";
import { useThemeStore } from "@/styles";
import { colors, darkColors, radii, spacing } from "@/styles/tokens";

/**
 * The track and its fill are the last two Views rendered, whether or not a
 * label row sits above them.
 */
function parts() {
  const views = screen.UNSAFE_getAllByType(View);

  return {
    track: StyleSheet.flatten(views[views.length - 2].props.style),
    fill: StyleSheet.flatten(views[views.length - 1].props.style),
  };
}

beforeEach(() => {
  // The fill animation leaves a frame pending; it is drained in `afterEach`.
  jest.useFakeTimers();
  act(() => useThemeStore.getState().setMode("light"));
});

afterEach(() => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
});

describe("ProgressBar", () => {
  it("renders an empty bar by default", () => {
    render(<ProgressBar testID="bar" />);

    expect(parts().fill.width).toBe("0%");
  });

  it("fills to the given fraction", () => {
    render(<ProgressBar value={0.5} testID="bar" />);

    expect(parts().fill.width).toBe("50%");
  });

  it("paints the track with the secondary surface", () => {
    render(<ProgressBar value={0.5} testID="bar" />);

    expect(parts().track.backgroundColor).toBe(colors.secondary);
  });

  it.each([
    ["primary", colors.primary],
    ["success", colors.success],
    ["warning", colors.warning],
    ["destructive", colors.destructive],
  ] as const)("fills the %s variant from the theme", (variant, expected) => {
    render(<ProgressBar value={0.5} variant={variant} testID="bar" />);

    expect(parts().fill.backgroundColor).toBe(expected);
  });

  it("follows the active color scheme", () => {
    render(<ProgressBar value={0.5} testID="bar" />);

    expect(parts().fill.backgroundColor).toBe(colors.primary);
    expect(parts().track.backgroundColor).toBe(colors.secondary);

    act(() => useThemeStore.getState().setMode("dark"));

    expect(parts().fill.backgroundColor).toBe(darkColors.primary);
    expect(parts().track.backgroundColor).toBe(darkColors.secondary);
  });

  it.each([
    ["sm", spacing[1]],
    ["md", spacing[2]],
  ] as const)("maps size %s to a track height token", (size, height) => {
    render(<ProgressBar value={0.5} size={size} testID="bar" />);

    expect(parts().track.height).toBe(height);
  });

  it("rounds the track and the fill fully", () => {
    render(<ProgressBar value={0.5} testID="bar" />);

    const { track, fill } = parts();

    expect(track.borderRadius).toBe(radii.full);
    expect(fill.borderRadius).toBe(radii.full);
  });

  describe("clamping", () => {
    it("caps an over-full value", () => {
      render(<ProgressBar value={1.5} testID="bar" />);

      expect(parts().fill.width).toBe("100%");
      expect(screen.getByTestId("bar").props.accessibilityValue.now).toBe(100);
    });

    it("floors a negative value", () => {
      render(<ProgressBar value={-0.2} testID="bar" />);

      expect(parts().fill.width).toBe("0%");
      expect(screen.getByTestId("bar").props.accessibilityValue.now).toBe(0);
    });
  });

  describe("accessibility", () => {
    it("reports its position as a percentage", () => {
      render(<ProgressBar value={0.42} testID="bar" />);

      const element = screen.getByTestId("bar");

      expect(element.props.accessibilityRole).toBe("progressbar");
      expect(element.props.accessibilityValue).toEqual({
        now: 42,
        min: 0,
        max: 100,
      });
    });

    it("reports no position while indeterminate", () => {
      render(<ProgressBar indeterminate testID="bar" />);

      const element = screen.getByTestId("bar");

      expect(element.props.accessibilityRole).toBe("progressbar");
      expect(element.props.accessibilityValue).toBeUndefined();
    });
  });

  describe("label", () => {
    it("shows the label and the percentage", () => {
      render(<ProgressBar value={0.42} label="Uploading" testID="bar" />);

      expect(screen.getByText("Uploading")).toBeOnTheScreen();
      expect(screen.getByText("42%")).toBeOnTheScreen();
    });

    it("rounds the percentage it shows", () => {
      render(<ProgressBar value={0.666} label="Uploading" testID="bar" />);

      expect(screen.getByText("67%")).toBeOnTheScreen();
    });

    it("drops the percentage while indeterminate", () => {
      render(<ProgressBar indeterminate label="Syncing" testID="bar" />);

      expect(screen.getByText("Syncing")).toBeOnTheScreen();
      expect(screen.queryByText("0%")).toBeNull();
    });

    it("renders nothing above the bar without a label", () => {
      render(<ProgressBar value={0.5} testID="bar" />);

      expect(screen.queryByText("50%")).toBeNull();
    });
  });

  describe("indeterminate", () => {
    it("ignores the value and slides a fixed-width chip", () => {
      render(<ProgressBar indeterminate value={0.5} testID="bar" />);

      const { fill } = parts();

      expect(fill.width).toBe("40%");
      expect(fill.position).toBe("absolute");
    });

    it("starts the chip off the leading edge", () => {
      render(<ProgressBar indeterminate testID="bar" />);

      expect(parts().fill.left).toBe("-40%");
    });

    it("moves the chip across the track", () => {
      render(<ProgressBar indeterminate testID="bar" />);

      const start = parts().fill.left;

      act(() => {
        jest.advanceTimersByTime(600);
      });

      expect(parts().fill.left).not.toBe(start);
    });

    it("stops sliding when unmounted", () => {
      const loop = jest.spyOn(Animated, "loop");

      const { unmount } = render(<ProgressBar indeterminate testID="bar" />);

      const slide = loop.mock.results[0].value as Animated.CompositeAnimation;
      const stop = jest.spyOn(slide, "stop");

      unmount();

      expect(stop).toHaveBeenCalled();

      loop.mockRestore();
    });
  });

  it("lets an external style win", () => {
    render(<ProgressBar value={0.5} style={{ width: 120 }} testID="bar" />);

    expect(StyleSheet.flatten(screen.getByTestId("bar").props.style).width).toBe(
      120,
    );
  });

  it("forwards props to the underlying View", () => {
    render(<ProgressBar value={0.5} testID="bar" accessibilityLabel="Upload" />);

    expect(screen.getByTestId("bar").props.accessibilityLabel).toBe("Upload");
  });
});
