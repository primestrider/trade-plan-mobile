import { useState } from "react";
import {
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { text, useStyles, useTheme, view } from "@/styles";
import { spacing } from "@/styles/tokens";

import { AppText } from "./AppText";
import { BottomSheet } from "./BottomSheet";
import { ListItem } from "./ListItem";

/** The caret on the trigger. */
export const SELECT_CHEVRON_TEST_ID = "select-chevron";

/** The tick beside the chosen option inside the sheet. */
export const SELECT_CHECK_TEST_ID = "select-check";

/** Stable hook for reaching one option row in the sheet. */
export const selectOptionTestID = (value: string) => `select-option-${value}`;

export type SelectOption<T> = {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
};

export type SelectProps<T> = Omit<
  PressableProps,
  "children" | "disabled" | "onPress" | "style"
> & {
  options: SelectOption<T>[];
  value?: T;
  onChange: (value: T) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  /** Sheet heading. Defaults to `label`. */
  title?: string;
  containerStyle?: StyleProp<ViewStyle>;
  /** Trigger style — wins over the built-in look. */
  style?: StyleProp<ViewStyle>;
};

/**
 * Single-choice field that opens its options in a bottom sheet.
 *
 * The trigger deliberately reuses `Input`'s resting look (1px border, 24px
 * radius, 48px content box, 16px gutter) so a form mixing the two reads as one
 * control set rather than two.
 *
 * A sheet beats a dropdown on a phone: the list gets full width, thumb-reach
 * and a real dismiss gesture. `BottomSheet` already owns that behaviour, so
 * this only supplies the rows.
 *
 * Generic over the option value so `onChange` hands back the caller's own union
 * instead of a widened `string`.
 *
 * @example
 * <Select
 *   label="Frequency"
 *   value={frequency}
 *   onChange={setFrequency}
 *   options={[
 *     { value: "daily", label: "Daily" },
 *     { value: "weekly", label: "Weekly", description: "Every Monday" },
 *   ]}
 * />
 */
export function Select<T>({
  options,
  value,
  onChange,
  label,
  placeholder = "Select an option",
  error,
  hint,
  disabled = false,
  title,
  containerStyle,
  style,
  ...rest
}: Readonly<SelectProps<T>>) {
  const styles = useStyles();
  const { colors } = useTheme();

  const [open, setOpen] = useState(false);

  const selected = options.find((option) => option.value === value);
  const display = selected ? selected.label : placeholder;

  const handleSelect = (option: SelectOption<T>) => {
    if (option.disabled) return;

    setOpen(false);
    onChange(option.value);
  };

  return (
    <View style={containerStyle}>
      {label ? (
        <AppText
          variant="label"
          style={text(
            styles["mb1.5"],
            error ? styles.textDestructive : styles.textMutedForeground,
          )}
        >
          {label}
        </AppText>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ? `${label}, ${display}` : display}
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={(state) => [
          view(
            styles.flexRow,
            styles.itemsCenter,
            styles.gap2,
            styles.border,
            styles.rounded2xl,
            styles.bgBackground,
            // Matches `Input`: a 24px radius eats the corners, so the gutter
            // widens to keep the value optically centred between them.
            styles.px4,
            { borderColor: error ? colors.destructive : colors.border },
            disabled && styles.opacity50,
            !disabled && state.pressed && styles.opacity75,
          ),
          style,
        ]}
        {...rest}
      >
        {/* The 48px box lives on the value, not the trigger, so the border sits
            exactly where `Input`'s does. */}
        <View
          style={view(
            styles.flex1,
            styles.minW0,
            styles.justifyCenter,
            styles.h12,
          )}
        >
          <AppText
            numberOfLines={1}
            style={!selected && { color: colors.mutedForeground }}
          >
            {display}
          </AppText>
        </View>

        {/* No icon library: two borders on a rotated square draw the caret. */}
        <View
          testID={SELECT_CHEVRON_TEST_ID}
          style={view(styles.size2, {
            borderTopWidth: 1.5,
            borderRightWidth: 1.5,
            borderColor: colors.mutedForeground,
            transform: [{ rotate: "135deg" }],
          })}
        />
      </Pressable>

      {error ? (
        <AppText
          variant="label"
          weight="normal"
          style={text(styles["mt1.5"], styles.textDestructive)}
        >
          {error}
        </AppText>
      ) : hint ? (
        <AppText
          variant="label"
          weight="normal"
          style={text(styles["mt1.5"], styles.textMuted)}
        >
          {hint}
        </AppText>
      ) : null}

      <BottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        title={title ?? label}
        // `ListItem` carries its own gutter; the sheet must not add a second.
        padded={false}
      >
        <View>
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <ListItem
                key={String(option.value)}
                testID={selectOptionTestID(String(option.value))}
                title={option.label}
                subtitle={option.description}
                disabled={option.disabled}
                accessibilityState={{
                  selected: isSelected,
                  disabled: Boolean(option.disabled),
                }}
                onPress={() => handleSelect(option)}
                right={
                  isSelected ? (
                    // A check: a square with two adjacent borders, rotated and
                    // stretched so the strokes read as a tick.
                    <View
                      testID={SELECT_CHECK_TEST_ID}
                      style={view({
                        width: spacing[1.5],
                        height: spacing[3],
                        borderRightWidth: 2,
                        borderBottomWidth: 2,
                        borderColor: colors.primary,
                        transform: [{ rotate: "45deg" }],
                      })}
                    />
                  ) : null
                }
              />
            );
          })}
        </View>
      </BottomSheet>
    </View>
  );
}
