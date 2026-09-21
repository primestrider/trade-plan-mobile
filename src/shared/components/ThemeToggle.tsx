import { Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { text, useStyles, useTheme, view, type ThemeMode } from "@/styles";

const modes: readonly { value: ThemeMode; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export type ThemeToggleProps = {
  style?: StyleProp<ViewStyle>;
};

/**
 * Segmented control for the app's color scheme.
 *
 * `System` keeps following the OS setting; the other two pin the scheme.
 * The choice is persisted, so it survives a restart.
 *
 * @example
 * <ThemeToggle />
 */
export function ThemeToggle({ style }: Readonly<ThemeToggleProps>) {
  const styles = useStyles();
  const { mode, setMode } = useTheme();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel="Color scheme"
      style={[
        view(
          styles.flexRow,
          styles.bgSecondary,
          styles.roundedLg,
          styles.p1,
          styles.gap1,
        ),
        style,
      ]}
    >
      {modes.map(({ value, label }) => {
        const selected = mode === value;

        return (
          <Pressable
            key={value}
            accessibilityRole="radio"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
            onPress={() => setMode(value)}
            style={({ pressed }) =>
              view(
                styles.flex1,
                styles.py2,
                styles.px3,
                styles.rounded,
                styles.center,
                selected && styles.bgCard,
                !selected && pressed && styles.opacity75,
              )
            }
          >
            <Text
              style={text(
                styles.textSm,
                selected ? styles.fontSemiBold : styles.fontMedium,
                selected ? styles.textForeground : styles.textMuted,
              )}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
