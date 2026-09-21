import { Stack } from "expo-router";
import { View } from "react-native";

import { Section } from "@/features/example/components";
import {
  Accordion,
  AppText,
  Card,
  Divider,
  ListItem,
  Screen,
} from "@/shared/components";
import { useStyles, view } from "@/styles";

export default function LayoutComponents() {
  const styles = useStyles();

  return (
    <>
      <Stack.Screen options={{ title: "Layout & Surfaces" }} />
      <Screen>
        <Section
          title="AppText"
          description="Variant sets size and weight together"
          utilities={["h1", "h2", "title", "body", "label", "caption", "mono"]}
        >
          <View style={view(styles.gap2)}>
            <AppText variant="h1">Heading one</AppText>
            <AppText variant="h2">Heading two</AppText>
            <AppText variant="h3">Heading three</AppText>
            <AppText variant="title">Title</AppText>
            <AppText variant="body">Body copy for reading.</AppText>
            <AppText variant="label">Label</AppText>
            <AppText variant="caption" color="muted">
              Caption, muted
            </AppText>
            <AppText variant="mono" color="primary">
              mono / code
            </AppText>
          </View>
        </Section>

        <Section
          title="Card"
          description="Three variants, all rounded 2xl"
          utilities={["elevated", "outlined", "filled"]}
        >
          <View style={view(styles.gap3)}>
            <Card variant="elevated">
              <Card.Header title="Elevated" subtitle="Raised off the background" />
              <Card.Body>
                <AppText variant="caption" color="muted">
                  Uses a shadow. No overflow clipping, so the Android elevation
                  survives.
                </AppText>
              </Card.Body>
            </Card>

            <Card variant="outlined">
              <Card.Header title="Outlined" subtitle="A hairline border" />
            </Card>

            <Card variant="filled">
              <Card.Header title="Filled" subtitle="Sits on the secondary tone" />
            </Card>
          </View>
        </Section>

        <Section
          title="ListItem"
          description="Settings rows — flush inside an unpadded Card"
          utilities={["left", "right", "showChevron", "destructive"]}
        >
          <Card variant="outlined" padded={false}>
            <ListItem title="Profile" subtitle="Name, photo, bio" showChevron onPress={() => {}} />
            <Divider />
            <ListItem title="Notifications" showChevron onPress={() => {}} />
            <Divider />
            <ListItem
              title="A very long row title that has to truncate rather than shove the trailing slot off screen"
              showChevron
              onPress={() => {}}
            />
            <Divider />
            <ListItem title="Sign out" destructive onPress={() => {}} />
          </Card>
        </Section>

        <Section
          title="Divider"
          description="Hairline rule, optionally inset or labelled"
          utilities={["orientation", "inset", "label"]}
        >
          <View style={view(styles.gap4)}>
            <Divider />
            <Divider inset={32} />
            <Divider label="or" />
            <View style={view(styles.flexRow, styles.itemsCenter, styles.gap3, styles.h10)}>
              <AppText variant="caption">Left</AppText>
              <Divider orientation="vertical" />
              <AppText variant="caption">Right</AppText>
            </View>
          </View>
        </Section>

        <Section
          title="Accordion"
          description="Height animated off the measured content"
          utilities={["items", "defaultOpenKeys", "single"]}
        >
          <Card variant="outlined" padded={false}>
            <Accordion
              single
              defaultOpenKeys={["radius"]}
              items={[
                {
                  key: "radius",
                  title: "What radius does this use?",
                  content: (
                    <AppText variant="caption" color="muted">
                      Surfaces are rounded 2xl (24px). Controls are fully
                      rounded. Checkbox is the one exception at 8px.
                    </AppText>
                  ),
                },
                {
                  key: "theme",
                  title: "Does it follow dark mode?",
                  content: (
                    <AppText variant="caption" color="muted">
                      Every color comes from a semantic token, so both schemes
                      are covered without per-component work.
                    </AppText>
                  ),
                },
              ]}
            />
          </Card>
        </Section>
      </Screen>
    </>
  );
}
