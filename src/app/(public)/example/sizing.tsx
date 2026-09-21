import { Stack } from "expo-router";
import { Text, View } from "react-native";

import { DemoBox } from "@/features/example/components/DemoBox";
import { ExampleScreen } from "@/features/example/components/ExampleScreen";
import { Section } from "@/features/example/components/Section";
import { styles as staticStyles, text, useStyles, view } from "@/styles";

const widths = [
  { name: "wFull", style: staticStyles.wFull },
  { name: "wHalf", style: staticStyles.wHalf },
  { name: "wThird", style: staticStyles.wThird },
  { name: "wQuarter", style: staticStyles.wQuarter },
] as const;

const fixedSizes = [
  { name: "w12", style: staticStyles.w12 },
  { name: "w16", style: staticStyles.w16 },
  { name: "h12", style: staticStyles.h12 },
  { name: "size16", style: staticStyles.size16 },
  { name: "size24", style: staticStyles.size24 },
] as const;

export default function SizingExample() {
  const styles = useStyles();

  return (
    <>
      <Stack.Screen options={{ title: "Sizing" }} />
      <ExampleScreen
        title="Sizing"
        subtitle="Width, height, min/max, and aspect ratio"
      >
        <Section
          title="Percentage Width"
          utilities={widths.map((item) => item.name)}
        >
          <DemoBox>
            {widths.map((item) => (
              <View key={item.name} style={view(styles.mb2)}>
                <Text
                  style={text(
                    styles.textXs,
                    styles.fontMono,
                    styles.textGray500,
                    styles.mb1,
                  )}
                >
                  {item.name}
                </Text>
                <View
                  style={view(
                    item.style,
                    styles.h8,
                    styles.bgPrimary,
                    styles.rounded,
                  )}
                />
              </View>
            ))}
          </DemoBox>
        </Section>

        <Section
          title="Fixed Size (Token Spacing)"
          utilities={fixedSizes.map((item) => item.name)}
        >
          <View style={view(styles.flexRow, styles.flexWrap, styles.gap3)}>
            {fixedSizes.map((item) => (
              <View key={item.name} style={view(styles.itemsCenter)}>
                <View
                  style={view(item.style, styles.bgPrimary, styles.rounded)}
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
          title="Height Utilities"
          utilities={["hFull", "hHalf", "hScreen"]}
        >
          <DemoBox label="h12 vs h16 vs h24">
            <View style={view(styles.flexRow, styles.gap2, styles.itemsEnd)}>
              <View
                style={view(
                  styles.w12,
                  styles.h12,
                  styles.bgPrimary,
                  styles.rounded,
                  styles.center,
                )}
              >
                <Text style={text(styles.textXs, styles.textWhite)}>h12</Text>
              </View>
              <View
                style={view(
                  styles.w12,
                  styles.h16,
                  styles.bgPrimary500,
                  styles.rounded,
                  styles.center,
                )}
              >
                <Text style={text(styles.textXs, styles.textWhite)}>h16</Text>
              </View>
              <View
                style={view(
                  styles.w12,
                  styles.h24,
                  styles.bgPrimary600,
                  styles.rounded,
                  styles.center,
                )}
              >
                <Text style={text(styles.textXs, styles.textWhite)}>h24</Text>
              </View>
            </View>
          </DemoBox>
        </Section>

        <Section
          title="Aspect Ratio"
          utilities={["aspectSquare", "aspectVideo"]}
        >
          <View style={view(styles.flexRow, styles.gap3)}>
            <View style={view(styles.flex1)}>
              <Text
                style={text(
                  styles.textXs,
                  styles.fontMono,
                  styles.textGray500,
                  styles.mb1,
                )}
              >
                aspectSquare
              </Text>
              <View
                style={view(
                  styles.aspectSquare,
                  styles.bgPrimary100,
                  styles.roundedLg,
                  styles.center,
                )}
              >
                <Text style={text(styles.textSm, styles.textPrimary500)}>
                  1:1
                </Text>
              </View>
            </View>
            <View style={view(styles.flex1)}>
              <Text
                style={text(
                  styles.textXs,
                  styles.fontMono,
                  styles.textGray500,
                  styles.mb1,
                )}
              >
                aspectVideo
              </Text>
              <View
                style={view(
                  styles.aspectVideo,
                  styles.bgGray200,
                  styles.roundedLg,
                  styles.center,
                )}
              >
                <Text style={text(styles.textSm, styles.textGray600)}>
                  16:9
                </Text>
              </View>
            </View>
          </View>
        </Section>

        <Section
          title="Min / Max"
          utilities={["minW0", "minWFull", "maxWFull", "minH0"]}
        >
          <DemoBox label="maxWFull dalam container sempit">
            <View
              style={view(
                styles.w32,
                styles.bgGray100,
                styles.p2,
                styles.rounded,
              )}
            >
              <View
                style={view(
                  styles.maxWFull,
                  styles.bgPrimary,
                  styles.p2,
                  styles.rounded,
                )}
              >
                <Text style={text(styles.textXs, styles.textWhite)}>
                  maxWFull
                </Text>
              </View>
            </View>
          </DemoBox>
        </Section>
      </ExampleScreen>
    </>
  );
}
