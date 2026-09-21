import { Stack } from "expo-router";
import { Text, View } from "react-native";

import { DemoBox } from "@/features/example/components/DemoBox";
import { ExampleScreen } from "@/features/example/components/ExampleScreen";
import { Section } from "@/features/example/components/Section";
import { styles as staticStyles, text, useStyles, view } from "@/styles";

const borderRadii = [
  { name: "roundedNone", style: staticStyles.roundedNone },
  { name: "roundedSm", style: staticStyles.roundedSm },
  { name: "rounded", style: staticStyles.rounded },
  { name: "roundedLg", style: staticStyles.roundedLg },
  { name: "roundedXl", style: staticStyles.roundedXl },
  { name: "rounded2xl", style: staticStyles.rounded2xl },
  { name: "roundedFull", style: staticStyles.roundedFull },
] as const;

const shadows = [
  { name: "shadowSm", style: staticStyles.shadowSm },
  { name: "shadow", style: staticStyles.shadow },
  { name: "shadowMd", style: staticStyles.shadowMd },
  { name: "shadowLg", style: staticStyles.shadowLg },
] as const;

const opacities = [
  { name: "opacity25", style: staticStyles.opacity25 },
  { name: "opacity50", style: staticStyles.opacity50 },
  { name: "opacity75", style: staticStyles.opacity75 },
  { name: "opacity100", style: staticStyles.opacity100 },
] as const;

export default function AppearanceExample() {
  const styles = useStyles();

  return (
    <>
      <Stack.Screen options={{ title: "Appearance" }} />
      <ExampleScreen
        title="Appearance"
        subtitle="Border, radius, shadow, and opacity"
      >
        <Section
          title="Border Width & Color"
          utilities={[
            "border",
            "border2",
            "borderT",
            "borderPrimary",
            "borderGray200",
          ]}
        >
          <View style={view(styles.flexRow, styles.flexWrap, styles.gap3)}>
            <View
              style={view(
                styles.w20,
                styles.h20,
                styles.border,
                styles.borderBorder,
                styles.rounded,
                styles.center,
              )}
            >
              <Text style={text(styles.textXs, styles.fontMono)}>border</Text>
            </View>
            <View
              style={view(
                styles.w20,
                styles.h20,
                styles.border2,
                styles.borderPrimary,
                styles.rounded,
                styles.center,
              )}
            >
              <Text
                style={text(styles.textXs, styles.fontMono, styles.textPrimary)}
              >
                border2
              </Text>
            </View>
            <View
              style={view(
                styles.w20,
                styles.h20,
                styles.borderT,
                styles.borderGray300,
                styles.bgGray50,
                styles.rounded,
              )}
            >
              <Text
                style={text(
                  styles.textXs,
                  styles.fontMono,
                  styles.textCenter,
                  styles.mt6,
                )}
              >
                borderT
              </Text>
            </View>
          </View>
        </Section>

        <Section
          title="Border Radius"
          utilities={borderRadii.map((item) => item.name)}
        >
          <View style={view(styles.flexRow, styles.flexWrap, styles.gap3)}>
            {borderRadii.map((item) => (
              <View key={item.name} style={view(styles.itemsCenter)}>
                <View
                  style={view(
                    styles.w16,
                    styles.h16,
                    styles.bgPrimary,
                    item.style,
                  )}
                />
                <Text
                  style={text(
                    styles.textXs,
                    styles.fontMono,
                    styles.textGray500,
                    styles.mt1,
                  )}
                >
                  {item.name}
                </Text>
              </View>
            ))}
          </View>
        </Section>

        <Section
          title="Corner Radius"
          utilities={["roundedT", "roundedB", "roundedL", "roundedR"]}
        >
          <View style={view(styles.flexRow, styles.gap3)}>
            {(
              [
                { name: "roundedT", style: styles.roundedT },
                { name: "roundedB", style: styles.roundedB },
                { name: "roundedL", style: styles.roundedL },
                { name: "roundedR", style: styles.roundedR },
              ] as const
            ).map((item) => (
              <View
                key={item.name}
                style={view(styles.flex1, styles.itemsCenter)}
              >
                <View
                  style={view(
                    styles.w16,
                    styles.h16,
                    styles.bgPrimary100,
                    item.style,
                    styles.border,
                    styles.borderPrimary,
                  )}
                />
                <Text
                  style={text(
                    styles.textXs,
                    styles.fontMono,
                    styles.textGray500,
                    styles.mt1,
                  )}
                >
                  {item.name}
                </Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Shadow" utilities={shadows.map((item) => item.name)}>
          <View
            style={view(
              styles.flexRow,
              styles.flexWrap,
              styles.gap4,
              styles.p2,
            )}
          >
            {shadows.map((item) => (
              <View key={item.name} style={view(styles.itemsCenter)}>
                <View
                  style={view(
                    styles.w24,
                    styles.h16,
                    styles.bgCard,
                    item.style,
                    styles.roundedLg,
                    styles.center,
                  )}
                >
                  <Text
                    style={text(
                      styles.textXs,
                      styles.fontMono,
                      styles.textGray600,
                    )}
                  >
                    {item.name}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Opacity" utilities={opacities.map((item) => item.name)}>
          <DemoBox>
            <View style={view(styles.flexRow, styles.gap2)}>
              {opacities.map((item) => (
                <View
                  key={item.name}
                  style={view(
                    styles.flex1,
                    styles.h12,
                    styles.bgPrimary,
                    item.style,
                    styles.rounded,
                    styles.center,
                  )}
                >
                  <Text
                    style={text(
                      styles.textXs,
                      styles.textWhite,
                      styles.fontMono,
                    )}
                  >
                    {item.name}
                  </Text>
                </View>
              ))}
            </View>
          </DemoBox>
        </Section>

        <Section
          title="Card Combination"
          utilities={["bgCard", "roundedXl", "border", "shadowMd", "p5"]}
        >
          <View
            style={view(
              styles.bgCard,
              styles.roundedXl,
              styles.border,
              styles.borderBorder,
              styles.shadowMd,
              styles.p5,
            )}
          >
            <Text
              style={text(
                styles.textLg,
                styles.fontSemiBold,
                styles.textForeground,
                styles.mb1,
              )}
            >
              Card Component
            </Text>
            <Text style={text(styles.textSm, styles.textMuted)}>
              Example of combining appearance utilities to create a card.
            </Text>
          </View>
        </Section>
      </ExampleScreen>
    </>
  );
}
