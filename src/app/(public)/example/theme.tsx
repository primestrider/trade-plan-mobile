import { Stack } from "expo-router";
import { Text, View } from "react-native";

import { DemoBox } from "@/features/example/components/DemoBox";
import { ExampleScreen } from "@/features/example/components/ExampleScreen";
import { Section } from "@/features/example/components/Section";
import { ThemeToggle } from "@/shared/components";
import { text, useStyles, useTheme, view, type ThemedUtilities } from "@/styles";

const surfaces = [
  "bgBackground",
  "bgCard",
  "bgSecondary",
  "bgMuted",
  "bgPrimary",
] as const satisfies readonly (keyof ThemedUtilities)[];

export default function ThemeExample() {
  const styles = useStyles();
  const { mode, scheme, isDark, colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: "Theme" }} />
      <ExampleScreen
        title="Theme"
        subtitle="Dark mode with a persisted System / Light / Dark preference"
      >
        <Section
          title="ThemeToggle"
          description="Picks the color scheme. The choice is stored in MMKV and survives a restart."
          utilities={["useTheme()", "useStyles()", "ThemeToggle"]}
        >
          <ThemeToggle />

          <DemoBox label="Resolved state" style={styles.mt3}>
            <View style={view(styles.gap1)}>
              <Text style={text(styles.textSm, styles.textForeground)}>
                mode: <Text style={text(styles.fontMono)}>{mode}</Text>
              </Text>
              <Text style={text(styles.textSm, styles.textForeground)}>
                scheme: <Text style={text(styles.fontMono)}>{scheme}</Text>
              </Text>
              <Text style={text(styles.textSm, styles.textMuted)}>
                {mode === "system"
                  ? "Following the OS setting — change it in system settings and this updates without a restart."
                  : `Pinned to ${mode}, ignoring the OS setting.`}
              </Text>
            </View>
          </DemoBox>
        </Section>

        <Section
          title="Surfaces"
          description="Semantic background utilities, resolved for the active scheme"
          utilities={[...surfaces]}
        >
          <View style={view(styles.gap2)}>
            {surfaces.map((name) => (
              <View
                key={name}
                style={view(
                  styles[name],
                  styles.h12,
                  styles.roundedLg,
                  styles.border,
                  styles.borderBorder,
                  styles.justifyCenter,
                  styles.px3,
                )}
              >
                <Text
                  style={text(
                    styles.textXs,
                    styles.fontMono,
                    name === "bgPrimary"
                      ? styles.textWhite
                      : styles.textForeground,
                  )}
                >
                  {name}
                </Text>
              </View>
            ))}
          </View>
        </Section>

        <Section
          title="Semantic Tokens"
          description={`All 16 tokens as resolved for ${isDark ? "dark" : "light"} mode`}
          utilities={["useTheme().colors"]}
        >
          <DemoBox>
            <View style={view(styles.gap2)}>
              {Object.entries(colors).map(([token, value]) => (
                <View
                  key={token}
                  style={view(
                    styles.flexRow,
                    styles.itemsCenter,
                    styles.justifyBetween,
                    styles.gap3,
                  )}
                >
                  <View style={view(styles.flexRow, styles.itemsCenter, styles.gap2)}>
                    <View
                      style={view(
                        styles.size6,
                        styles.rounded,
                        styles.border,
                        styles.borderBorder,
                        { backgroundColor: value },
                      )}
                    />
                    <Text style={text(styles.textXs, styles.textForeground)}>
                      {token}
                    </Text>
                  </View>
                  <Text
                    style={text(styles.textXs, styles.fontMono, styles.textMuted)}
                  >
                    {value}
                  </Text>
                </View>
              ))}
            </View>
          </DemoBox>
        </Section>
      </ExampleScreen>
    </>
  );
}
