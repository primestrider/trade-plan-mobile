import { Stack } from "expo-router";
import { Text } from "react-native";

import { DemoBox } from "@/features/example/components/DemoBox";
import { ExampleScreen } from "@/features/example/components/ExampleScreen";
import { Section } from "@/features/example/components/Section";
import { styles as staticStyles, text, useStyles } from "@/styles";

const fontSizes = [
  { name: "textXs", style: staticStyles.textXs },
  { name: "textSm", style: staticStyles.textSm },
  { name: "textBase", style: staticStyles.textBase },
  { name: "textLg", style: staticStyles.textLg },
  { name: "textXl", style: staticStyles.textXl },
  { name: "text2xl", style: staticStyles.text2xl },
  { name: "text3xl", style: staticStyles.text3xl },
] as const;

const fontWeights = [
  { name: "fontNormal", style: staticStyles.fontNormal },
  { name: "fontMedium", style: staticStyles.fontMedium },
  { name: "fontSemiBold", style: staticStyles.fontSemiBold },
  { name: "fontBold", style: staticStyles.fontBold },
] as const;

const textAligns = [
  { name: "textLeft", style: staticStyles.textLeft },
  { name: "textCenter", style: staticStyles.textCenter },
  { name: "textRight", style: staticStyles.textRight },
] as const;

const letterSpacings = [
  { name: "trackingTight", style: staticStyles.trackingTight },
  { name: "trackingNormal", style: staticStyles.trackingNormal },
  { name: "trackingWide", style: staticStyles.trackingWide },
  { name: "trackingWidest", style: staticStyles.trackingWidest },
] as const;

export default function TypographyExample() {
  const styles = useStyles();

  return (
    <>
      <Stack.Screen options={{ title: "Typography" }} />
      <ExampleScreen
        title="Typography"
        subtitle="Font size, weight, alignment, and decoration"
      >
        <Section title="Font Family" utilities={["fontSans", "fontMono"]}>
          <DemoBox>
            <Text
              style={text(
                styles.textLg,
                styles.textForeground,
                styles.mb2,
              )}
            >
              fontSans — Plus Jakarta Sans
            </Text>
            <Text
              style={text(
                styles.textLg,
                styles.fontMono,
                styles.textForeground,
              )}
            >
              fontMono — monospace 0123456789
            </Text>
          </DemoBox>
        </Section>

        <Section
          title="Font Size"
          utilities={fontSizes.map((item) => item.name)}
        >
          <DemoBox>
            {fontSizes.map((item) => (
              <Text
                key={item.name}
                style={text(
                  item.style,
                  styles.textForeground,
                  styles.mb1,
                )}
              >
                {item.name} — Typography scale
              </Text>
            ))}
          </DemoBox>
        </Section>

        <Section
          title="Font Weight"
          utilities={fontWeights.map((item) => item.name)}
        >
          <DemoBox>
            {fontWeights.map((item) => (
              <Text
                key={item.name}
                style={text(
                  styles.textBase,
                  item.style,
                  styles.textForeground,
                  styles.mb1,
                )}
              >
                {item.name} — Weight preview
              </Text>
            ))}
          </DemoBox>
        </Section>

        <Section
          title="Text Alignment"
          utilities={textAligns.map((item) => item.name)}
        >
          {textAligns.map((item) => (
            <DemoBox key={item.name} style={styles.mb2}>
              <Text
                style={text(
                  styles.textSm,
                  styles.textGray500,
                  styles.mb1,
                  styles.fontMono,
                )}
              >
                {item.name}
              </Text>
              <Text
                style={text(styles.textBase, item.style, styles.textForeground)}
              >
                Lorem ipsum dolor sit amet
              </Text>
            </DemoBox>
          ))}
        </Section>

        <Section
          title="Letter Spacing"
          utilities={letterSpacings.map((item) => item.name)}
        >
          <DemoBox>
            {letterSpacings.map((item) => (
              <Text
                key={item.name}
                style={text(
                  styles.textBase,
                  item.style,
                  styles.textForeground,
                  styles.mb2,
                )}
              >
                {item.name} — SPACED TEXT
              </Text>
            ))}
          </DemoBox>
        </Section>

        <Section
          title="Text Decoration & Transform"
          utilities={["underline", "lineThrough", "uppercase", "capitalize"]}
        >
          <DemoBox>
            <Text
              style={text(
                styles.textBase,
                styles.underline,
                styles.textPrimary,
                styles.mb2,
              )}
            >
              underline — Underlined text
            </Text>
            <Text
              style={text(
                styles.textBase,
                styles.lineThrough,
                styles.textMuted,
                styles.mb2,
              )}
            >
              lineThrough — Strikethrough text
            </Text>
            <Text
              style={text(
                styles.textBase,
                styles.uppercase,
                styles.textForeground,
                styles.mb2,
              )}
            >
              uppercase — transformed text
            </Text>
            <Text
              style={text(
                styles.textBase,
                styles.capitalize,
                styles.textForeground,
              )}
            >
              capitalize — hello world example
            </Text>
          </DemoBox>
        </Section>
      </ExampleScreen>
    </>
  );
}
