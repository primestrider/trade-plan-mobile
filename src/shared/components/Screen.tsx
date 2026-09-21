import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useStyles, view } from "@/styles";
import { spacing } from "@/styles/tokens";

export type ScreenProps = ScrollViewProps & {
  children: ReactNode;
  /** Renders a ScrollView. Turn off for screens that manage their own list. */
  scroll?: boolean;
  /** Applies the standard screen gutter. */
  padded?: boolean;
  keyboardAvoiding?: boolean;
  /** Pinned below the content, above the home indicator. */
  footer?: ReactNode;
  /** Styles the screen container, not the scrollable content. */
  style?: StyleProp<ViewStyle>;
};

/**
 * Standard screen frame: themed background, scroll, gutter, and safe-area.
 *
 * The bottom inset is added to the content rather than the container, so a
 * scrollable screen can still run its content under the home indicator while
 * ending with enough clearance to read.
 *
 * Screens live inside a Stack, which already handles the top inset.
 *
 * @example
 * <Screen>
 *   <AppText variant="h1">Profile</AppText>
 * </Screen>
 *
 * @example
 * <Screen scroll={false} footer={<Button title="Save" block />}>
 *   <ProfileForm />
 * </Screen>
 */
export function Screen({
  children,
  scroll = true,
  padded = true,
  keyboardAvoiding = false,
  footer,
  style,
  contentContainerStyle,
  ...rest
}: Readonly<ScreenProps>) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();

  // A footer owns the bottom inset instead, so the two never double up.
  const bottomInset = footer ? 0 : insets.bottom + spacing[6];

  const body = scroll ? (
    <ScrollView
      style={view(styles.flex1)}
      contentContainerStyle={view(
        padded && styles.p4,
        { paddingBottom: bottomInset },
        contentContainerStyle,
      )}
      keyboardShouldPersistTaps="handled"
      {...rest}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={view(
        styles.flex1,
        padded && styles.p4,
        { paddingBottom: bottomInset },
        contentContainerStyle,
      )}
      {...(rest as ViewProps)}
    >
      {children}
    </View>
  );

  const content = (
    <View style={[view(styles.flex1, styles.bgBackground), style]}>
      {body}
      {footer ? (
        <View
          style={view(padded && styles.px4, styles.pt3, {
            paddingBottom: insets.bottom + spacing[3],
          })}
        >
          {footer}
        </View>
      ) : null}
    </View>
  );

  if (!keyboardAvoiding) return content;

  return (
    <KeyboardAvoidingView
      style={view(styles.flex1)}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {content}
    </KeyboardAvoidingView>
  );
}
