import { Stack } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Section } from "@/features/example/components";
import {
  Alert,
  AppText,
  BottomSheet,
  Button,
  Dialog,
  Divider,
  ListItem,
  Screen,
  useToast,
} from "@/shared/components";
import { useStyles, view } from "@/styles";

const SORTS = ["Newest first", "Oldest first", "A–Z"] as const;

export default function OverlayComponents() {
  const styles = useStyles();
  const toast = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [blockingOpen, setBlockingOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sort, setSort] = useState<string>(SORTS[0]);

  return (
    <>
      <Stack.Screen options={{ title: "Overlays & Feedback" }} />
      <Screen>
        <Section
          title="Dialog"
          description="A decision that blocks the flow until answered"
          utilities={["visible", "onClose", "dismissable"]}
        >
          <View style={view(styles.gap2)}>
            <Button title="Open dialog" onPress={() => setDialogOpen(true)} />
            <Button
              title="Open blocking dialog"
              variant="outline"
              onPress={() => setBlockingOpen(true)}
            />
            <AppText variant="caption" color="muted">
              A blocking dialog has an inert scrim — no dead tap target implying
              it can be dismissed.
            </AppText>
          </View>
        </Section>

        <Section
          title="BottomSheet"
          description="Drag the handle down to dismiss"
          utilities={["visible", "onClose", "title"]}
        >
          <View style={view(styles.gap2)}>
            <Button title={`Sort: ${sort}`} variant="outline" onPress={() => setSheetOpen(true)} />
          </View>
        </Section>

        <Section
          title="Toast"
          description="Transient feedback, raised from anywhere via useToast()"
          utilities={["success", "error", "warning", "info"]}
        >
          <View style={view(styles.flexRow, styles.flexWrap, styles.gap2)}>
            <Button
              title="Success"
              size="sm"
              onPress={() => toast.success("Saved", "Your changes are live.")}
            />
            <Button
              title="Error"
              size="sm"
              variant="destructive"
              onPress={() => toast.error("Upload failed", "Check your connection.")}
            />
            <Button
              title="Warning"
              size="sm"
              variant="outline"
              onPress={() => toast.warning("Almost full", "92% of your quota is used.")}
            />
            <Button
              title="Info"
              size="sm"
              variant="ghost"
              onPress={() => toast.info("New version available")}
            />
          </View>
        </Section>

        <Section
          title="Alert"
          description="Inline banner tied to the content, not to a moment"
          utilities={["info", "success", "warning", "error", "onClose"]}
        >
          <View style={view(styles.gap3)}>
            <Alert variant="info" title="Heads up" description="This is informational." />
            <Alert variant="success" title="Saved" description="Everything went through." />
            <Alert variant="warning" title="Running low" description="Only 3 seats left." />
            <Alert
              variant="error"
              title="Could not save"
              description="The server rejected the request."
              onClose={() => {}}
            />
          </View>
        </Section>
      </Screen>

      <Dialog visible={dialogOpen} onClose={() => setDialogOpen(false)}>
        <Dialog.Title>Delete item?</Dialog.Title>
        <Dialog.Body>
          This cannot be undone. The item will be removed for everyone.
        </Dialog.Body>
        <Dialog.Actions>
          <Button title="Cancel" variant="ghost" onPress={() => setDialogOpen(false)} />
          <Button
            title="Delete"
            variant="destructive"
            onPress={() => {
              setDialogOpen(false);
              toast.success("Deleted");
            }}
          />
        </Dialog.Actions>
      </Dialog>

      <Dialog
        visible={blockingOpen}
        dismissable={false}
        onClose={() => setBlockingOpen(false)}
      >
        <Dialog.Title>Accept the terms</Dialog.Title>
        <Dialog.Body>You have to answer this one to continue.</Dialog.Body>
        <Dialog.Actions>
          <Button title="Accept" onPress={() => setBlockingOpen(false)} />
        </Dialog.Actions>
      </Dialog>

      <BottomSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Sort by"
        padded={false}
      >
        {SORTS.map((option, index) => (
          <View key={option}>
            {index > 0 ? <Divider /> : null}
            <ListItem
              title={option}
              onPress={() => {
                setSort(option);
                setSheetOpen(false);
              }}
            />
          </View>
        ))}
      </BottomSheet>
    </>
  );
}
