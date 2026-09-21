import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";

import { useStyles, view } from "@/styles";

import { AppText } from "./AppText";

export type EmptyStateProps = ViewProps & {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

/**
 * Placeholder for a list or screen with nothing to show.
 *
 * The description is capped at a fixed measure rather than the container
 * width, because a sentence running the full width of a tablet is harder to
 * read than the same sentence wrapped over three lines.
 *
 * @example
 * <EmptyState title="No messages yet" />
 *
 * @example
 * <EmptyState
 *   icon={<Icon name="inbox" />}
 *   title="No messages yet"
 *   description="Conversations you start will show up here."
 *   action={<Button title="Start a chat" />}
 * />
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  style,
  ...rest
}: Readonly<EmptyStateProps>) {
  const styles = useStyles();

  return (
    <View
      style={[
        view(
          styles.center,
          styles.rounded2xl,
          styles.px6,
          styles.py12,
          styles.gap3,
        ),
        style,
      ]}
      {...rest}
    >
      {icon ? <View style={view(styles.center)}>{icon}</View> : null}

      <AppText variant="title" align="center">
        {title}
      </AppText>

      {description ? (
        <AppText
          variant="body"
          color="muted"
          align="center"
          style={styles.maxW80}
        >
          {description}
        </AppText>
      ) : null}

      {action ? <View style={view(styles.mt2)}>{action}</View> : null}
    </View>
  );
}
