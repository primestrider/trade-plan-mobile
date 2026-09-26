import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type Ref,
} from "react";
import {
  Animated,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import {
  KeyboardController,
  useResizeMode,
} from "react-native-keyboard-controller";

import { formatNumber } from "@/shared/helpers";
import { text, useStyles, useTheme, view } from "@/styles";
import { fontSize } from "@/styles/tokens";
import { fontFamily } from "@/styles/tokens/typography";

type InputType =
  | "text"
  | "number"
  | "currency"
  | "email"
  | "phone"
  | "password";

export type InputProps = Omit<TextInputProps, "type"> & {
  label?: string;
  error?: string;
  hint?: string;
  type?: InputType;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      type = "text",
      leftIcon,
      rightIcon,
      containerStyle,
      value,
      onChangeText,
      onFocus,
      onBlur,
      onSubmitEditing,
      style,
      editable = true,
      ...rest
    }: InputProps,
    ref: Ref<TextInput>,
  ) => {
    useResizeMode();

    const styles = useStyles();
    const { colors } = useTheme();

    const [isFocused, setIsFocused] = useState(false);
    const focusAnim = useState(() => new Animated.Value(0))[0];

    useEffect(() => {
      Animated.timing(focusAnim, {
        toValue: isFocused ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }, [isFocused, focusAnim]);

    const handleFocus = useCallback(
      (e: any) => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus],
    );

    const handleBlur = useCallback(
      (e: any) => {
        setIsFocused(false);
        onBlur?.(e);
      },
      [onBlur],
    );

    const handleChangeText = useCallback(
      (text: string) => {
        let filtered = text;
        if (type === "number") {
          filtered = text.replace(/[^0-9.]/g, "");
        } else if (type === "currency") {
          // Whole units only, so every non-digit — including the grouping
          // marks this input displays — is dropped, as are leading zeros.
          filtered = text.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
        }
        onChangeText?.(filtered);
      },
      [type, onChangeText],
    );

    // A currency field holds bare digits; the grouping marks exist only on
    // screen, so what the caller stores never has to be parsed back. The
    // amount is rupiah, so it is grouped the Indonesian way (`10.000.000`)
    // whatever language the UI is in.
    const displayValue =
      type === "currency" && value
        ? formatNumber(value, { language: "id", maximumFractionDigits: 0 })
        : value;

    const handleSubmitEditing = useCallback(
      (e: any) => {
        KeyboardController.dismiss();
        onSubmitEditing?.(e);
      },
      [onSubmitEditing],
    );

    const typeProps = useMemo(() => {
      switch (type) {
        case "email":
          return {
            keyboardType: "email-address" as KeyboardTypeOptions,
            autoCapitalize: "none" as const,
            textContentType: "emailAddress" as const,
          };
        case "phone":
          return {
            keyboardType: "phone-pad" as KeyboardTypeOptions,
            textContentType: "telephoneNumber" as const,
          };
        case "number":
          return { keyboardType: "decimal-pad" as KeyboardTypeOptions };
        case "currency":
          return { keyboardType: "number-pad" as KeyboardTypeOptions };
        case "password":
          return { secureTextEntry: true };
        default:
          return {};
      }
    }, [type]);

    const animatedBorderColor = useMemo(
      () =>
        focusAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [colors.border, colors.primary],
        }),
      [focusAnim, colors],
    );

    const animatedLabelColor = useMemo(
      () =>
        focusAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [colors.mutedForeground, colors.primary],
        }),
      [focusAnim, colors],
    );

    return (
      <View style={containerStyle}>
        {label ? (
          <Animated.Text
            style={[
              text(styles.textSm, styles["mb1.5"], styles.fontMedium),
              !error && { color: animatedLabelColor },
              error && { color: colors.destructive },
            ]}
          >
            {label}
          </Animated.Text>
        ) : null}
        <Animated.View
          style={[
            view(
              styles.flexRow,
              styles.itemsCenter,
              styles.border,
              styles.rounded2xl,
              styles.bgBackground,
              // A 24px radius eats into the corners, so the gutter widens to
              // keep the text optically centered between the rounded ends.
              styles.px4,
            ),
            !editable && { opacity: 0.5 },
            !error && { borderColor: animatedBorderColor },
            error && { borderColor: colors.destructive },
            isFocused &&
              !error && {
                // `1F` is ~12% alpha, so the focus glow follows the theme accent.
                boxShadow: `0 1px 3px ${colors.primary}1F`,
                elevation: 2,
              },
          ]}
        >
          {leftIcon ? (
            <View
              style={view(styles.mr2, styles.justifyCenter, styles.itemsCenter)}
            >
              {leftIcon}
            </View>
          ) : null}
          <TextInput
            ref={ref}
            style={[
              {
                flex: 1,
                height: 48,
                fontSize: fontSize.base,
                fontFamily: fontFamily.sans,
                color: colors.foreground,
              },
              style,
            ]}
            value={displayValue}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSubmitEditing={handleSubmitEditing}
            placeholderTextColor={colors.mutedForeground}
            editable={editable}
            {...typeProps}
            {...rest}
          />
          {rightIcon ? (
            <View
              style={view(styles.ml2, styles.justifyCenter, styles.itemsCenter)}
            >
              {rightIcon}
            </View>
          ) : null}
        </Animated.View>
        {error ? (
          <Text
            style={text(styles.textSm, styles.textDestructive, styles["mt1.5"])}
          >
            {error}
          </Text>
        ) : hint ? (
          <Text style={text(styles.textSm, styles.textMuted, styles["mt1.5"])}>
            {hint}
          </Text>
        ) : null}
      </View>
    );
  },
);

Input.displayName = "Input";
