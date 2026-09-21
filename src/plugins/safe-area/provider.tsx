import type { PropsWithChildren } from "react";

import { SafeAreaProvider } from "react-native-safe-area-context";

/**
 * Provides the safe area insets context.
 * Enables components to read safe area insets via `useSafeAreaInsets()`.
 */
export function AppSafeAreaProvider({ children }: Readonly<PropsWithChildren>) {
  return <SafeAreaProvider>{children}</SafeAreaProvider>;
}
