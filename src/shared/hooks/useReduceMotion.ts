import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/**
 * Whether the user has asked the OS to reduce motion.
 *
 * Starts at `false` and settles once the setting is read, then follows it if
 * it changes while the app is open. Use it to swap movement for a plain fade,
 * not to drop feedback altogether.
 *
 * @example
 * const reduceMotion = useReduceMotion();
 * const offset = reduceMotion ? 0 : 24;
 */
export function useReduceMotion() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // State already starts at `false`, so only a reduced-motion setting needs
    // writing — which also spares every render a redundant async update.
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (isMounted && enabled) setReduceMotion(true);
    });

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}
