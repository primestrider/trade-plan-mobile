import { type ReactNode } from "react";
import { Pressable, View, type ViewProps } from "react-native";

import { useStyles, useTheme, view } from "@/styles";
import { palette, type ThemeColors } from "@/styles/tokens";

import { AppText } from "./AppText";

type CardVariant = "elevated" | "outlined" | "filled";

export type CardProps = ViewProps & {
  variant?: "elevated" | "outlined" | "filled";
  padded?: boolean;
  onPress?: () => void;
};

/**
 * Surface that groups related content.
 *
 * Padding lives on the root alone: `Card.Header`, `Card.Body` and
 * `Card.Footer` contribute spacing *between* sections but never their own
 * gutter, so a padded Card with all three never doubles up, and
 * `<Card padded={false}>` lets `ListItem` rows run edge to edge.
 *
 * @example
 * <Card variant="outlined">
 *   <Card.Header title="Storage" subtitle="12.4 GB of 50 GB" />
 *   <Card.Body><UsageBar value={0.25} /></Card.Body>
 *   <Card.Footer><Button title="Manage" size="sm" /></Card.Footer>
 * </Card>
 *
 * @example
 * <Card padded={false}>
 *   <ListItem title="Notifications" showChevron onPress={open} />
 * </Card>
 */
export function Card({
  variant = "elevated",
  padded = true,
  onPress,
  style,
  children,
  ...rest
}: Readonly<CardProps>) {
  const styles = useStyles();
  const { colors } = useTheme();

  const variantStyles = getVariantStyles(variant, colors);

  // Deliberately no `overflow: "hidden"` — it would clip the Android
  // elevation shadow off the `elevated` variant. Children that need clipping
  // should clip themselves.
  const surface = view(
    styles.rounded2xl,
    // The gap is tied to `padded` too: an unpadded Card holds a list, and
    // list rows sit flush against each other.
    padded && styles.p4,
    padded && styles.gap3,
    variantStyles.shadow && styles.shadow,
    {
      backgroundColor: variantStyles.bg,
      borderWidth: variantStyles.borderWidth,
      borderColor: variantStyles.border,
    },
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={(state) => [surface, state.pressed && { opacity: 0.7 }, style]}
        {...rest}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[surface, style]} {...rest}>
      {children}
    </View>
  );
}

export type CardHeaderProps = ViewProps & {
  title?: string;
  subtitle?: string;
  /** Pinned to the trailing edge — a badge, a switch, an overflow button. */
  right?: ReactNode;
  children?: ReactNode;
};

/**
 * Title block at the top of a Card.
 *
 * `children` replace the title/subtitle pair outright, for headers that need
 * an avatar or a custom row rather than two lines of text.
 *
 * @example
 * <Card.Header title="Team" subtitle="4 members" right={<Badge count={2} />} />
 */
function CardHeader({
  title,
  subtitle,
  right,
  children,
  style,
  ...rest
}: Readonly<CardHeaderProps>) {
  const styles = useStyles();

  return (
    <View
      style={[view(styles.flexRow, styles.itemsCenter, styles.gap3), style]}
      {...rest}
    >
      {children ?? (
        <>
          {/* `minW0` lets a long title truncate instead of shoving `right` out. */}
          <View style={view(styles.flex1, styles.minW0)}>
            {title ? (
              <AppText variant="title" numberOfLines={1}>
                {title}
              </AppText>
            ) : null}
            {subtitle ? (
              <AppText variant="caption" color="muted" numberOfLines={2}>
                {subtitle}
              </AppText>
            ) : null}
          </View>
          {right ? <View style={view(styles.flexShrink0)}>{right}</View> : null}
        </>
      )}
    </View>
  );
}

export type CardBodyProps = ViewProps;

/**
 * Content slot of a Card — stacks its children with a small gap.
 *
 * @example
 * <Card.Body><AppText>Everything is up to date.</AppText></Card.Body>
 */
function CardBody({ style, ...rest }: Readonly<CardBodyProps>) {
  const styles = useStyles();

  return <View style={[view(styles.gap2), style]} {...rest} />;
}

export type CardFooterProps = ViewProps;

/**
 * Trailing slot of a Card, typically actions.
 *
 * Actions align to the end, which is where a thumb expects them.
 *
 * @example
 * <Card.Footer><Button title="Cancel" variant="ghost" size="sm" /></Card.Footer>
 */
function CardFooter({ style, ...rest }: Readonly<CardFooterProps>) {
  const styles = useStyles();

  return (
    <View
      style={[
        view(styles.flexRow, styles.itemsCenter, styles.justifyEnd, styles.gap2),
        style,
      ]}
      {...rest}
    />
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

function getVariantStyles(variant: CardVariant, colors: ThemeColors) {
  switch (variant) {
    case "elevated":
      return {
        bg: colors.card,
        border: palette.transparent,
        borderWidth: 0,
        shadow: true,
      };

    case "outlined":
      return {
        bg: colors.card,
        border: colors.border,
        borderWidth: 1,
        shadow: false,
      };

    case "filled":
      return {
        bg: colors.secondary,
        border: palette.transparent,
        borderWidth: 0,
        shadow: false,
      };
  }
}
