/**
 * Font files loaded at runtime, keyed by the family name used in styles.
 *
 * Each weight is registered as its own family — matching `fontFamily` in
 * `@/styles/tokens/typography` — so `text()` can select a weight by name on
 * iOS, Android, and web alike.
 */
export const appFonts = {
  "PlusJakartaSans-Regular": require("../../../assets/fonts/PlusJakartaSans-Regular.ttf"),
  "PlusJakartaSans-Medium": require("../../../assets/fonts/PlusJakartaSans-Medium.ttf"),
  "PlusJakartaSans-SemiBold": require("../../../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  "PlusJakartaSans-Bold": require("../../../assets/fonts/PlusJakartaSans-Bold.ttf"),
  "PlusJakartaSans-ExtraBold": require("../../../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
} as const;
