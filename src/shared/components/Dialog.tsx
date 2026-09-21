import type { ReactNode } from "react";
import { Animated, Modal, View, type ViewProps } from "react-native";

import { useStyles, view } from "@/styles";
import { spacing } from "@/styles/tokens";

import { AppText } from "./AppText";
import { Backdrop, useOverlayTransition } from "./internal/Overlay";

/** Keeps the card clear of the screen edges on small phones. */
const SCREEN_GUTTER = spacing[6];
const MAX_WIDTH = 420;

export type DialogProps = {
  visible: boolean;
  onClose: () => void;
  /** Tapping the scrim or pressing Android back closes it. Default true. */
  dismissable?: boolean;
  children: ReactNode;
};

/**
 * Centered modal for a decision the user has to make before continuing.
 *
 * Set `dismissable={false}` when the choice cannot be skipped — that also
 * makes the scrim inert, so there is no dead tap target implying otherwise.
 *
 * @example
 * <Dialog visible={open} onClose={close}>
 *   <Dialog.Title>Delete item?</Dialog.Title>
 *   <Dialog.Body>This cannot be undone.</Dialog.Body>
 *   <Dialog.Actions>
 *     <Button title="Cancel" variant="ghost" onPress={close} />
 *     <Button title="Delete" variant="destructive" onPress={confirm} />
 *   </Dialog.Actions>
 * </Dialog>
 */
export function Dialog({
  visible,
  onClose,
  dismissable = true,
  children,
}: Readonly<DialogProps>) {
  const styles = useStyles();
  const { mounted, progress } = useOverlayTransition(visible);

  if (!mounted) return null;

  return (
    <Modal
      transparent
      visible
      // The transition is animated here, so Modal's own must stay out of it.
      animationType="none"
      statusBarTranslucent
      onRequestClose={dismissable ? onClose : undefined}
    >
      <View style={view(styles.flex1, styles.center, { padding: SCREEN_GUTTER })}>
        <Backdrop progress={progress} onPress={dismissable ? onClose : undefined} />

        <Animated.View
          accessibilityViewIsModal
          accessibilityRole="alert"
          testID="dialog-card"
          style={view(
            styles.wFull,
            styles.bgCard,
            styles.rounded2xl,
            styles.p6,
            styles.gap2,
            styles.shadowLg,
            {
              maxWidth: MAX_WIDTH,
              opacity: progress,
              transform: [
                {
                  // Settling from slightly small reads as the card arriving,
                  // rather than a flat cross-fade.
                  scale: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                  }),
                },
              ],
            },
          )}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

function DialogTitle({ children, style, ...rest }: Readonly<ViewProps & { children: ReactNode }>) {
  return (
    <View style={style} {...rest}>
      <AppText variant="h3">{children}</AppText>
    </View>
  );
}

function DialogBody({ children, style, ...rest }: Readonly<ViewProps & { children: ReactNode }>) {
  const styles = useStyles();

  return (
    <View style={style} {...rest}>
      {typeof children === "string" ? (
        <AppText color="muted">{children}</AppText>
      ) : (
        <View style={view(styles.gap2)}>{children}</View>
      )}
    </View>
  );
}

function DialogActions({ children, style, ...rest }: Readonly<ViewProps>) {
  const styles = useStyles();

  return (
    <View
      style={[
        view(styles.flexRow, styles.justifyEnd, styles.itemsCenter, styles.gap2, styles.mt2),
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

Dialog.Title = DialogTitle;
Dialog.Body = DialogBody;
Dialog.Actions = DialogActions;
