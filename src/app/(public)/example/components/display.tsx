import { Stack } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Section } from "@/features/example/components";
import {
  AppText,
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  ProgressBar,
  Screen,
  Skeleton,
  Spinner,
} from "@/shared/components";
import { useStyles, view } from "@/styles";

const FILTERS = ["All", "Active", "Archived"] as const;

export default function DisplayComponents() {
  const styles = useStyles();
  const [selected, setSelected] = useState<string>("All");
  const [progress, setProgress] = useState(0.4);

  return (
    <>
      <Stack.Screen options={{ title: "Data Display" }} />
      <Screen>
        <Section
          title="Badge"
          description="Static status labels, fully rounded"
          utilities={["default", "primary", "success", "warning", "destructive", "info", "outline"]}
        >
          <View style={view(styles.flexRow, styles.flexWrap, styles.gap2)}>
            <Badge label="Default" />
            <Badge label="Primary" variant="primary" />
            <Badge label="Success" variant="success" />
            <Badge label="Warning" variant="warning" />
            <Badge label="Destructive" variant="destructive" />
            <Badge label="Info" variant="info" />
            <Badge label="Outline" variant="outline" />
            <Badge label="Small" size="sm" variant="primary" />
          </View>
        </Section>

        <Section
          title="Chip"
          description="The interactive sibling of Badge"
          utilities={["selected", "onRemove", "disabled"]}
        >
          <View style={view(styles.gap3)}>
            <View style={view(styles.flexRow, styles.flexWrap, styles.gap2)}>
              {FILTERS.map((filter) => (
                <Chip
                  key={filter}
                  label={filter}
                  selected={selected === filter}
                  onPress={() => setSelected(filter)}
                />
              ))}
            </View>
            <View style={view(styles.flexRow, styles.flexWrap, styles.gap2)}>
              <Chip label="Removable" onRemove={() => {}} />
              <Chip label="Disabled" disabled />
            </View>
          </View>
        </Section>

        <Section
          title="Avatar"
          description="Initials fallback, status dot, overlapping groups"
          utilities={["xs", "sm", "md", "lg", "xl", "status", "Avatar.Group"]}
        >
          <View style={view(styles.gap4)}>
            <View style={view(styles.flexRow, styles.itemsCenter, styles.gap3)}>
              <Avatar name="Ada Lovelace" size="xs" />
              <Avatar name="Ada Lovelace" size="sm" />
              <Avatar name="Ada Lovelace" size="md" />
              <Avatar name="Grace Hopper" size="lg" shape="rounded" />
              <Avatar name="Alan Turing" size="xl" status="online" />
            </View>
            <Avatar.Group max={3}>
              <Avatar name="Ada Lovelace" />
              <Avatar name="Grace Hopper" />
              <Avatar name="Alan Turing" />
              <Avatar name="Edsger Dijkstra" />
              <Avatar name="Barbara Liskov" />
            </Avatar.Group>
          </View>
        </Section>

        <Section
          title="ProgressBar"
          description="Clamped 0..1, or indeterminate"
          utilities={["value", "variant", "indeterminate", "label"]}
        >
          <View style={view(styles.gap4)}>
            <ProgressBar value={progress} label="Uploading" />
            <ProgressBar value={0.8} variant="success" size="sm" />
            <ProgressBar indeterminate label="Syncing" />
            <View style={view(styles.flexRow, styles.gap2)}>
              <Button
                title="−10%"
                variant="outline"
                size="sm"
                onPress={() => setProgress((current) => current - 0.1)}
              />
              <Button
                title="+10%"
                variant="outline"
                size="sm"
                onPress={() => setProgress((current) => current + 0.1)}
              />
            </View>
            <AppText variant="caption" color="muted">
              Values past either end are clamped, so the bar never breaks.
            </AppText>
          </View>
        </Section>

        <Section
          title="Skeleton"
          description="Pulsing placeholders while content loads"
          utilities={["width", "height", "circle", "Skeleton.Text"]}
        >
          <Card variant="outlined">
            <View style={view(styles.flexRow, styles.gap3, styles.mb4)}>
              <Skeleton circle height={48} />
              <View style={view(styles.flex1, styles.gap2)}>
                <Skeleton width="60%" height={14} />
                <Skeleton width="40%" height={12} />
              </View>
            </View>
            <Skeleton.Text lines={3} />
          </Card>
        </Section>

        <Section
          title="Spinner"
          description="Sizes, a label, or an overlay over its parent"
          utilities={["sm", "md", "lg", "label", "overlay"]}
        >
          <View style={view(styles.flexRow, styles.itemsCenter, styles.gap6)}>
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" label="Loading" />
          </View>
        </Section>

        <Section
          title="EmptyState"
          description="What a list shows when it has nothing"
          utilities={["icon", "title", "description", "action"]}
        >
          <Card variant="outlined">
            <EmptyState
              title="No messages yet"
              description="When someone writes to you, their message lands here."
              action={<Button title="Refresh" variant="outline" size="sm" />}
            />
          </Card>
        </Section>
      </Screen>
    </>
  );
}
