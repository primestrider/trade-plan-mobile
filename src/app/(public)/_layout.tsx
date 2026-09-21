import { Stack } from "expo-router";

import { useTheme } from "@/styles";

/**
 * Gives the public group a route node of its own.
 *
 * `src/app/_layout.tsx` guards this group behind onboarding, and
 * `<Stack.Protected>` removes a route by matching its name. Without a layout
 * here, Expo Router hoists these screens into the root navigator under
 * compound names — `(public)/index` — and a guard naming `(public)` would have
 * no node to remove, so it would silently protect nothing. That is the bug
 * `tests/app/routes.test.ts` exists to catch.
 *
 * A nested navigator does not inherit the root's `screenOptions`, so the theme
 * is restated here — the same thing `(protected)/_layout.tsx` does. The home
 * screen keeps the headerless look it had before this layout existed; screens
 * added to the group later get a themed header rather than none.
 */
export default function PublicLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.foreground,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
