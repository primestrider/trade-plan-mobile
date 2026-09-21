import { Stack } from "expo-router";

import { useTheme } from "@/styles";

/**
 * Gives the protected group a route node of its own.
 *
 * Without a layout here, Expo Router hoists `account` into the root navigator
 * as `(protected)/account`, and the root's `<Stack.Protected>` guard — which
 * names `(protected)` — matches nothing and protects nothing.
 *
 * The root layout hides this group's own header (`headerShown: false`), so the
 * header the user sees is the one this `<Stack>` draws. A nested navigator does
 * not inherit the root's `screenOptions`, so the theme is restated here — the
 * same thing `(public)/example/_layout.tsx` does. `account.tsx` supplies the
 * title through its own `<Stack.Screen options>`.
 */
export default function ProtectedLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.foreground,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
