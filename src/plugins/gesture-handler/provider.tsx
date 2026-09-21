import { PropsWithChildren } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

/**
 * Provides the React Native Gesture Handler root view.
 * Required for gesture-based interactions (swipe, pinch, pan, etc.).
 */
export function AppGestureHandlerProvider({
  children,
}: Readonly<PropsWithChildren>) {
  return <GestureHandlerRootView>{children}</GestureHandlerRootView>;
}
