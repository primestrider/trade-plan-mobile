/**
 * One stock as the trade-calculator API returns it. The backend passes
 * pasardana.id's records through untouched, so the fields are PascalCase.
 *
 * Figures the exchange has not published for a stock come back `null`: a
 * listing younger than three years has no `ThreeYear`, a loss-maker no PER.
 * Returns and ROE are fractions, not percents — a `OneDay` of `-0.0122` is a
 * 1.22% fall — while `FreeFloatPct` is already a percent.
 *
 * @see https://trade-calculator-api.vercel.app/api/stock/list
 */
export type Stock = {
  Id: number;
  Code: string;
  Name: string;

  NewSectorName: string | null;
  NewSubSectorName: string | null;
  NewIndustryName: string | null;
  NewSubIndustryName: string | null;

  Last: number;
  PrevClosingPrice: number;
  AdjustedOpenPrice: number;
  AdjustedHighPrice: number;
  AdjustedLowPrice: number;
  AdjustedAnnualHighPrice: number;
  AdjustedAnnualLowPrice: number;

  /** Shares traded today. */
  Volume: number;
  /** Rupiah traded today. */
  Value: number;
  /** Number of transactions today. */
  Frequency: number;

  OneDay: number;
  OneWeek: number;
  OneMonth: number;
  ThreeMonth: number | null;
  SixMonth: number | null;
  OneYear: number | null;
  ThreeYear: number | null;
  FiveYear: number | null;
  TenYear: number | null;
  Mtd: number;
  Ytd: number | null;

  Per: number | null;
  PerAnnualized: number | null;
  Pbr: number | null;
  PsrAnnualized: number | null;
  PcfrAnnualized: number | null;
  Roe: number | null;
  Capitalization: number;
  FreeFloatPct: number | null;

  BetaOneYear: number | null;
  StdevOneYear: number | null;

  LastDate: string;
};
