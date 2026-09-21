import type { PropsWithChildren } from "react";

import { AppGestureHandlerProvider } from "@/plugins/gesture-handler/provider";
import { AppI18nProvider } from "@/plugins/i18n/provider";
import { AppKeyboardProvider } from "@/plugins/keyboard/provider";
import { AppQueryProvider } from "@/plugins/react-query/provider";
import { AppSafeAreaProvider } from "@/plugins/safe-area/provider";
import { ToastProvider } from "@/shared/components";

/**
 * Root provider that composes all app-level context providers.
 * Order matters: GestureHandler → SafeArea → I18n → Query → Keyboard → Toast
 *
 * Toast sits innermost: it renders above the app and reads safe-area insets,
 * so it needs every provider around it already in place.
 */
export function AppProvider({ children }: Readonly<PropsWithChildren>) {
  return (
    <AppGestureHandlerProvider>
      <AppSafeAreaProvider>
        <AppI18nProvider>
          <AppQueryProvider>
            <AppKeyboardProvider>
              <ToastProvider>{children}</ToastProvider>
            </AppKeyboardProvider>
          </AppQueryProvider>
        </AppI18nProvider>
      </AppSafeAreaProvider>
    </AppGestureHandlerProvider>
  );
}
