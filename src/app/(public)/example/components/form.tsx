import { Stack } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Section } from "@/features/example/components";
import {
  AppText,
  Button,
  Card,
  Checkbox,
  IconButton,
  Input,
  Radio,
  Screen,
  Select,
  Switch,
  Tabs,
} from "@/shared/components";
import { useStyles, useTheme, view } from "@/styles";
import { radii, spacing } from "@/styles/tokens";

type Plan = "free" | "pro" | "team";

/** A plus sign drawn from two bars — this project ships no icon library. */
function PlusIcon() {
  const { colors } = useTheme();

  const bar = {
    position: "absolute" as const,
    backgroundColor: colors.primaryForeground,
    borderRadius: radii.full,
  };

  return (
    <View style={view({ width: spacing[4], height: spacing[4] })}>
      <View
        style={view(bar, {
          top: spacing[1.5],
          left: 0,
          right: 0,
          height: spacing[0.5],
        })}
      />
      <View
        style={view(bar, {
          left: spacing[1.5],
          top: 0,
          bottom: 0,
          width: spacing[0.5],
        })}
      />
    </View>
  );
}

export default function FormComponents() {
  const styles = useStyles();

  const [tab, setTab] = useState<"overview" | "activity" | "settings">("overview");
  const [underlineTab, setUnderlineTab] = useState<"all" | "unread">("all");
  const [terms, setTerms] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [plan, setPlan] = useState<Plan>("free");
  const [country, setCountry] = useState<string | undefined>();
  const [notify, setNotify] = useState(true);

  return (
    <>
      <Stack.Screen options={{ title: "Form Controls" }} />
      <Screen>
        <Section
          title="Button"
          description="Fully rounded, five variants, three sizes"
          utilities={["primary", "secondary", "outline", "ghost", "destructive"]}
        >
          <View style={view(styles.gap3)}>
            <View style={view(styles.flexRow, styles.flexWrap, styles.gap2)}>
              <Button title="Primary" size="sm" />
              <Button title="Secondary" variant="secondary" size="sm" />
              <Button title="Outline" variant="outline" size="sm" />
              <Button title="Ghost" variant="ghost" size="sm" />
              <Button title="Destructive" variant="destructive" size="sm" />
            </View>
            <Button title="Loading" loading block />
            <Button title="Disabled" disabled block variant="outline" />
          </View>
        </Section>

        <Section
          title="IconButton"
          description="Icon-only, so the accessibility label is required"
          utilities={["primary", "secondary", "ghost", "destructive", "loading"]}
        >
          {/*
            Each label is distinct: an icon-only control is identified to a
            screen reader by its label alone, so repeating one would leave the
            user with several indistinguishable buttons.
          */}
          <View style={view(styles.flexRow, styles.itemsCenter, styles.gap3)}>
            <IconButton icon={<PlusIcon />} accessibilityLabel="Add note" size="sm" />
            <IconButton icon={<PlusIcon />} accessibilityLabel="Add task" />
            <IconButton icon={<PlusIcon />} accessibilityLabel="Add project" size="lg" />
            <IconButton
              icon={<PlusIcon />}
              accessibilityLabel="Add urgent item"
              variant="destructive"
            />
            <IconButton icon={<PlusIcon />} accessibilityLabel="Adding" loading />
          </View>
        </Section>

        <Section
          title="Input"
          description="Rounded 2xl to match the other surfaces"
          utilities={["text", "email", "password", "error", "hint"]}
        >
          <View style={view(styles.gap4)}>
            <Input label="Email" type="email" placeholder="you@example.com" />
            <Input label="Password" type="password" placeholder="••••••••" />
            <Input label="Username" value="taken" error="That name is already used" />
            <Input label="Display name" hint="Shown on your public profile" />
          </View>
        </Section>

        <Section
          title="Select"
          description="Trigger matches Input; options open in a BottomSheet"
          utilities={["options", "value", "placeholder", "hint"]}
        >
          <Select
            label="Country"
            placeholder="Pick one"
            hint="Used to set your default currency"
            value={country}
            onChange={setCountry}
            options={[
              { value: "id", label: "Indonesia", description: "Rupiah (IDR)" },
              { value: "sg", label: "Singapore", description: "Dollar (SGD)" },
              { value: "jp", label: "Japan", description: "Yen (JPY)" },
              { value: "xx", label: "Unavailable", disabled: true },
            ]}
          />
        </Section>

        <Section
          title="Checkbox"
          description="Rounded 8px on purpose — a round one reads as a radio"
          utilities={["checked", "indeterminate", "description", "error"]}
        >
          <Card variant="outlined">
            <View style={view(styles.gap4)}>
              <Checkbox
                checked={terms}
                onChange={setTerms}
                label="Accept terms"
                description="You can withdraw consent at any time."
              />
              <Checkbox
                checked={newsletter}
                onChange={setNewsletter}
                label="Product updates"
              />
              <Checkbox indeterminate label="Partially selected" onChange={() => {}} />
              <Checkbox
                checked={false}
                onChange={() => {}}
                label="Required"
                error="You have to accept this to continue"
              />
              <Checkbox checked disabled label="Disabled" onChange={() => {}} />
            </View>
          </Card>
        </Section>

        <Section
          title="Radio"
          description="One of a set — fully rounded, unlike Checkbox"
          utilities={["Radio.Group", "options", "value", "disabled"]}
        >
          <Card variant="outlined">
            <Radio.Group
              value={plan}
              onChange={setPlan}
              options={[
                { value: "free", label: "Free", description: "1 project" },
                { value: "pro", label: "Pro", description: "Unlimited projects" },
                { value: "team", label: "Team", description: "Coming soon", disabled: true },
              ]}
            />
          </Card>
        </Section>

        <Section
          title="Switch"
          description="Custom-drawn on the platform's own control metrics"
          utilities={["value", "onValueChange", "label", "sm", "md"]}
        >
          <Card variant="outlined">
            <View style={view(styles.gap4)}>
              <Switch
                value={notify}
                onValueChange={setNotify}
                label="Notifications"
                description="Push alerts for new messages"
              />
              <Switch value={false} onValueChange={() => {}} label="Small" size="sm" />
              <Switch value disabled onValueChange={() => {}} label="Disabled" />
            </View>
          </Card>
        </Section>

        <Section
          title="Tabs"
          description="Segmented and underline, both controlled"
          utilities={["segmented", "underline", "value", "onChange"]}
        >
          <View style={view(styles.gap5)}>
            <Tabs
              value={tab}
              onChange={setTab}
              items={[
                { value: "overview", label: "Overview" },
                { value: "activity", label: "Activity" },
                { value: "settings", label: "Settings" },
              ]}
            />
            <AppText variant="caption" color="muted">
              Selected: {tab}
            </AppText>

            <Tabs
              variant="underline"
              value={underlineTab}
              onChange={setUnderlineTab}
              items={[
                { value: "all", label: "All" },
                { value: "unread", label: "Unread" },
              ]}
            />
          </View>
        </Section>
      </Screen>
    </>
  );
}
