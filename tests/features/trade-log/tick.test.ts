import { isOnTick, nearestTicks, tickSize } from "@/features/trade-log/models/tick";

it.each([
  [50, 1],
  [199, 1],
  [200, 2],
  [498, 2],
  [500, 5],
  [1995, 5],
  [2000, 10],
  [4990, 10],
  [5000, 25],
  [9025, 25],
])("prices at %p move in steps of %p", (price, step) => {
  expect(tickSize(price)).toBe(step);
});

it("accepts only prices on the exchange's fractions", () => {
  expect(isOnTick(9025)).toBe(true);
  expect(isOnTick(9010)).toBe(false);
  expect(isOnTick(2005)).toBe(false);
  expect(isOnTick(201)).toBe(false);
  expect(isOnTick(0)).toBe(false);
});

it("suggests the valid prices either side, even at a band edge", () => {
  expect(nearestTicks(9010)).toEqual([9000, 9025]);
  expect(nearestTicks(4995)).toEqual([4990, 5000]);
  expect(nearestTicks(201)).toEqual([200, 202]);
});
