import { Stack } from "expo-router";
import { Text, View } from "react-native";

import { DemoBox } from "@/features/example/components/DemoBox";
import { ExampleScreen } from "@/features/example/components/ExampleScreen";
import { Section } from "@/features/example/components/Section";
import { palette, text, useStyles, view, type ThemedUtilities } from "@/styles";

const semanticBgs = [
  "bgBackground",
  "bgPrimary",
  "bgSecondary",
  "bgCard",
  "bgDestructive",
  "bgMuted",
] as const satisfies readonly (keyof ThemedUtilities)[];

const paletteBgs = [
  "bgPrimary50",
  "bgPrimary100",
  "bgPrimary500",
  "bgGray50",
  "bgGray200",
  "bgGray800",
] as const satisfies readonly (keyof ThemedUtilities)[];

const statusBgs = [
  "bgSuccess",
  "bgWarning",
  "bgError",
  "bgInfo",
] as const satisfies readonly (keyof ThemedUtilities)[];

const textColors = [
  "textForeground",
  "textPrimary",
  "textMuted",
  "textDestructive",
  "textSuccess",
  "textWarning",
  "textError",
] as const satisfies readonly (keyof ThemedUtilities)[];

export default function ColorsExample() {
  const styles = useStyles();

  return (
    <>
      <Stack.Screen options={{ title: "Colors" }} />
      <ExampleScreen
        title="Colors"
        subtitle="Semantic colors, palette, and text color utilities"
      >
        <Section
          title="Semantic Background"
          description="Colors with contextual meaning (background, primary, destructive, etc.)"
          utilities={[...semanticBgs]}
        >
          <View style={view(styles.flexRow, styles.flexWrap, styles.gap2)}>
            {semanticBgs.map((name) => (
              <View
                key={name}
                style={view(
                  styles.w24,
                  styles.h16,
                  styles.roundedLg,
                  styles[name],
                  styles.center,
                )}
              >
                <Text
                  style={text(styles.textXs, styles.fontMono, styles.textWhite)}
                >
                  {name}
                </Text>
              </View>
            ))}
          </View>
        </Section>

        <Section
          title="Palette Background"
          description="Color scale from design tokens"
          utilities={[...paletteBgs]}
        >
          <View style={view(styles.flexRow, styles.flexWrap, styles.gap2)}>
            {paletteBgs.map((name) => (
              <View
                key={name}
                style={view(
                  styles.w24,
                  styles.h16,
                  styles.roundedLg,
                  styles[name],
                  styles.center,
                )}
              >
                <Text
                  style={text(
                    styles.textXs,
                    styles.fontMono,
                    styles.textGray700,
                  )}
                >
                  {name}
                </Text>
              </View>
            ))}
          </View>
        </Section>

        <Section
          title="Status Background"
          utilities={[...statusBgs]}
        >
          <View style={view(styles.flexRow, styles.flexWrap, styles.gap2)}>
            {statusBgs.map((name) => (
              <View
                key={name}
                style={view(
                  styles.flex1,
                  styles.h12,
                  styles.roundedLg,
                  styles[name],
                  styles.center,
                )}
              >
                <Text
                  style={text(
                    styles.textXs,
                    styles.fontMedium,
                    styles.textWhite,
                  )}
                >
                  {name}
                </Text>
              </View>
            ))}
          </View>
        </Section>

        <Section
          title="Text Colors"
          utilities={[...textColors]}
        >
          <DemoBox>
            {textColors.map((name) => (
              <Text
                key={name}
                style={text(styles.textBase, styles.mb1, styles[name])}
              >
                {name} — The quick brown fox
              </Text>
            ))}
          </DemoBox>
        </Section>

        <Section
          title="Primary Scale (Token)"
          description="Direct palette access via token import"
          utilities={["palette.primary[500]"]}
        >
          <View style={view(styles.flexRow, styles.gap1)}>
            {Object.entries(palette.primary).map(([shade, color]) => (
              <View
                key={shade}
                style={view(styles.flex1, styles.h12, styles.rounded, {
                  backgroundColor: color,
                })}
              />
            ))}
          </View>
          <Text
            style={text(
              styles.textXs,
              styles.textMuted,
              styles.mt2,
              styles.textCenter,
            )}
          >
            primary 50 → 900
          </Text>
        </Section>
      </ExampleScreen>
    </>
  );
}
