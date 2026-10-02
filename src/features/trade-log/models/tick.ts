/**
 * IDX price fractions ("fraksi harga"): the step a price may move by, which
 * widens as the price rises. An order at any other price is rejected by the
 * exchange, so a plan written at one could never be filled.
 *
 * Each band is `[from, step]`, applying from that price up to the next band.
 */
const TICK_BANDS: readonly (readonly [from: number, step: number])[] = [
  [5000, 25],
  [2000, 10],
  [500, 5],
  [200, 2],
  [0, 1],
];

/** The price step that applies at `price`. */
export function tickSize(price: number): number {
  return TICK_BANDS.find(([from]) => price >= from)?.[1] ?? 1;
}

/** Whether `price` is one the exchange accepts. */
export function isOnTick(price: number): boolean {
  return price > 0 && price % tickSize(price) === 0;
}

/**
 * The valid prices either side of `price`, for suggesting a correction.
 * Every band starts on a multiple of its own step, so both neighbours are
 * valid even at a band edge (4.995 → 4.990 and 5.000).
 */
export function nearestTicks(price: number): [lower: number, upper: number] {
  const step = tickSize(price);
  const lower = Math.floor(price / step) * step;

  return [lower, lower + step];
}
