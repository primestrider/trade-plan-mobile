import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";

import "@/plugins/auth";
import { appFonts } from "@/plugins/fonts";
import { AppProvider } from "@/providers/AppProvider";
import { useTheme } from "@/styles";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(appFonts);
  const { colors, isDark } = useTheme();
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
          Never guarded: the showcase is documentation, readable in either
          state. `(public)` has no `_layout` of its own, so its screens are
          hoisted into this navigator and the name below matches
          `(public)/index` alone — these options configure the home screen, not
          the group. Left that way deliberately: giving the group a layout would
          cascade `headerShown: false` over every showcase screen. Nothing is
          wrong because nothing here is guarded; a guard would need the layout.
          See `tests/app/routes.test.ts`.
        */}
        <Stack.Screen name="(public)" options={{ headerShown: false }} />

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
