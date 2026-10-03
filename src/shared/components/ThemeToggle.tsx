import { useTranslation } from "react-i18next";
import { Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { text, useStyles, useTheme, view, type ThemeMode } from "@/styles";

const modes: readonly ThemeMode[] = ["system", "light", "dark"];

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
  const { t } = useTranslation();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={t("utils.theme.label")}
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
      {modes.map((value) => {
        const selected = mode === value;
        const label = t(`utils.theme.${value}`);

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
