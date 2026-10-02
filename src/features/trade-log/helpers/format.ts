import { formatCurrency, formatNumber } from "@/shared/helpers";

/** Rupiah, grouped the Indonesian way like every amount in the app. */
export function formatRupiah(value: number): string {
  return formatCurrency(value, { language: "id" });
}

/** A percent that is already ×100: `1.5` → `1,5%`, `2` → `2%`. */
export function formatPercentValue(value: number): string {
  return `${formatNumber(value, {
    language: "id",
    maximumFractionDigits: 1,
  })}%`;
}

/** A result in R, signed: `1.84` → `+1,8R`, `-1` → `-1R`. */
export function formatR(value: number): string {
  return `${formatNumber(value, {
    language: "id",
    signDisplay: "exceptZero",
    maximumFractionDigits: 1,
  })}R`;
}

/** Reward to risk as traders write it: `2.5` → `1 : 2,5`. */
export function formatRewardRatio(ratio: number): string {
  return `1 : ${formatNumber(ratio, {
    language: "id",
    maximumFractionDigits: 1,
  })}`;
}
