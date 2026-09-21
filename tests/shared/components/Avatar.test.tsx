import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";

import { Avatar } from "@/shared/components/Avatar";
import { useThemeStore } from "@/styles";
import { colors, darkColors, fontSize, radii, spacing } from "@/styles/tokens";

// `expo-image` is a native view with no JS implementation under Jest. This
// stand-in keeps only the props the component actually depends on, so the
// error path stays drivable from a test.
jest.mock("expo-image", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    Image: ({ style, onError }: { style?: unknown; onError?: () => void }) =>
      React.createElement(View, { testID: "avatar-image", style, onError }),
  };
});

function styleOf(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID).props.style);
}

function statusStyleOf(status: string) {
  return StyleSheet.flatten(screen.getByLabelText(status).props.style);
}

beforeEach(() => {
  act(() => useThemeStore.getState().setMode("light"));
});

describe("Avatar", () => {
  describe("initials", () => {
    it("takes one letter from each of the first two words", () => {
      render(<Avatar name="Ada Lovelace" />);

      expect(screen.getByText("AL")).toBeOnTheScreen();
    });

    it("takes a single letter from a one-word name", () => {
      render(<Avatar name="Ada" />);

      expect(screen.getByText("A")).toBeOnTheScreen();
    });

    it("uppercases a lowercase name", () => {
      render(<Avatar name="ada lovelace" />);

      expect(screen.getByText("AL")).toBeOnTheScreen();
    });

    it("stops at two letters for a longer name", () => {
      render(<Avatar name="Ada Byron Lovelace" />);

      expect(screen.getByText("AB")).toBeOnTheScreen();
    });

    it("renders a bare placeholder with no name and no source", () => {
      render(<Avatar testID="avatar" />);

      expect(screen.UNSAFE_queryByType(Text)).toBeNull();
      expect(screen.queryByTestId("avatar-image")).toBeNull();
      expect(styleOf("avatar").backgroundColor).toBe(colors.secondary);
    });

    it("renders a bare placeholder for a blank name", () => {
      render(<Avatar name="   " testID="avatar" />);

      expect(screen.UNSAFE_queryByType(Text)).toBeNull();
    });
  });

  describe("image", () => {
    it("shows the image instead of the initials", () => {
      render(<Avatar source="https://example.com/ada.png" name="Ada Lovelace" />);

      expect(screen.getByTestId("avatar-image")).toBeOnTheScreen();
      expect(screen.queryByText("AL")).toBeNull();
    });

    it("falls back to the initials when the image fails", () => {
      render(<Avatar source="https://example.com/ada.png" name="Ada Lovelace" />);

      fireEvent(screen.getByTestId("avatar-image"), "error");

      expect(screen.queryByTestId("avatar-image")).toBeNull();
      expect(screen.getByText("AL")).toBeOnTheScreen();
    });
  });

  describe("sizes", () => {
    it.each([
      ["xs", spacing[6]],
      ["sm", spacing[8]],
      ["md", spacing[10]],
      ["lg", spacing[14]],
      ["xl", spacing[20]],
    ] as const)("%s is a %ipx square", (size, box) => {
      render(<Avatar name="Ada" size={size} testID="avatar" />);

      const style = styleOf("avatar");

      expect(style.width).toBe(box);
      expect(style.height).toBe(box);
    });

    it("defaults to md", () => {
      render(<Avatar name="Ada" testID="avatar" />);

      expect(styleOf("avatar").width).toBe(spacing[10]);
    });
  });

  describe("shape", () => {
    it("is a circle by default", () => {
      render(<Avatar name="Ada" testID="avatar" />);

      expect(styleOf("avatar").borderRadius).toBe(radii.full);
    });

    it("uses the 2xl radius when rounded", () => {
      render(<Avatar name="Ada" shape="rounded" testID="avatar" />);

      expect(styleOf("avatar").borderRadius).toBe(radii["2xl"]);
    });

    it("clips the image to the same shape", () => {
      render(<Avatar source="https://example.com/ada.png" shape="rounded" />);

      expect(styleOf("avatar-image").borderRadius).toBe(radii["2xl"]);
    });
  });

  describe("status", () => {
    it("is absent unless a status is given", () => {
      render(<Avatar name="Ada" />);

      expect(screen.queryByLabelText("online")).toBeNull();
    });

    it.each([
      ["online", colors.success],
      ["busy", colors.destructive],
      ["away", colors.warning],
      ["offline", colors.muted],
    ] as const)("%s shows a %s dot", (status, expected) => {
      render(<Avatar name="Ada" status={status} />);

      expect(statusStyleOf(status).backgroundColor).toBe(expected);
    });

    it("rings the dot in the page background", () => {
      render(<Avatar name="Ada" status="online" />);

      const style = statusStyleOf("online");

      expect(style.borderColor).toBe(colors.background);
      expect(style.borderWidth).toBeGreaterThan(0);
      expect(style.position).toBe("absolute");
    });
  });

  it("follows the active color scheme", () => {
    render(<Avatar name="Ada" status="online" testID="avatar" />);

    expect(styleOf("avatar").backgroundColor).toBe(colors.secondary);
    expect(statusStyleOf("online").borderColor).toBe(colors.background);

    act(() => useThemeStore.getState().setMode("dark"));

    expect(styleOf("avatar").backgroundColor).toBe(darkColors.secondary);
    expect(statusStyleOf("online").borderColor).toBe(darkColors.background);
    expect(
      StyleSheet.flatten(screen.getByText("A").props.style).color,
    ).toBe(darkColors.secondaryForeground);
  });

  it("lets an external style win", () => {
    render(<Avatar name="Ada" style={{ borderRadius: 2 }} testID="avatar" />);

    expect(styleOf("avatar").borderRadius).toBe(2);
  });

  it("forwards props to the underlying View", () => {
    render(<Avatar name="Ada" accessibilityLabel="Ada Lovelace" testID="avatar" />);

    expect(screen.getByTestId("avatar").props.accessibilityLabel).toBe(
      "Ada Lovelace",
    );
  });
});

