import { PropsWithChildren } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";

/**
 * Provides keyboard-aware behavior.
 * Enables smooth keyboard animations and avoids keyboard overlapping inputs.
 */
export function AppKeyboardProvider({ children }: Readonly<PropsWithChildren>) {
  return <KeyboardProvider>{children}</KeyboardProvider>;
}
