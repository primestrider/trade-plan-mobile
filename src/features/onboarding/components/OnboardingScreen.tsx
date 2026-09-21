import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import {
  onboardingSchema,
  type OnboardingFormValues,
} from "@/features/onboarding/models/form.schema";
import { useProfileStore } from "@/features/onboarding/stores/profile.store";
import {
  AppText,
  Button,
  Input,
  ProgressBar,
  Screen,
} from "@/shared/components";
import { formatCurrency } from "@/shared/helpers";
import { useFieldError } from "@/shared/hooks";
import { useStyles, view } from "@/styles";

/** Ordered so the progress bar and the step index cannot drift apart. */
const STEPS = ["name", "balance"] as const;

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
  const { t } = useTranslation();
  const fieldError = useFieldError();
  const completeOnboarding = useProfileStore(
    (state) => state.completeOnboarding,
  );

  const [step, setStep] = useState(0);

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
    if (await trigger("name")) setStep(1);
  };

  const finish = handleSubmit(({ name, balance }) =>
    // The schema has already proven `balance` is nothing but digits.
    completeOnboarding({ name, balance: Number(balance) }),
  );

  const isNameStep = step === 0;

  return (
    <Screen
      scroll={false}
      footer={
        isNameStep ? (
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
              onPress={() => setStep(0)}
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
      <ProgressBar value={(step + 1) / STEPS.length} style={styles.mb6} />

      <AppText variant="h1">{t("features.onboarding.title")}</AppText>
      <AppText variant="caption" color="muted" style={styles.mb8}>
        {t("features.onboarding.subtitle")}
      </AppText>

      {isNameStep ? (
        <>
          <AppText variant="title" style={styles.mb4}>
            {t("features.onboarding.step.name.heading")}
          </AppText>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t("features.onboarding.step.name.label")}
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
          <AppText variant="title" style={styles.mb4}>
            {t("features.onboarding.step.balance.heading")}
          </AppText>

          <Controller
            control={control}
            name="balance"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                type="currency"
                label={t("features.onboarding.step.balance.label")}
                placeholder={t("features.onboarding.step.balance.placeholder")}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={fieldError(errors.balance?.message)}
                // The field itself holds bare digits, so the amount they add up
                // to is spelled out underneath rather than left to be counted.
                hint={
                  value
                    ? formatCurrency(value)
                    : t("features.onboarding.step.balance.hint")
                }
              />
            )}
          />
        </>
      )}
    </Screen>
  );
}
