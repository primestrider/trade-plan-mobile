import { BottomSheet as NativeBottomSheet, RNHostView } from "@expo/ui";
import { useEffect, useState, type ReactNode } from "react";
import { Platform, ScrollView, useWindowDimensions, View } from "react-native";

import { useStyles, useTheme, view } from "@/styles";

import { AppText } from "./AppText";

/** Ceiling on the content, so a long list scrolls instead of running off. */
const MAX_HEIGHT_RATIO = 0.85;

/** Material 3 caps a bottom sheet's width at this, in dp; iOS phones do not. */
const MAX_SHEET_WIDTH = 640;

/**
 * How long the content outlives `visible`: long enough for the native sheet
 * to finish sliding away with its content still in it.
 */
export const SHEET_EXIT_DURATION = 400;

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
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
 * Presented by `@expo/ui`: a SwiftUI sheet on iOS, a Material 3
 * `ModalBottomSheet` on Android. The platform owns the drag handle, the
 * dismiss gestures, the scrim, the safe area, and moving out of the
 * keyboard's way, so none of that is reimplemented here.
 *
 * The content is ordinary React Native, bridged in through `RNHostView`. It
 * is mounted only while the sheet is open (plus its exit), because the iOS
 * sheet would otherwise keep it mounted all along: a form inside would
 * autofocus behind the screen and never start fresh. Each open mounts the
 * content anew, so a draft abandoned by closing is gone next time.
 *
 * Native sheets do not pick up the app theme on their own, so the sheet is
 * painted with the theme's card color for the content to read against.
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
  title,
  padded = true,
  children,
}: Readonly<BottomSheetProps>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const [mounted, setMounted] = useState(visible);

  // Adjusted during render rather than in an effect, so the content is
  // already there on the frame the sheet starts to rise.
  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    if (visible) return;

    const timer = setTimeout(() => setMounted(false), SHEET_EXIT_DURATION);

    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <NativeBottomSheet
      isPresented={visible}
      onDismiss={onClose}
      containerColor={colors.card}
      // The gutter is applied below, per `padded`, rather than by the sheet.
      contentPadding={0}
    >
      {mounted ? (
        <RNHostView matchContents>
          <View
            testID="bottom-sheet"
            style={view(
              // `matchContents` sizes the host from its content, and content
              // with no width of its own grows to its longest unwrapped line,
              // running past the sheet and hiding the gutter. Pinning it to
              // the sheet's width lets text wrap and the gutter show.
              { width: Math.min(screenWidth, MAX_SHEET_WIDTH) },
              styles.pb4,
              // iOS draws its drag indicator over the content; Android gives
              // its handle a row of its own.
              Platform.OS === "ios" && styles.pt6,
            )}
          >
            {title ? (
              <View style={view(styles.px4, styles.pb3)}>
                <AppText variant="title">{title}</AppText>
              </View>
            ) : null}

            <ScrollView
              bounces={false}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: screenHeight * MAX_HEIGHT_RATIO }}
              contentContainerStyle={view(padded && styles.px4)}
            >
              {children}
            </ScrollView>
          </View>
        </RNHostView>
      ) : null}
    </NativeBottomSheet>
  );
}
