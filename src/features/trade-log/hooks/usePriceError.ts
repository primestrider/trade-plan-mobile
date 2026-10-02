import { useTranslation } from "react-i18next";

import { formatPrice } from "@/features/search/helpers/stock";
import { useFieldError } from "@/shared/hooks";

import { TICK_INVALID } from "../models/form.schema";
import { nearestTicks, tickSize } from "../models/tick";

/**
 * `useFieldError` for price fields. A price off the exchange's fractions gets
 * a sentence naming the step and the two nearest valid prices, worked out
 * from what was typed, so the fix is right there in the message.
 */
export function usePriceError() {
  const { t } = useTranslation();
  const fieldError = useFieldError();

  return (message: string | undefined, typed: string): string | undefined => {
    if (message !== TICK_INVALID) return fieldError(message);

    const price = Number(typed);
    const [lower, upper] = nearestTicks(price);

    return t(TICK_INVALID, {
      tick: formatPrice(tickSize(price)),
      lower: formatPrice(lower),
      upper: formatPrice(upper),
    });
  };
}
