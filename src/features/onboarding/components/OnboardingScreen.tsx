import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Animated, Easing, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  onboardingSchema,
  type OnboardingFormValues,
} from "@/features/onboarding/models/form.schema";
import {
  useProfileStore,
  type Profile,
} from "@/shared/stores";
import {
  AppText,
  Button,
  Input,
  ProgressBar,
  Screen,
} from "@/shared/components";
import { formatCurrency } from "@/shared/helpers";
import { useFieldError, useReduceMotion } from "@/shared/hooks";
import { text, useStyles, useTheme, view } from "@/styles";
import { fontSize } from "@/styles/tokens";
import { fontFamily } from "@/styles/tokens/typography";

/** Ordered so the progress bar and the step index cannot drift apart. */
const STEPS = ["name", "balance"] as const;

/**
 * A step change is two moves: the current step leaves, then the next one
 * arrives. The exit is quicker than the entrance so the screen never feels
 * like it is waiting on itself.
 */
const STEP_EXIT_DURATION = 160;
const STEP_ENTER_DURATION = 320;

/** Accelerates away, then settles gently: the standard pair for a hand-off. */
const EXIT_EASING = Easing.bezier(0.4, 0, 1, 1);
const ENTER_EASING = Easing.bezier(0.2, 0, 0, 1);

/** How far a step travels as it leaves or arrives, in points. */
const STEP_OFFSET = 32;

/** The most a trading plan should put at risk on any one trade. */
const MAX_RISK_PER_TRADE = 0.02;

/**
 * Runs the step content's fade and slide together.
 *
 * Driven from JS on purpose. With the native driver the JS side keeps the
 * value from before the animation, and the form re-renders mid-transition
 * (fields register and unregister), which re-applies that stale value and
 * makes the content flicker. Two properties on one view cost nothing to drive
 * from JS.
 */
function moveStep(
  opacity: Animated.Value,
  shift: Animated.Value,
  to: {
    opacity: number;
    shift: number;
    duration: number;
    easing: (value: number) => number;
  },
) {
  const config = { duration: to.duration, easing: to.easing };

  return Animated.parallel([
    Animated.timing(opacity, {
      ...config,
      toValue: to.opacity,
      useNativeDriver: false,
    }),
    Animated.timing(shift, {
      ...config,
      toValue: to.shift,
      useNativeDriver: false,
    }),
  ]);
}

/** Long enough to read the risk rule and take in the amount, unhurried. */
export const PREPARING_DURATION = 5000;

/**
 * Collects the profile the rest of the app is built on: who the user is, and
 * the capital their trading plan is measured against.
 *
 * Two steps, one route, one form. Splitting the steps across routes would put
 * the half-filled form in navigation state, where a back gesture could strand
 * it; keeping them here means `useForm` stays the single source of truth and
 * stepping back is just `setStep`.
 *
 * Nothing here navigates on success. Writing the profile closes the guard in
 * `src/app/_layout.tsx`, which removes this route and carries the user out.
 */
