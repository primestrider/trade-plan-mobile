import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";

import { useProfileStore } from "@/features/onboarding/stores/profile.store";
import "@/plugins/auth";
import { appFonts } from "@/plugins/fonts";
import { AppProvider } from "@/providers/AppProvider";
import { useTheme } from "@/styles";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(appFonts);
  const { colors, isDark } = useTheme();
  const hasCompletedOnboarding = useProfileStore(
    (state) => state.hasCompletedOnboarding,
  );
  // Placed above the early return below so the rules of hooks hold: a hook
  // may never run only on some renders.

  const isReady = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  // Paints the window behind the React tree, so rotating or pushing a screen
  // never flashes the default white.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors]);

  // Keep the splash screen up rather than flashing fallback system fonts.
  if (!isReady) return null;

  return (
    <AppProvider>
      <StatusBar style={isDark ? "light" : "dark"} />

      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.foreground,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {/*
          The onboarding gate. `Stack.Protected` removes routes rather than
          redirecting, so while the profile is missing `(public)` is not in the
          navigator at all and onboarding is simply the only place left to be.
          Storing the profile flips both guards and carries the user in — no
          `router.replace`, and no frame where the home screen shows through.

          MMKV rehydrates the store synchronously, so this reads the real value
          on the first render rather than defaulting to "not onboarded" and
          correcting itself a frame later.

          `(public)` has a `_layout.tsx` for this reason alone: a guard can only
          remove a route node it can name, and without the layout its screens
          are hoisted into this navigator under compound names. See
          `tests/app/routes.test.ts`.
        */}
        <Stack.Protected guard={!hasCompletedOnboarding}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={hasCompletedOnboarding}>
          <Stack.Screen name="(public)" options={{ headerShown: false }} />
        </Stack.Protected>

        {/* Signing in removes this route, and that is what moves the user on. */}
        {/* <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="sign-in" />
        </Stack.Protected> */}

        {/* Signing out removes this one, carrying the user back out. */}
        {/* <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(protected)" options={{ headerShown: false }} />
        </Stack.Protected> */}
      </Stack>
    </AppProvider>
  );
}

/**
 * Satisfies Expo Router's file-based convention (a route file exports
 * `ErrorBoundary` to be picked up as this layout's fallback). The actual
 * component lives in `@/shared/components/AppErrorBoundary` — see that file's
 * docstring for why it may not use `useTranslation` or `useToast`.
 */
export { AppErrorBoundary as ErrorBoundary } from "@/shared/components";
