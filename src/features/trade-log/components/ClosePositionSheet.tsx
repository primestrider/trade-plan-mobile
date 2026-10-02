import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { AppText, BottomSheet, Button, Input } from "@/shared/components";
import { text, useStyles, view } from "@/styles";
import { fontSize } from "@/styles/tokens";
import { fontFamily } from "@/styles/tokens/typography";

import { usePriceError } from "../hooks/usePriceError";
import { exitSchema, type ExitFormValues } from "../models/form.schema";
import type { TradePlan } from "../models/plan";
import { usePlanStore } from "../stores/plan.store";

export type ClosePositionSheetProps = {
  visible: boolean;
  onClose: () => void;
  plan: TradePlan;
  /** The last traded price, when the stock list has it. */
  suggestedPrice?: number;
};

/**
 * Records the sale of an open position. The price is the user's own: it is
 * started at the last traded price only as a convenience.
 *
 * As with `EditBalanceSheet`, the form mounts afresh on each open.
 */
export function ClosePositionSheet({
  visible,
  onClose,
  plan,
  suggestedPrice,
}: Readonly<ClosePositionSheetProps>) {
  const { t } = useTranslation();

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={t("features.tradeLog.closeSheet.title")}
    >
      <CloseForm plan={plan} suggestedPrice={suggestedPrice} onDone={onClose} />
    </BottomSheet>
  );
}

function CloseForm({
  plan,
  suggestedPrice,
  onDone,
}: Readonly<{ plan: TradePlan; suggestedPrice?: number; onDone: () => void }>) {
  const styles = useStyles();
  const { t } = useTranslation();
  const priceError = usePriceError();
  const closePlan = usePlanStore((state) => state.closePlan);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ExitFormValues>({
    resolver: zodResolver(exitSchema),
    defaultValues: { exitPrice: suggestedPrice ? String(suggestedPrice) : "" },
  });

  const save = handleSubmit((values) => {
    closePlan(plan.id, Number(values.exitPrice));
    onDone();
  });

  return (
    <View style={styles.pb2}>
      <AppText color="muted" style={text(styles.mb4)}>
        {t("features.tradeLog.closeSheet.description")}
      </AppText>

      <Controller
        control={control}
        name="exitPrice"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            type="currency"
            autoFocus
            accessibilityLabel={t("features.tradeLog.price.exit")}
            leftIcon={
              <AppText variant="title" color="muted">
                Rp
              </AppText>
            }
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
            error={priceError(errors.exitPrice?.message, value)}
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
          title={t("features.tradeLog.action.close")}
          onPress={save}
          style={styles.flex1}
        />
      </View>
    </View>
  );
}
