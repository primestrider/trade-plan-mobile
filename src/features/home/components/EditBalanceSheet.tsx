import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { onboardingSchema } from "@/features/onboarding/models/form.schema";
import { AppText, BottomSheet, Button, Input } from "@/shared/components";
import { useFieldError } from "@/shared/hooks";
import { useProfileStore } from "@/shared/stores";
import { text, useStyles, view } from "@/styles";
import { fontSize } from "@/styles/tokens";
import { fontFamily } from "@/styles/tokens/typography";

/**
 * The same rules onboarding applies to the starting balance: editing the
 * capital later must not let in an amount onboarding would have refused.
 */
const balanceSchema = onboardingSchema.pick({ balance: true });

type BalanceFormValues = { balance: string };

export type EditBalanceSheetProps = {
  visible: boolean;
  onClose: () => void;
};

/**
 * Lets the user change the capital their trading plan is measured against.
 *
 * The form lives in its own component inside the sheet, so it mounts afresh
 * each time the sheet opens: it always starts from the stored balance, and a
 * draft abandoned by closing the sheet is not waiting there next time.
 */
export function EditBalanceSheet({
  visible,
  onClose,
}: Readonly<EditBalanceSheetProps>) {
  const { t } = useTranslation();

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={t("features.home.editBalance.title")}
    >
      <EditBalanceForm onDone={onClose} />
    </BottomSheet>
  );
}

function EditBalanceForm({ onDone }: Readonly<{ onDone: () => void }>) {
  const styles = useStyles();
  const { t } = useTranslation();
  const fieldError = useFieldError();
  const balance = useProfileStore((state) => state.balance);
  const setBalance = useProfileStore((state) => state.setBalance);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BalanceFormValues>({
    resolver: zodResolver(balanceSchema),
    defaultValues: { balance: String(balance) },
  });

  // The schema has already proven `balance` is nothing but digits.
  const save = handleSubmit((values) => {
    setBalance(Number(values.balance));
    onDone();
  });

  return (
    <View style={styles.pb2}>
      <AppText color="muted" style={text(styles.mb4)}>
        {t("features.home.editBalance.description")}
      </AppText>

      <Controller
        control={control}
        name="balance"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            type="currency"
            autoFocus
            accessibilityLabel={t("features.home.balance")}
            leftIcon={
              <AppText variant="title" color="muted">
                Rp
              </AppText>
            }
            // Same display treatment as the onboarding step, so the amount
            // reads as the one thing this sheet is about.
            style={{
              height: 60,
              fontSize: fontSize["2xl"],
              fontFamily: fontFamily.bold,
            }}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            onSubmitEditing={save}
            returnKeyType="done"
            error={fieldError(errors.balance?.message)}
          />
        )}
      />

      <View style={view(styles.flexRow, styles.gap3, styles.mt6)}>
        <Button
          variant="outline"
          title={t("utils.action.cancel")}
          onPress={onDone}
        />
        <Button
          title={t("utils.action.save")}
          onPress={save}
          style={styles.flex1}
        />
      </View>
    </View>
  );
}
