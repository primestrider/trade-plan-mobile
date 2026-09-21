import { type ReactNode } from "react";
import { Pressable, View, type PressableProps } from "react-native";

import { useStyles, useTheme, view } from "@/styles";
import { spacing } from "@/styles/tokens";

import { AppText } from "./AppText";

export type ListItemProps = PressableProps & {
  title: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
  showChevron?: boolean;
  destructive?: boolean;
};

/** Stable hook for tests and for consumers that need to reach the chevron. */
export const LIST_ITEM_CHEVRON_TEST_ID = "list-item-chevron";

/**
 * Settings/menu row: optional leading slot, title and subtitle, trailing slot.
 *
 * Carries no radius of its own — a `ListItem` lives inside a `Card`, and the
 * Card owns the corners. It does carry its own horizontal gutter, so it still
 * reads correctly inside `<Card padded={false}>`.
 *
 * Without `onPress` the row is inert: no button role, no press feedback. A
 * row that looks tappable but is not is worse than a plain one.
 *
 * @example
 * <ListItem title="Notifications" subtitle="Push, email" showChevron onPress={open} />
 * <ListItem title="Delete account" destructive onPress={confirm} />
 */
export function ListItem({
  title,
  subtitle,
  left,
  right,
  showChevron = false,
  destructive = false,
  onPress,
  disabled = false,
  style,
  ...rest
}: Readonly<ListItemProps>) {
  const styles = useStyles();
  const { colors } = useTheme();

  const pressable = Boolean(onPress);

  return (
    <Pressable
      accessibilityRole={pressable ? "button" : undefined}
      onPress={onPress}
      disabled={disabled}
      style={(state) => [
        view(
          styles.flexRow,
          styles.itemsCenter,
          styles.gap3,
          styles.px4,
          styles.py3,
          // 56px is the platform minimum for a comfortable two-line row.
          { minHeight: spacing[14] },
          disabled && styles.opacity50,
          // Native list rows tint on touch rather than dimming.
          pressable && state.pressed && { backgroundColor: colors.secondary },
        ),
        typeof style === "function" ? style(state) : style,
      ]}
      {...rest}
    >
      {left ? <View style={view(styles.flexShrink0)}>{left}</View> : null}

      {/* `minW0` is what actually lets the title truncate: without it the
          column reports its full intrinsic width and pushes `right` away. */}
      <View style={view(styles.flex1, styles.minW0)}>
        <AppText
          variant="body"
          color={destructive ? "destructive" : "foreground"}
          numberOfLines={1}
        >
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color="muted" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>

      {right ? <View style={view(styles.flexShrink0)}>{right}</View> : null}

      {showChevron ? (
        // No icon library in this project: two borders on a square, rotated,
        // draw the same disclosure indicator native lists use.
        <View
          testID={LIST_ITEM_CHEVRON_TEST_ID}
          style={view(styles.size2, {
            borderTopWidth: 1.5,
            borderRightWidth: 1.5,
            borderColor: colors.mutedForeground,
            transform: [{ rotate: "45deg" }],
          })}
        />
      ) : null}
    </Pressable>
  );
}
