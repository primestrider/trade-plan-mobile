import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { createRef } from "react";
import { StyleSheet, TextInput } from "react-native";

import { Input } from "@/shared/components";
import { colors } from "@/styles/tokens";

describe("Input", () => {
  // The focus animation keeps a timer alive past the test; draining it under
  // fake timers stops Animated from touching a torn-down environment.
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it("renders a label and a hint", () => {
    render(<Input label="Email" hint="We never share this" />);

    expect(screen.getByText("Email")).toBeOnTheScreen();
    expect(screen.getByText("We never share this")).toBeOnTheScreen();
  });

  it("shows the error instead of the hint", () => {
    render(<Input label="Email" hint="We never share this" error="Required" />);

    expect(screen.getByText("Required")).toBeOnTheScreen();
    expect(screen.queryByText("We never share this")).toBeNull();
  });

  it("colors the label with the destructive tone when invalid", () => {
    render(<Input label="Email" error="Required" />);

    expect(
      StyleSheet.flatten(screen.getByText("Email").props.style).color,
    ).toBe(colors.destructive);
  });

  it("renders left and right adornments", () => {
    render(
      <Input
        placeholder="Search"
        leftIcon={<TextInput testID="left" />}
        rightIcon={<TextInput testID="right" />}
      />,
    );

    expect(screen.getByTestId("left")).toBeOnTheScreen();
    expect(screen.getByTestId("right")).toBeOnTheScreen();
  });

  it("forwards a ref to the underlying TextInput", () => {
    const ref = createRef<TextInput>();
    render(<Input ref={ref} placeholder="Name" />);

    expect(ref.current).not.toBeNull();
  });

  describe("text changes", () => {
    it("passes plain text through untouched", () => {
      const onChangeText = jest.fn();
      render(<Input placeholder="Name" onChangeText={onChangeText} />);

      fireEvent.changeText(screen.getByPlaceholderText("Name"), "John Doe");

      expect(onChangeText).toHaveBeenCalledWith("John Doe");
    });

    it.each([
      ["number", "12a3.4b", "123.4"],
      ["currency", "Rp 1000", "1000"],
    ] as const)("strips non-numeric input for type=%s", (type, typed, expected) => {
      const onChangeText = jest.fn();
      render(
        <Input placeholder="Amount" type={type} onChangeText={onChangeText} />,
      );

      fireEvent.changeText(screen.getByPlaceholderText("Amount"), typed);

      expect(onChangeText).toHaveBeenCalledWith(expected);
    });

    it("keeps letters for text inputs", () => {
      const onChangeText = jest.fn();
      render(<Input placeholder="Bio" type="text" onChangeText={onChangeText} />);

      fireEvent.changeText(screen.getByPlaceholderText("Bio"), "a1b2");

      expect(onChangeText).toHaveBeenCalledWith("a1b2");
    });
  });

  describe("keyboard configuration per type", () => {
    it("configures the email keyboard", () => {
      render(<Input placeholder="Email" type="email" />);

      const input = screen.getByPlaceholderText("Email");

      expect(input.props.keyboardType).toBe("email-address");
      expect(input.props.autoCapitalize).toBe("none");
    });

    it("configures the phone keyboard", () => {
      render(<Input placeholder="Phone" type="phone" />);

      expect(screen.getByPlaceholderText("Phone").props.keyboardType).toBe(
        "phone-pad",
      );
    });

    it.each(["number", "currency"] as const)(
      "uses a decimal pad for type=%s",
      (type) => {
        render(<Input placeholder="Amount" type={type} />);

        expect(screen.getByPlaceholderText("Amount").props.keyboardType).toBe(
          "decimal-pad",
        );
      },
    );

    it("masks a password", () => {
      render(<Input placeholder="Password" type="password" />);

      expect(screen.getByPlaceholderText("Password").props.secureTextEntry).toBe(
        true,
      );
    });
  });

  describe("focus and blur", () => {
    it("notifies the caller", () => {
      const onFocus = jest.fn();
      const onBlur = jest.fn();
      render(<Input placeholder="Name" onFocus={onFocus} onBlur={onBlur} />);

      const input = screen.getByPlaceholderText("Name");

      fireEvent(input, "focus");
      expect(onFocus).toHaveBeenCalledTimes(1);

      fireEvent(input, "blur");
      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });

  it("dismisses the keyboard on submit and still notifies the caller", () => {
    const { KeyboardController } = require("react-native-keyboard-controller");
    const onSubmitEditing = jest.fn();

    render(<Input placeholder="Name" onSubmitEditing={onSubmitEditing} />);

    fireEvent(screen.getByPlaceholderText("Name"), "submitEditing");

    expect(KeyboardController.dismiss).toHaveBeenCalled();
    expect(onSubmitEditing).toHaveBeenCalledTimes(1);
  });

  it("marks the input non-editable when disabled", () => {
    render(<Input placeholder="Name" editable={false} />);

    expect(screen.getByPlaceholderText("Name").props.editable).toBe(false);
  });
});