export function OnboardingScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const fieldError = useFieldError();
  const completeOnboarding = useProfileStore(
    (state) => state.completeOnboarding,
  );

  const reduceMotion = useReduceMotion();

  const [step, setStep] = useState(0);
  /** Set once the form is valid; the preparing screen runs until it is stored. */
  const [profile, setProfile] = useState<Profile | null>(null);

  // Only the step content moves; the progress bar animates its own fill.
  const stepOpacity = useState(() => new Animated.Value(1))[0];
  const stepShift = useState(() => new Animated.Value(0))[0];
  const isLeaving = useRef(false);
  /**
   * Counts swaps, so the entrance runs once per swap even when a press cuts
   * the previous entrance short. A boolean could be left raised and miss one.
   */
  const [entrance, setEntrance] = useState(0);

  /**
   * Moves the content off in the direction of travel (forward goes left, back
   * goes right) and swaps it while it is invisible; the effect below brings
   * the new content in from the opposite side. Presses while the content is
   * leaving are ignored, so a double tap cannot skip a step or submit twice;
   * once it is swapped, a press may cut the entrance short.
   */
  const transition = (direction: 1 | -1, swap: () => void) => {
    if (isLeaving.current) return;
    isLeaving.current = true;

    // With reduced motion the content only fades; it does not travel.
    const offset = reduceMotion ? 0 : STEP_OFFSET * direction;

    moveStep(stepOpacity, stepShift, {
      opacity: 0,
      shift: -offset,
      duration: STEP_EXIT_DURATION,
      easing: EXIT_EASING,
    }).start(() => {
      stepShift.setValue(offset);
      swap();
      isLeaving.current = false;
      setEntrance((count) => count + 1);
    });
  };

  // Started here rather than straight after the swap: the new step has to be
  // on screen, still invisible, before it moves. Starting any earlier lets
  // the old content (or none at all) show for the first frames of the entrance.
  useEffect(() => {
    if (entrance === 0) return;

    const animation = moveStep(stepOpacity, stepShift, {
      opacity: 1,
      shift: 0,
      duration: STEP_ENTER_DURATION,
      easing: ENTER_EASING,
    });

    animation.start();

    return () => animation.stop();
  }, [entrance, stepOpacity, stepShift]);

  const goToStep = (next: number) =>
    transition(next > step ? 1 : -1, () => setStep(next));

  // The pause is deliberate: it gives the risk rule on the preparing screen
  // time to be read before the guard in `_layout.tsx` moves the user on.
  useEffect(() => {
    if (!profile) return;

    const timer = setTimeout(
      () => completeOnboarding(profile),
      PREPARING_DURATION,
    );

    return () => clearTimeout(timer);
  }, [profile, completeOnboarding]);

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { name: "", balance: "" },
  });

  /**
   * Validates only the field on screen. `handleSubmit` would validate the
   * whole schema and surface a balance error while the user is still on the
   * name step.
   */
  const goToBalance = async () => {
    if (await trigger("name")) goToStep(1);
  };

  // Built on press rather than during render: the handler reaches the
  // transition guard, a ref that render must not touch.
  const finish = () =>
    handleSubmit(({ name, balance }) =>
      // The schema has already proven `balance` is nothing but digits.
      transition(1, () => setProfile({ name, balance: Number(balance) })),
    )();

  const isNameStep = step === 0;

  const stepStyle = {
    opacity: stepOpacity,
    transform: [{ translateX: stepShift }],
  };

  // The route hides its header, so nothing above `Screen` clears the status
  // bar; the top edge is claimed here. `Screen` already owns the bottom inset.
  //
  // One top-aligned column: the question on screen is the headline, and the
  // field sits right under it, so nothing drifts when the keyboard opens.
  return (
    <SafeAreaView
      edges={["top"]}
      style={view(styles.flex1, styles.bgBackground)}
    >
      <Screen
        scroll={false}
        footer={
          // Once the form is in, there is nothing left to press: the
          // preparing screen hands over to home on its own.
          profile ? undefined : isNameStep ? (
            <Button
              title={t("features.onboarding.action.next")}
              onPress={goToBalance}
              block
            />
          ) : (
            <View style={view(styles.flexRow, styles.gap3)}>
              <Button
                variant="outline"
                title={t("features.onboarding.action.back")}
                onPress={() => goToStep(0)}
              />
              <Button
                title={t("features.onboarding.action.start")}
                onPress={finish}
                style={styles.flex1}
              />
            </View>
          )
        }
      >
        {/* One bar from the first step to the hand-off: once the form is in,
            it stops counting steps and simply shows the plan being prepared. */}
        <ProgressBar
          value={(step + 1) / STEPS.length}
          indeterminate={profile !== null}
          style={styles.mb8}
        />

        <Animated.View style={stepStyle}>
          {profile ? (
            // The last beat of the flow, not a screen of its own: the one rule
            // the app is built around, worked out against the capital just
            // entered so it reads as the user's own limit. Rupiah is grouped
            // the Indonesian way, matching the amount typed a step before.
            <>
              <AppText color="muted" style={styles.mb2}>
                {t("features.onboarding.preparing.status")}
              </AppText>

              <AppText variant="h1" style={styles.mb8}>
                {t("features.onboarding.preparing.rule")}
              </AppText>

              <AppText
                style={{
                  fontSize: fontSize["5xl"],
                  lineHeight: fontSize["5xl"] * 1.1,
                  fontFamily: fontFamily.extrabold,
                  color: colors.primary,
                }}
              >
                {formatCurrency(
                  Math.floor(profile.balance * MAX_RISK_PER_TRADE),
                  { language: "id" },
                )}
              </AppText>
              <AppText color="muted" style={styles.mt2}>
                {t("features.onboarding.preparing.limit", {
                  balance: formatCurrency(profile.balance, { language: "id" }),
                })}
              </AppText>
            </>
          ) : isNameStep ? (
            <>
              <AppText variant="h1">
                {t("features.onboarding.step.name.heading")}
              </AppText>
              {/* Both steps pair the question with one supporting line; on
                  the first, that line is the welcome, since it introduces
                  the flow. */}
              <AppText color="muted" style={text(styles.mt2, styles.mb6)}>
                {t("features.onboarding.title")}.{" "}
                {t("features.onboarding.subtitle")}
              </AppText>

              {/* Keyed so each step mounts its own field. Unkeyed, both sit in
                  the same slot and React morphs one `TextInput` into the
                  other — keyboard, value and size changing in place. */}
              <Controller
                key="name"
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    // The heading already asks the question, so a visible label
                    // would only repeat it; screen readers still get one.
                    accessibilityLabel={t(
                      "features.onboarding.step.name.label",
                    )}
                    placeholder={t("features.onboarding.step.name.placeholder")}
                    autoCapitalize="words"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={fieldError(errors.name?.message)}
                  />
                )}
              />
            </>
          ) : (
            <>
              <AppText variant="h1">
                {t("features.onboarding.step.balance.heading")}
              </AppText>
              <AppText color="muted" style={text(styles.mt2, styles.mb6)}>
                {t("features.onboarding.step.balance.hint")}
              </AppText>

              <Controller
                key="balance"
                control={control}
                name="balance"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    type="currency"
                    accessibilityLabel={t(
                      "features.onboarding.step.balance.label",
                    )}
                    placeholder={t(
                      "features.onboarding.step.balance.placeholder",
                    )}
                    leftIcon={
                      <AppText variant="title" color="muted">
                        Rp
                      </AppText>
                    }
                    // The amount is what this step is about, so it is set at
                    // display size rather than as ordinary form text.
                    style={{
                      height: 72,
                      fontSize: fontSize["3xl"],
                      fontFamily: fontFamily.bold,
                    }}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={fieldError(errors.balance?.message)}
                  />
                )}
              />
            </>
          )}
        </Animated.View>
      </Screen>
    </SafeAreaView>
  );
}
