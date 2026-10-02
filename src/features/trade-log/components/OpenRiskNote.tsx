import { useTranslation } from "react-i18next";

import { AppText } from "@/shared/components";
import { useProfileStore } from "@/shared/stores";

import { formatPercentValue, formatRupiah } from "../helpers/format";
import { MAX_OPEN_RISK_PERCENT, openRisk } from "../models/plan";
import { usePlanStore } from "../stores/plan.store";

/**
 * One sentence on what every open position stands to lose together, turning
 * to a warning once that passes `MAX_OPEN_RISK_PERCENT` of the capital.
 * Renders nothing while no position is open.
 */
export function OpenRiskNote() {
  const { t } = useTranslation();
  const plans = usePlanStore((state) => state.plans);
  const balance = useProfileStore((state) => state.balance);

  const { positions, amount } = openRisk(plans);

  if (positions === 0) return null;

  const percent = balance > 0 ? (amount / balance) * 100 : 0;
  const isOver = percent > MAX_OPEN_RISK_PERCENT;

  return (
    <AppText color={isOver ? "warning" : "muted"}>
      {t(
        isOver
          ? "features.tradeLog.home.openRiskOver"
          : "features.tradeLog.home.openRisk",
        {
          amount: formatRupiah(amount),
          count: positions,
          percent: formatPercentValue(percent),
          limit: formatPercentValue(MAX_OPEN_RISK_PERCENT),
        },
      )}
    </AppText>
  );
}
