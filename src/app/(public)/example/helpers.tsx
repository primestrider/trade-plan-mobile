import { Stack } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { DemoBox } from "@/features/example/components/DemoBox";
import { ExampleScreen } from "@/features/example/components/ExampleScreen";
import { Section } from "@/features/example/components/Section";
import { gridCol, space, text, useStyles, view } from "@/styles";

export default function HelpersExample() {
  const styles = useStyles();
  const [active, setActive] = useState(false);
  const dynamicPadding = 20;

  return (
    <>
      <Stack.Screen options={{ title: "Helpers" }} />
      <ExampleScreen
        title="Helpers"
        subtitle="view(), space(), and gridCol() for dynamic styling"
      >
        <Section
          title="view() — Conditional Styles"
          description="Combine utility classes with conditions, like clsx/cn"
          utilities={[
            "view()",
            "styles.flex1",
            "styles.bgPrimary",
            "styles.opacity75",
          ]}
        >
          <DemoBox>
            <Text
              style={text(
                styles.textSm,
                styles.fontMono,
                styles.textGray600,
                styles.mb3,
              )}
            >
              {`view(styles.p4, styles.roundedLg, active && styles.bgPrimary)`}
            </Text>
            <Pressable
              onPress={() => setActive((prev) => !prev)}
              style={view(
                styles.p4,
                styles.roundedLg,
                styles.border,
                styles.borderBorder,
                active ? styles.bgPrimary : styles.bgGray100,
              )}
            >
              <Text
                style={text(
                  styles.textBase,
                  active ? styles.textWhite : styles.textForeground,
                )}
              >
                {active ? "Active — tap to deactivate" : "Tap to activate"}
              </Text>
            </Pressable>
          </DemoBox>

          <DemoBox label="Pressed state with callback" style={styles.mt3}>
            <Pressable
              style={({ pressed }) =>
                view(
                  styles.bgPrimary,
                  styles.px4,
                  styles.py3,
                  styles.roundedLg,
                  styles.center,
                  pressed && styles.opacity75,
                )
              }
            >
              <Text
                style={text(
                  styles.textBase,
                  styles.fontSemiBold,
                  styles.textWhite,
                )}
              >
                Press Me
              </Text>
            </Pressable>
          </DemoBox>
        </Section>

        <Section
          title="space() — Dynamic Spacing"
          description="Create dynamic padding/margin from numeric values"
          utilities={["space('p', 20)", "space('mx', 8)"]}
        >
          <DemoBox>
            <Text
              style={text(
                styles.textSm,
                styles.fontMono,
                styles.textGray600,
                styles.mb3,
              )}
            >
              {`space('p', ${dynamicPadding})`}
            </Text>
            <View style={view(styles.bgGray100, styles.roundedLg)}>
              <View
                style={view(
                  styles.bgPrimary,
                  styles.rounded,
                  space("p", dynamicPadding),
                )}
              >
                <Text style={text(styles.textSm, styles.textWhite)}>
                  Dynamic padding: {dynamicPadding}px
                </Text>
              </View>
            </View>
          </DemoBox>

          <DemoBox label="space('mx', 8)" style={styles.mt3}>
            <View style={view(styles.bgGray100, styles.roundedLg, styles.p4)}>
              <View
                style={view(
                  styles.bgPrimary100,
                  styles.rounded,
                  space("mx", 8),
                  styles.py3,
                )}
              >
                <Text
                  style={text(
                    styles.textSm,
                    styles.textPrimary500,
                    styles.textCenter,
                  )}
                >
                  Horizontal margin 8px
                </Text>
              </View>
            </View>
          </DemoBox>
        </Section>

        <Section
          title="gridCol() — Dynamic Grid Columns"
          description="Calculate column width based on column count"
          utilities={["gridCol(2)", "gridCol(3)", "gridCol(4)"]}
        >
          {[2, 3, 4].map((cols) => (
            <DemoBox key={cols} label={`gridCol(${cols})`} style={styles.mb3}>
              <View style={view(styles.flexRow, styles.flexWrap, styles.gap2)}>
                {Array.from({ length: cols * 2 }, (_, i) => (
                  <View
                    key={i}
                    style={view(
                      gridCol(cols as 2 | 3 | 4),
                      styles.bgPrimary50,
                      styles.p2,
                      styles.rounded,
                      styles.center,
                      styles.border,
                      styles.borderPrimary,
                    )}
                  >
                    <Text style={text(styles.textXs, styles.textPrimary500)}>
                      {i + 1}
                    </Text>
                  </View>
                ))}
              </View>
            </DemoBox>
          ))}
        </Section>

        <Section
          title="Full Combination"
          description="view + styles + space + gridCol in one component"
          utilities={["view()", "styles.*", "space()", "gridCol()"]}
        >
          <View
            style={view(
              styles.bgCard,
              styles.roundedXl,
              styles.border,
              styles.borderBorder,
              styles.shadow,
              space("p", 16),
            )}
          >
            <Text
              style={text(
                styles.textLg,
                styles.fontBold,
                styles.textForeground,
                styles.mb4,
              )}
            >
              Dashboard Preview
            </Text>
            <View style={view(styles.flexRow, styles.flexWrap, styles.gap3)}>
              {[
                { label: "Users", value: "1.2k", color: styles.bgPrimary },
                { label: "Orders", value: "348", color: styles.bgSuccess },
                { label: "Revenue", value: "$12k", color: styles.bgWarning },
              ].map((stat) => (
                <View
                  key={stat.label}
                  style={view(
                    gridCol(3),
                    stat.color,
                    styles.roundedLg,
                    styles.p3,
                  )}
                >
                  <Text
                    style={text(
                      styles.textXs,
                      styles.textWhite,
                      styles.opacity75,
                    )}
                  >
                    {stat.label}
                  </Text>
                  <Text
                    style={text(
                      styles.textXl,
                      styles.fontBold,
                      styles.textWhite,
                    )}
                  >
                    {stat.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Section>
      </ExampleScreen>
    </>
  );
}
