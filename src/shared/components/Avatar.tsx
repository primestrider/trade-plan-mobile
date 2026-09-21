import { Children, useState, type ReactNode } from "react";
import { View, type ImageSourcePropType, type ViewProps } from "react-native";
import { Image } from "expo-image";

import { useStyles, useTheme, view } from "@/styles";
import { spacing, type ThemeColors } from "@/styles/tokens";

import { AppText, type AppTextProps } from "./AppText";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

type AvatarShape = "circle" | "rounded";

type AvatarStatus = "online" | "offline" | "busy" | "away";

export type AvatarProps = ViewProps & {
  source?: ImageSourcePropType | string;
  /** Falls back to initials derived from this name. */
  name?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  status?: AvatarStatus;
};

/**
 * Profile image with an initials fallback.
 *
 * The fallback is also the error path: a broken or slow remote URL flips back
 * to initials instead of leaving a blank square, so a list of users never
 * shows holes.
 *
 * Children, when given, replace the initials — that is how `Avatar.Group`
 * renders its `+N` overflow tile without a second component.
 *
 * @example
 * <Avatar source={user.photoUrl} name={user.fullName} status="online" />
 * <Avatar name="Ada Lovelace" size="lg" shape="rounded" />
 */
export function Avatar({
  source,
  name,
  size = "md",
  shape = "circle",
  status,
  style,
  children,
  ...rest
}: Readonly<AvatarProps>) {
  const styles = useStyles();
  const { colors } = useTheme();

  const [failed, setFailed] = useState(false);

  const sizeStyles = getSizeStyles(size);
  const initials = getInitials(name);

  const showImage = Boolean(source) && !failed;

  return (
    <View
      style={[
        view(
          styles.center,
          styles.relative,
          styles.overflowVisible,
          shape === "circle" ? styles.roundedFull : styles.rounded2xl,
          {
            width: sizeStyles.box,
            height: sizeStyles.box,
            backgroundColor: colors.secondary,
          },
        ),
        style,
      ]}
      {...rest}
    >
      {showImage ? (
        <Image
          source={typeof source === "string" ? { uri: source } : source}
          onError={() => setFailed(true)}
          contentFit="cover"
          style={[
            shape === "circle" ? styles.roundedFull : styles.rounded2xl,
            { width: sizeStyles.box, height: sizeStyles.box },
          ]}
        />
      ) : (
        (children ?? renderInitials(initials, sizeStyles.textVariant, colors))
      )}

      {status && (
        <View
          // The dot is the only carrier of presence, so it gets its own label
          // rather than being left as decoration a screen reader skips.
          accessibilityLabel={status}
          style={view(styles.absolute, styles.bottom0, styles.right0, {
            width: sizeStyles.dot,
            height: sizeStyles.dot,
            borderRadius: sizeStyles.dot / 2,
            backgroundColor: getStatusColor(status, colors),
            // Ringed in the page background so the dot stays legible on top of
            // a photo of any colour.
            borderWidth: sizeStyles.ring,
            borderColor: colors.background,
          })}
        />
      )}
    </View>
  );
}

export type AvatarGroupProps = ViewProps & {
  /** Avatars past this count collapse into a trailing `+N` tile. */
  max?: number;
  /** Overlap in px between neighbours. */
  spacing?: number;
  children?: ReactNode;
};

/**
 * Overlapping row of avatars, with an optional `+N` overflow tile.
 *
 * Each child is wrapped rather than cloned, so the negative margin never
 * fights an avatar's own `style` prop.
 *
 * @example
 * <Avatar.Group max={3}>
 *   {members.map((m) => <Avatar key={m.id} name={m.name} />)}
 * </Avatar.Group>
 */
function AvatarGroup({
  max,
  spacing: overlap = spacing[2],
  children,
  style,
  ...rest
}: Readonly<AvatarGroupProps>) {
  const styles = useStyles();
  const { colors } = useTheme();

  const items = Children.toArray(children);
  const visible = max === undefined ? items : items.slice(0, max);
  const overflow = items.length - visible.length;

  // The overflow tile has to match whatever the row is already rendering, and
  // the row only knows that from the children it was handed.
  const childSize = getChildProp(visible[0], "size") ?? "md";
  const childShape = getChildProp(visible[0], "shape") ?? "circle";
  const overflowVariant = getSizeStyles(childSize).textVariant;

  return (
    <View style={[view(styles.flexRow, styles.itemsCenter), style]} {...rest}>
      {visible.map((child, index) => (
        <View
          key={index}
          style={view(index > 0 && { marginLeft: -overlap })}
        >
          {child}
        </View>
      ))}

      {overflow > 0 && (
        <View style={view({ marginLeft: -overlap })}>
          <Avatar size={childSize} shape={childShape}>
            <AppText
              variant={overflowVariant}
              style={{ color: colors.secondaryForeground }}
            >
              {`+${overflow}`}
            </AppText>
          </Avatar>
        </View>
      )}
    </View>
  );
}

AvatarGroup.displayName = "Avatar.Group";

Avatar.Group = AvatarGroup;

function renderInitials(
  initials: string,
  variant: AppTextProps["variant"],
  colors: ThemeColors,
) {
  if (!initials) return null;

  return (
    <AppText variant={variant} style={{ color: colors.secondaryForeground }}>
      {initials}
    </AppText>
  );
}

/** "Ada Lovelace" -> "AL"; "Ada" -> "A"; anything blank -> "". */
function getInitials(name?: string) {
  const words = name?.trim().split(/\s+/).filter(Boolean) ?? [];

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

function getChildProp<K extends "size" | "shape">(
  child: ReactNode,
  prop: K,
): AvatarProps[K] | undefined {
  if (typeof child !== "object" || child === null || !("props" in child)) {
    return undefined;
  }

  return (child.props as AvatarProps)[prop];
}

function getStatusColor(status: AvatarStatus, colors: ThemeColors) {
  switch (status) {
    case "online":
      return colors.success;
    case "offline":
      return colors.muted;
    case "busy":
      return colors.destructive;
    case "away":
      return colors.warning;
  }
}

function getSizeStyles(size: AvatarSize) {
  switch (size) {
    case "xs":
      return {
        box: spacing[6],
        dot: spacing[2],
        ring: 1,
        textVariant: "caption" as const,
      };

    case "sm":
      return {
        box: spacing[8],
        dot: spacing[2.5],
        ring: 1,
        textVariant: "caption" as const,
      };

    case "md":
      return {
        box: spacing[10],
        dot: spacing[3],
        ring: 2,
        textVariant: "label" as const,
      };

    case "lg":
      return {
        box: spacing[14],
        dot: spacing[3.5],
        ring: 2,
        textVariant: "body" as const,
      };

    case "xl":
      return {
        box: spacing[20],
        dot: spacing[5],
        ring: 3,
        textVariant: "title" as const,
      };
  }
}
