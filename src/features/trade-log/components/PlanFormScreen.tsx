import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { formatPrice } from "@/features/search/helpers/stock";
import type { Stock } from "@/features/search/models/api.model";
import { fetchStocks } from "@/features/search/services/api";
import { AppText, Button, Input, Screen } from "@/shared/components";
import { useFieldError } from "@/shared/hooks";
import type { ApiError } from "@/shared/models";
import { useProfileStore } from "@/shared/stores";
import { text, useStyles, view } from "@/styles";

import {
  formatPercentValue,
  formatRewardRatio,
  formatRupiah,
} from "../helpers/format";
import { useEffectiveRisk } from "../hooks/useEffectiveRisk";
import { usePriceError } from "../hooks/usePriceError";
import {
  NOTE_MAX_LENGTH,
  planSchema,
  type PlanFormValues,
} from "../models/form.schema";
import { averagingDownOn, rewardRatio, sizePosition } from "../models/plan";
import { usePlanStore } from "../stores/plan.store";

export type PlanFormScreenProps = {
  /** Set when the form is opened from a stock's page: the code is fixed. */
  code?: string;
  /** Set when editing: the plan's prices are loaded and the code is fixed. */
  planId?: string;
};

const toDigits = (value: number | null | undefined) =>
  value ? String(value) : "";

/**
 * Writes a plan before the buy: the user types the entry, stop loss and
 * target, and the lot size is worked out live from the risk limit, so the
 * plan cannot be saved at a size that would lose more than the limit.
 *
 * Prices are always the user's own. The last price is offered, never forced:
 * a plan is usually for a price the stock has not reached yet.
 */
export function PlanFormScreen({ code: fixedCode, planId }: Readonly<PlanFormScreenProps>) {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const fieldError = useFieldError();
  const priceError = usePriceError();

  const balance = useProfileStore((state) => state.balance);
  const risk = useEffectiveRisk();
  const plans = usePlanStore((state) => state.plans);
  const editing = usePlanStore((state) =>
    planId ? state.plans.find((plan) => plan.id === planId) : undefined,
  );
  const addPlan = usePlanStore((state) => state.addPlan);
  const updatePlan = usePlanStore((state) => state.updatePlan);

  // Shares the search screen's cache, so arriving from a stock costs nothing.
  const { data: stocks } = useQuery<Stock[], ApiError>({
    queryKey: ["stocks", "list"],
    queryFn: fetchStocks,
  });

  const lockedCode = editing?.code ?? fixedCode;
  const initialStock = stocks?.find((stock) => stock.Code === lockedCode);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      code: lockedCode ?? "",
      entry: editing ? toDigits(editing.entry) : toDigits(initialStock?.Last),
      stopLoss: toDigits(editing?.stopLoss),
      target: toDigits(editing?.target),
      note: editing?.note ?? "",
    },
  });

  const [code, entry, stopLoss, target] = useWatch({
    control,
    name: ["code", "entry", "stopLoss", "target"],
  });

  const stock = stocks?.find((item) => item.Code === code.trim());
  const prices = {
    entry: Number(entry),
    stopLoss: Number(stopLoss),
    target: target ? Number(target) : null,
  };
  const size = sizePosition(prices, balance, risk.percent);
  const averagingDown = averagingDownOn(
    plans,
    code.trim(),
    prices.entry,
    editing?.id,
  );
  const ratio = rewardRatio(prices);
  const canSave = size !== null && size.lots > 0;

  const save = handleSubmit((values) => {
    if (!size || size.lots === 0) return;

    const plan = {
      code: values.code.trim(),
      name: stock?.Name ?? editing?.name ?? "",
      entry: Number(values.entry),
      stopLoss: Number(values.stopLoss),
      target: values.target ? Number(values.target) : null,
      lots: size.lots,
      note: values.note.trim(),
    };

    if (editing) {
      updatePlan(editing.id, plan);
      router.back();
    } else {
      const id = addPlan(plan);
      router.replace({ pathname: "/plan/[id]", params: { id } });
    }
  });

  const priceField = (
    name: "entry" | "stopLoss" | "target",
    label: string,
    autoFocus = false,
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <Input
          type="currency"
          label={label}
          accessibilityLabel={label}
          autoFocus={autoFocus}
          leftIcon={
            <AppText variant="label" color="muted">
              Rp
            </AppText>
          }
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          error={priceError(errors[name]?.message, value)}
        />
      )}
    />
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: t(
            editing
              ? "features.tradeLog.form.titleEdit"
              : "features.tradeLog.form.titleNew",
          ),
        }}
      />

      <Screen
        keyboardAvoiding
        keyboardShouldPersistTaps="handled"
        footer={
          <Button
            block
            title={t("features.tradeLog.action.save")}
            onPress={save}
            disabled={!canSave}
          />
        }
      >
        <View style={styles.gap4}>
          {lockedCode ? (
            <View>
              <AppText variant="h3">{lockedCode}</AppText>
              {(stock?.Name ?? editing?.name) ? (
                <AppText color="muted">{stock?.Name ?? editing?.name}</AppText>
              ) : null}
            </View>
          ) : (
            <Controller
              control={control}
              name="code"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t("features.tradeLog.form.code")}
                  accessibilityLabel={t("features.tradeLog.form.code")}
                  placeholder={t("features.tradeLog.form.codePlaceholder")}
                  autoFocus
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={4}
                  value={value}
                  onChangeText={(next) => onChange(next.toUpperCase())}
                  onBlur={onBlur}
                  error={fieldError(errors.code?.message)}
                  hint={
                    stock
                      ? stock.Name
                      : value.length === 4 && stocks
                        ? t("features.tradeLog.form.unknownCode")
                        : undefined
                  }
                />
              )}
            />
          )}

          {stock ? (
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                setValue("entry", String(stock.Last), { shouldValidate: true })
              }
              style={view(styles.flexRow, styles.justifyBetween)}
            >
              <AppText color="muted">
                {t("features.tradeLog.form.lastPrice", {
                  price: formatPrice(stock.Last),
                })}
              </AppText>
              <AppText variant="label" color="primary">
                {t("features.tradeLog.form.useLastPrice")}
              </AppText>
            </Pressable>
          ) : null}

          {priceField("entry", t("features.tradeLog.price.entry"), !!lockedCode && !editing)}
          {priceField("stopLoss", t("features.tradeLog.price.stopLoss"))}
          {priceField("target", t("features.tradeLog.form.targetOptional"))}

          <Controller
            control={control}
            name="note"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t("features.tradeLog.form.note")}
                accessibilityLabel={t("features.tradeLog.form.note")}
                placeholder={t("features.tradeLog.form.notePlaceholder")}
                multiline
                maxLength={NOTE_MAX_LENGTH}
                textAlignVertical="top"
                style={{ minHeight: 96, paddingTop: 12 }}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={fieldError(errors.note?.message)}
              />
            )}
          />

          {averagingDown ? (
            <AppText color="warning">
              {t("features.tradeLog.form.averageDown", {
                code: averagingDown.code,
                entry: formatPrice(averagingDown.entry),
              })}
            </AppText>
          ) : null}

          <SizeSummary
            size={size}
            ratio={ratio}
            balance={balance}
          />

          {risk.lowered && size ? (
            <AppText variant="caption" color="warning">
              {t("features.tradeLog.form.loweredRisk", {
                percent: formatPercentValue(risk.percent),
                count: risk.lossStreak,
              })}
            </AppText>
          ) : null}
        </View>
      </Screen>
    </>
  );
}

