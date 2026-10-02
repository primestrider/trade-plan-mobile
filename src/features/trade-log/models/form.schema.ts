import { z } from "zod";

import { translationKey } from "@/shared/models/i18n";

import { isOnTick } from "./tick";

/** Rupiah prices are whole numbers; `Input type="currency"` hands over digits. */
const WHOLE_RUPIAH = /^\d+$/;

/** IDX codes are four letters. */
const STOCK_CODE = /^[A-Z]{4}$/;

/** Long enough for a reason and a plan B; short enough to stay a note. */
export const NOTE_MAX_LENGTH = 500;

/**
 * The message a price off the exchange's fractions fails with. The form
 * recognises it and swaps in a sentence naming the step and the nearest
 * valid prices, which a schema message cannot interpolate.
 */
export const TICK_INVALID = translationKey("features.tradeLog.validation.tickInvalid");

const onTickOrEmpty = (value: string) => value === "" || isOnTick(Number(value));

const price = (requiredKey: Parameters<typeof translationKey>[0]) =>
  z
    .string()
    .min(1, translationKey(requiredKey))
    .regex(WHOLE_RUPIAH, translationKey("features.tradeLog.validation.priceInvalid"))
    .refine(
      (value) => Number(value) > 0,
      translationKey("features.tradeLog.validation.priceInvalid"),
    )
    .refine(onTickOrEmpty, TICK_INVALID);

/**
 * What the plan form accepts. Prices stay strings for the same reason the
 * onboarding balance does: an empty field must not read as zero. The screen
 * converts once the schema has passed.
 */
export const planSchema = z
  .object({
    code: z
      .string()
      .trim()
      .regex(STOCK_CODE, translationKey("features.tradeLog.validation.codeInvalid")),
    entry: price("features.tradeLog.validation.entryRequired"),
    stopLoss: price("features.tradeLog.validation.stopLossRequired"),
    target: z
      .string()
      .regex(/^\d*$/, translationKey("features.tradeLog.validation.priceInvalid"))
      .refine(onTickOrEmpty, TICK_INVALID),
    note: z
      .string()
      .max(NOTE_MAX_LENGTH, translationKey("features.tradeLog.validation.noteMax")),
  })
  .refine((plan) => Number(plan.stopLoss) < Number(plan.entry), {
    path: ["stopLoss"],
    message: translationKey("features.tradeLog.validation.stopLossAboveEntry"),
  })
  .refine((plan) => plan.target === "" || Number(plan.target) > Number(plan.entry), {
    path: ["target"],
    message: translationKey("features.tradeLog.validation.targetBelowEntry"),
  });

export type PlanFormValues = z.infer<typeof planSchema>;

/** The exit price typed when a position is closed. */
export const exitSchema = z.object({
  exitPrice: price("features.tradeLog.validation.exitRequired"),
});

export type ExitFormValues = z.infer<typeof exitSchema>;
