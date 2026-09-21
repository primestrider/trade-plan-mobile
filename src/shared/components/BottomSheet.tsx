import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  Animated,
  Modal,
  PanResponder,
  ScrollView,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useStyles, useTheme, view } from "@/styles";
import { radii, spacing } from "@/styles/tokens";

import { AppText } from "./AppText";
import { Backdrop, useOverlayTransition } from "./internal/Overlay";

/** Height of the sheet before it is measured, so the first frame is offscreen. */
const ASSUMED_HEIGHT = 400;

/** Fraction of the sheet that must be dragged away before it dismisses. */
const DISMISS_RATIO = 0.25;

/** Flick speed that dismisses regardless of distance travelled. */
const DISMISS_VELOCITY = 0.6;

/** Ceiling on the sheet, so it can never cover the whole screen. */
const MAX_HEIGHT_RATIO = 0.85;

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Tapping the scrim, dragging down, or Android back closes it. Default true. */
  dismissable?: boolean;
  title?: string;
  /**
   * Applies the standard gutter to the content. Turn off for rows that carry
   * their own — `ListItem`, for one — which would otherwise indent twice.
   */
  padded?: boolean;
  children: ReactNode;
};

/**
 * Sheet that rises from the bottom edge — the mobile-native place to put a
 * secondary choice or a short form.
 *
 * The drag gesture lives on the handle and header only. Attaching it to the
 * whole sheet would fight any scrollable content inside it for the same
 * downward swipe.
 *
 * @example
 * <BottomSheet visible={open} onClose={close} title="Sort by">
 *   <ListItem title="Newest" onPress={...} />
 *   <ListItem title="Oldest" onPress={...} />
 * </BottomSheet>
 */
export function BottomSheet({
  visible,
  onClose,
  dismissable = true,
  title,
  padded = true,
  children,
}: Readonly<BottomSheetProps>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const { mounted, progress } = useOverlayTransition(visible);

  const [height, setHeight] = useState(ASSUMED_HEIGHT);
  const dragY = useState(() => new Animated.Value(0))[0];

  // A sheet dragged halfway and then dismissed must not reopen mid-drag.
  useEffect(() => {
    if (visible) dragY.setValue(0);
  }, [visible, dragY]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          dismissable && gesture.dy > 4,
        onPanResponderMove: (_, gesture) => {
          // Downward only — dragging up must not lift the sheet off its edge.
          dragY.setValue(Math.max(0, gesture.dy));
        },
        onPanResponderRelease: (_, gesture) => {
          const far = gesture.dy > height * DISMISS_RATIO;
          const fast = gesture.vy > DISMISS_VELOCITY;

          if (far || fast) {
            onClose();
            return;
          }

          Animated.spring(dragY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
          }).start();
        },
      }),
    [dismissable, dragY, height, onClose],
  );

  const translateY = useMemo(
    () =>
      Animated.add(
        progress.interpolate({
          inputRange: [0, 1],
          outputRange: [height, 0],
        }),
        dragY,
      ),
    [progress, height, dragY],
  );

  if (!mounted) return null;

  const handleLayout = (event: LayoutChangeEvent) => {
    setHeight(event.nativeEvent.layout.height);
  };

  return (
    <Modal
      transparent
      visible
      animationType="none"
      statusBarTranslucent
      onRequestClose={dismissable ? onClose : undefined}
    >
      <View style={view(styles.flex1, styles.justifyEnd)}>
        <Backdrop
          progress={progress}
          onPress={dismissable ? onClose : undefined}
        />

        <Animated.View
          accessibilityViewIsModal
          testID="bottom-sheet"
          onLayout={handleLayout}
          style={view(styles.bgCard, styles.shadowLg, {
            borderTopLeftRadius: radii["2xl"],
            borderTopRightRadius: radii["2xl"],
            paddingBottom: insets.bottom + spacing[4],
            transform: [{ translateY }],
          })}
        >
          <View {...panResponder.panHandlers}>
            <View style={view(styles.itemsCenter, styles.pt3, styles.pb2)}>
              <View
                testID="bottom-sheet-handle"
                style={view({
                  width: spacing[10],
                  height: spacing[1],
                  borderRadius: radii.full,
                  backgroundColor: colors.border,
                })}
              />
            </View>

            {title ? (
              <View style={view(styles.px4, styles.pb3)}>
                <AppText variant="title">{title}</AppText>
              </View>
            ) : null}
          </View>

          {/*
            Content taller than the sheet's ceiling scrolls rather than running
            off the bottom of the screen. The drag gesture lives on the header
            above, so the two never compete for the same downward swipe.
          */}
          <ScrollView
            bounces={false}
            style={{ maxHeight: screenHeight * MAX_HEIGHT_RATIO }}
            contentContainerStyle={view(padded && styles.px4)}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