/**
 * The answer the form exists to give: how many lots, and what that costs and
 * risks. It reads as a result rather than another field, so it sits on the
 * card surface beneath the inputs.
 */
function SizeSummary({
  size,
  ratio,
  balance,
}: Readonly<{
  size: ReturnType<typeof sizePosition>;
  ratio: number | null;
  balance: number;
}>) {
  const styles = useStyles();
  const { t } = useTranslation();

  if (!size) {
    return (
      <AppText color="muted" style={text(styles.mt2)}>
        {t("features.tradeLog.form.pending")}
      </AppText>
    );
  }

  if (size.lots === 0) {
    return (
      <AppText color="destructive" style={text(styles.mt2)}>
        {t("features.tradeLog.form.tooWide", {
          maxLoss: formatRupiah(size.maxLoss),
        })}
      </AppText>
    );
  }

  const rows: [string, string][] = [
    [t("features.tradeLog.form.cost"), formatRupiah(size.cost)],
    [
      t("features.tradeLog.form.risk"),
      `${formatRupiah(size.risk)} (${formatPercentValue(
        (size.risk / balance) * 100,
      )})`,
    ],
  ];

  if (ratio !== null) {
    rows.push([
      t("features.tradeLog.form.reward"),
      formatRewardRatio(ratio),
    ]);
  }

  return (
    <View style={view(styles.mt2, styles.p4, styles.roundedXl, styles.bgSecondary)}>
      <AppText color="muted">{t("features.tradeLog.form.lots")}</AppText>
      <AppText variant="h2">
        {t("features.tradeLog.lots", { count: size.lots })}
      </AppText>

      <View style={view(styles.gap2, styles.mt3)}>
        {rows.map(([label, value]) => (
          <View key={label} style={view(styles.flexRow, styles.justifyBetween)}>
            <AppText color="muted">{label}</AppText>
            <AppText variant="label">{value}</AppText>
          </View>
        ))}
      </View>

      {size.limitedByCapital ? (
        <AppText variant="caption" color="muted" style={text(styles.mt3)}>
          {t("features.tradeLog.form.limitedByCapital")}
        </AppText>
      ) : null}
    </View>
  );
}