describe("Avatar.Group", () => {
  it("renders every child when no max is set", () => {
    render(
      <Avatar.Group>
        <Avatar name="Ada" testID="a" />
        <Avatar name="Grace Hopper" testID="b" />
      </Avatar.Group>,
    );

    expect(screen.getByTestId("a")).toBeOnTheScreen();
    expect(screen.getByTestId("b")).toBeOnTheScreen();
    expect(screen.queryByText(/^\+/)).toBeNull();
  });

  it("collapses the overflow into a +N tile", () => {
    render(
      <Avatar.Group max={2}>
        <Avatar name="Ada" testID="a" />
        <Avatar name="Grace Hopper" testID="b" />
        <Avatar name="Katherine Johnson" testID="c" />
        <Avatar name="Margaret Hamilton" testID="d" />
      </Avatar.Group>,
    );

    expect(screen.getByTestId("a")).toBeOnTheScreen();
    expect(screen.getByTestId("b")).toBeOnTheScreen();
    expect(screen.queryByTestId("c")).toBeNull();
    expect(screen.getByText("+2")).toBeOnTheScreen();
  });

  it("shows no tile when the count matches max exactly", () => {
    render(
      <Avatar.Group max={2}>
        <Avatar name="Ada" />
        <Avatar name="Grace Hopper" />
      </Avatar.Group>,
    );

    expect(screen.queryByText(/^\+/)).toBeNull();
  });

  it("overlaps every child but the first", () => {
    render(
      <Avatar.Group spacing={spacing[3]} testID="group">
        <Avatar name="Ada" testID="a" />
        <Avatar name="Grace Hopper" testID="b" />
      </Avatar.Group>,
    );

    const [first, second] = screen.getByTestId("group").children as {
      props: { style?: StyleProp<ViewStyle> };
    }[];

    expect(StyleSheet.flatten(first.props.style)?.marginLeft).toBeUndefined();
    expect(StyleSheet.flatten(second.props.style)?.marginLeft).toBe(
      -spacing[3],
    );
  });

  it("matches the overflow tile to the size of its siblings", () => {
    render(
      <Avatar.Group max={1}>
        <Avatar name="Ada" size="xl" />
        <Avatar name="Grace Hopper" size="xl" />
      </Avatar.Group>,
    );

    expect(
      StyleSheet.flatten(screen.getByText("+1").props.style).fontSize,
    ).toBe(fontSize.lg);
  });
});
