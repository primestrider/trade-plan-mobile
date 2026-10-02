import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { storageKeys } from "@/plugins/mmkv";
import { zustandStorage } from "@/plugins/mmkv/zustand";

import type { PlanPrices, TradePlan } from "../models/plan";

export type NewPlan = PlanPrices & Pick<TradePlan, "code" | "name" | "lots" | "note">;

type PlanState = {
  plans: TradePlan[];
  /** Stores a plan as `planned` and returns its id. */
  addPlan: (plan: NewPlan) => string;
  /** Replaces the prices and size; the status and history stay. */
  updatePlan: (id: string, changes: NewPlan) => void;
  /** The shares were bought: the plan's risk now counts as open. */
  openPlan: (id: string) => void;
  /** The shares were sold at `exitPrice`. */
  closePlan: (id: string, exitPrice: number) => void;
  removePlan: (id: string) => void;
  /** Swaps every plan for a restored set; see the backup feature. */
  replacePlans: (plans: TradePlan[]) => void;
};

const newId = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const now = () => new Date().toISOString();

/**
 * Every trade plan the user has written, kept on the device.
 *
 * The plan list, the home screen and the plan pages all read from here, so a
 * plan opened or closed on one is current on the others without refetching.
 *
 * @example
 * const plans = usePlanStore((state) => state.plans);
 */
export const usePlanStore = create<PlanState>()(
  persist(
    (set) => {
      const patch = (id: string, changes: Partial<TradePlan>) =>
        set((state) => ({
          plans: state.plans.map((plan) =>
            plan.id === id ? { ...plan, ...changes } : plan,
          ),
        }));

      return {
        plans: [],

        addPlan: (plan) => {
          const id = newId();

          set((state) => ({
            plans: [
              ...state.plans,
              {
                ...plan,
                id,
                status: "planned",
                createdAt: now(),
                openedAt: null,
                closedAt: null,
                exitPrice: null,
              },
            ],
          }));

          return id;
        },

        updatePlan: (id, changes) => patch(id, changes),

        openPlan: (id) => patch(id, { status: "open", openedAt: now() }),

        closePlan: (id, exitPrice) =>
          patch(id, { status: "closed", closedAt: now(), exitPrice }),

        replacePlans: (plans) => set({ plans }),

        removePlan: (id) =>
          set((state) => ({
            plans: state.plans.filter((plan) => plan.id !== id),
          })),
      };
    },
    {
      name: storageKeys.trade.plans,
      storage: createJSONStorage(() => zustandStorage),
      // v1 added `note`; plans saved before it get an empty one.
      version: 1,
      migrate: (persisted) => {
        const state = persisted as { plans?: Partial<TradePlan>[] };

        return {
          ...state,
          plans: (state.plans ?? []).map((plan) => ({ note: "", ...plan })),
        } as PlanState;
      },
    },
  ),
);
