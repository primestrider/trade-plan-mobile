import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { Animated, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useStyles, useTheme, view } from "@/styles";
import { radii, spacing, type ThemeColors } from "@/styles/tokens";

import { AppText } from "./AppText";

const ENTER_DURATION = 200;
const DEFAULT_DURATION = 3000;

/**
 * Toast ids only need to be unique, never meaningful, and nothing re-renders
 * when one is handed out — so the counter lives outside React rather than in a
 * ref that React would have to track.
 */
let nextToastId = 0;

type ToastVariant = "default" | "success" | "error" | "warning" | "info";

export type ToastOptions = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** Milliseconds before it dismisses itself. */
  duration?: number;
};

type ToastEntry = ToastOptions & { id: string };

export type ToastApi = {
  show: (options: ToastOptions) => string;
  success: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  warning: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
};

const ToastContext = createContext<ToastApi | null>(null);

/**
 * Transient feedback, stacked at the top of the screen.
 *
 * Mount once, inside the safe-area provider. `Toast` deliberately renders
 * above the app rather than inside a `Modal`, so a toast raised while a
 * dialog is open does not fight it for the same layer.
 *
 * @example
 * const toast = useToast();
 * toast.success("Saved", "Your changes are live.");
 */
export function ToastProvider({ children }: Readonly<PropsWithChildren>) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();

  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const api = useMemo<ToastApi>(() => {
    const show = (options: ToastOptions) => {
      const id = String(nextToastId++);
      setToasts((current) => [...current, { ...options, id }]);
      return id;
    };

    const shorthand =
      (variant: ToastVariant) => (title: string, description?: string) =>
        show({ title, description, variant });

    return {
      show,
      success: shorthand("success"),
      error: shorthand("error"),
      warning: shorthand("warning"),
      info: shorthand("info"),
      dismiss,
      dismissAll: () => setToasts([]),
    };
  }, [dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}

      {toasts.length > 0 ? (
        <View
          // `box-none` so the gap between toasts stays tappable.
          pointerEvents="box-none"
          testID="toast-container"
          // Pinned to the top edge only — `inset0` would stretch the container
          // over the whole screen and swallow taps meant for the app.
          style={view(styles.absolute, styles.px4, styles.gap2, {
            top: insets.top + spacing[2],
            left: 0,
            right: 0,
          })}
        >
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

/** Raises toasts. Must be called under a `ToastProvider`. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);

  if (!api) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return api;
}

type ToastItemProps = {
  toast: ToastEntry;
  onDismiss: (id: string) => void;
};

function ToastItem({ toast, onDismiss }: Readonly<ToastItemProps>) {
  const styles = useStyles();
  const { colors } = useTheme();

  const progress = useState(() => new Animated.Value(0))[0];

  const duration = toast.duration ?? DEFAULT_DURATION;

  // Removal is driven by timers, never by the animation's completion callback:
  // an interrupted animation would otherwise strand the toast on screen
  // forever. The fade is decoration over a schedule that stands on its own.
  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: ENTER_DURATION,
      useNativeDriver: true,
    }).start();

    let removeTimer: ReturnType<typeof setTimeout>;

    const exitTimer = setTimeout(() => {
      Animated.timing(progress, {
        toValue: 0,
        duration: ENTER_DURATION,
        useNativeDriver: true,
      }).start();

      removeTimer = setTimeout(() => onDismiss(toast.id), ENTER_DURATION);
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [progress, duration, onDismiss, toast.id]);

  const accent = getVariantColor(toast.variant ?? "default", colors);

  return (
    <Animated.View
      style={view(styles.flexRow, styles.itemsCenter, styles.gap3, styles.bgCard, styles.rounded2xl, styles.p4, styles.shadowLg, {
        opacity: progress,
        transform: [
          {
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [-spacing[4], 0],
            }),
          },
        ],
      })}
    >
      <View
        // Keyed by variant, not id: the variant is what a test cares about,
        // and ids are deliberately not predictable.
        testID={`toast-accent-${toast.variant ?? "default"}`}
        style={view({
          width: spacing[1],
          alignSelf: "stretch",
          borderRadius: radii.full,
          backgroundColor: accent,
        })}
      />

      <View style={view(styles.flex1, styles.gap1)}>
        <AppText variant="label" weight="semibold">
          {toast.title}
        </AppText>
        {toast.description ? (
          <AppText variant="caption" color="muted">
            {toast.description}
          </AppText>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
        hitSlop={spacing[2]}
        onPress={() => onDismiss(toast.id)}
        style={({ pressed }) => view(pressed && styles.opacity50)}
      >
        <AppText color="muted">×</AppText>
      </Pressable>
    </Animated.View>
  );
}

function getVariantColor(variant: ToastVariant, colors: ThemeColors) {
  switch (variant) {
    case "default":
      return colors.muted;
    case "success":
      return colors.success;
    case "error":
      return colors.destructive;
    case "warning":
      return colors.warning;
    case "info":
      return colors.info;
  }
}
