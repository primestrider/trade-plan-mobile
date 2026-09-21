import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet, Text } from "react-native";

import {
  Accordion,
  accordionChevronTestID,
  accordionContentTestID,
  accordionHeaderTestID,
  accordionPanelTestID,
  type AccordionItem,
} from "@/shared/components/Accordion";
import { useThemeStore } from "@/styles";
import { colors, darkColors } from "@/styles/tokens";

const items: AccordionItem[] = [
  { key: "billing", title: "Billing", content: <Text>Invoices</Text> },
  { key: "privacy", title: "Privacy", content: <Text>Data sharing</Text> },
];

function headerOf(key: string) {
  return screen.getByTestId(accordionHeaderTestID(key));
}

function isExpanded(key: string) {
  return headerOf(key).props.accessibilityState.expanded;
}

function press(key: string) {
  fireEvent.press(headerOf(key));
  // Drains the height/rotation timing so no animation frame outlives the test.
  act(() => jest.runOnlyPendingTimers());
}

beforeEach(() => {
  jest.useFakeTimers();
  act(() => useThemeStore.getState().setMode("light"));
});

afterEach(() => {
  act(() => jest.runOnlyPendingTimers());
  jest.useRealTimers();
});

describe("Accordion", () => {
  it("renders a header per item", () => {
    render(<Accordion items={items} />);

    expect(screen.getByText("Billing")).toBeOnTheScreen();
    expect(screen.getByText("Privacy")).toBeOnTheScreen();
  });

  it("starts with everything collapsed", () => {
    render(<Accordion items={items} />);

    expect(isExpanded("billing")).toBe(false);
    expect(isExpanded("privacy")).toBe(false);
  });

  it("opens the keys named by defaultOpenKeys", () => {
    render(<Accordion items={items} defaultOpenKeys={["privacy"]} />);

    expect(isExpanded("privacy")).toBe(true);
    expect(isExpanded("billing")).toBe(false);
  });

  it("toggles an item open and closed again", () => {
    render(<Accordion items={items} />);

    press("billing");
    expect(isExpanded("billing")).toBe(true);

    press("billing");
    expect(isExpanded("billing")).toBe(false);
  });

  it("keeps several items open at once by default", () => {
    render(<Accordion items={items} />);

    press("billing");
    press("privacy");

    expect(isExpanded("billing")).toBe(true);
    expect(isExpanded("privacy")).toBe(true);
  });

  it("collapses the open item when single is set", () => {
    render(<Accordion items={items} single />);

    press("billing");
    press("privacy");

    expect(isExpanded("billing")).toBe(false);
    expect(isExpanded("privacy")).toBe(true);
  });

  it("exposes each header as a button", () => {
    render(<Accordion items={items} />);

    expect(screen.getAllByRole("button")).toHaveLength(items.length);
  });

  it("blocks touches on collapsed content and lets them through when open", () => {
    render(<Accordion items={items} />);

    const panel = () => screen.getByTestId(accordionPanelTestID("billing"));

    expect(panel().props.pointerEvents).toBe("none");

    press("billing");

    expect(panel().props.pointerEvents).toBe("auto");
  });

  it("measures its content so the height animation has a target", () => {
    render(<Accordion items={items} />);

    const content = screen.getByTestId(accordionContentTestID("billing"));

    expect(typeof content.props.onLayout).toBe("function");
    expect(() =>
      act(() =>
        fireEvent(content, "layout", {
          nativeEvent: { layout: { height: 120 } },
        }),
      ),
    ).not.toThrow();
  });

  it("renders the content of every item", () => {
    render(<Accordion items={items} />);

    expect(screen.getByText("Invoices")).toBeOnTheScreen();
    expect(screen.getByText("Data sharing")).toBeOnTheScreen();
  });

  it("follows the active color scheme", () => {
    render(<Accordion items={items} />);

    const chevronColor = () =>
      StyleSheet.flatten(
        screen.getByTestId(accordionChevronTestID("billing")).props.style,
      ).borderColor;

    expect(chevronColor()).toBe(colors.mutedForeground);
    expect(
      StyleSheet.flatten(screen.getByText("Billing").props.style).color,
    ).toBe(colors.foreground);

    act(() => useThemeStore.getState().setMode("dark"));

    expect(chevronColor()).toBe(darkColors.mutedForeground);
    expect(
      StyleSheet.flatten(screen.getByText("Billing").props.style).color,
    ).toBe(darkColors.foreground);
  });

  it("forwards props to the underlying view", () => {
    render(<Accordion items={items} testID="accordion" />);

    expect(screen.getByTestId("accordion")).toBeOnTheScreen();
  });
});
