import {
  useEffect,
  useState,
} from "react";
import { Animated, Pressable } from "react-native";

import { useStyles, view } from "@/styles";
import { palette } from "@/styles/tokens";

/** Shared enter/exit duration, so every overlay in the app moves alike. */
export const OVERLAY_DURATION = 200;

/** How dark the scrim gets at rest. */
const SCRIM_OPACITY = 0.5;

/**
 * Drives an overlay's enter/exit animation and keeps it mounted until the exit
 * finishes.
 *
 * A `Modal` unmounts the instant `visible` flips to false, which would cut the
 * exit animation off mid-frame. `mounted` lags `visible` on the way out so the
 * animation gets to play.
 */
export function useOverlayTransition(visible: boolean) {
  const [mounted, setMounted] = useState(visible);
  const progress = useState(() => new Animated.Value(visible ? 1 : 0))[0];

  useEffect(() => {
    if (visible) {
      // Deliberate: `mounted` has to survive one render past `visible` so the
      // exit animation can play. Deriving it instead would unmount the overlay
      // mid-animation, which is the bug this hook exists to prevent.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);

      const animation = Animated.timing(progress, {
        toValue: 1,
        duration: OVERLAY_DURATION,
        useNativeDriver: true,
      });

      animation.start();

      return () => animation.stop();
    }

    const animation = Animated.timing(progress, {
      toValue: 0,
      duration: OVERLAY_DURATION,
      useNativeDriver: true,
    });

    animation.start(({ finished }) => {
      if (finished) setMounted(false);
    });

    return () => animation.stop();
  }, [visible, progress]);

  return { mounted, progress };
}

export type BackdropProps = {
  progress: Animated.Value;
  /** Omit to make the scrim inert — a dialog that must be answered. */
  onPress?: () => void;
};

/**
 * The dimmed layer behind an overlay.
 *
 * Opacity is interpolated rather than set on the color, so the scrim can
 * animate on the native driver.
 */
export function Backdrop({ progress, onPress }: Readonly<BackdropProps>) {
  const styles = useStyles();

  return (
    <>
      {/*
        The dimming layer and the dismiss target are separate views on purpose.
        Nesting the target inside an opacity-animated parent makes it
        unreachable while that opacity is 0 — both to assistive technology and
        to hit testing — which is exactly when the overlay is opening.
      */}
      <Animated.View
        pointerEvents="none"
        style={view(styles.absolute, styles.inset0, {
          backgroundColor: palette.black,
          opacity: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, SCRIM_OPACITY],
          }),
        })}
      />

      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={onPress}
          style={view(styles.absolute, styles.inset0)}
          testID="overlay-backdrop"
        />
      ) : null}
    </>
  );
}
