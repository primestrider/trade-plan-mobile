import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "@/plugins/mmkv/zustand";

export type ExampleTodo = {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
};

export type TodoFilter = "all" | "active" | "done";

type TodosState = {
  todos: ExampleTodo[];
  add: (title: string) => void;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clearCompleted: () => void;
};

/**
 * Disambiguates ids for todos added within the same millisecond, which a fast
 * tap or a test loop does routinely.
 */
let sequence = 0;

/**
 * Todos, persisted to MMKV.
 *
 * The one example that needs no network: it is here so there is always a
 * screen that works on a plane, and so persistence is visible — add an item,
 * kill the app, reopen it.
 *
 * @example
 * const todos = useTodosStore((state) => state.todos);
 */
export const useTodosStore = create<TodosState>()(
  persist(
    (set) => ({
      todos: [],

      add: (title) =>
        set((state) => ({
          todos: [
            {
              id: `${Date.now()}-${sequence++}`,
              title: title.trim(),
              done: false,
              createdAt: new Date().toISOString(),
            },
            ...state.todos,
          ],
        })),

      toggle: (id) =>
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, done: !todo.done } : todo,
          ),
        })),

      remove: (id) =>
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        })),

      clearCompleted: () =>
        set((state) => ({
          todos: state.todos.filter((todo) => !todo.done),
        })),
    }),
    {
      name: "example.todos",
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);

/** Narrows the list to what the active filter shows. */
export function filterTodos(
  todos: ExampleTodo[],
  filter: TodoFilter,
): ExampleTodo[] {
  switch (filter) {
    case "all":
      return todos;
    case "active":
      return todos.filter((todo) => !todo.done);
    case "done":
      return todos.filter((todo) => todo.done);
  }
}

/** How many todos are done, and out of how many. */
export function todoProgress(todos: ExampleTodo[]): {
  done: number;
  total: number;
  ratio: number;
} {
  const done = todos.filter((todo) => todo.done).length;

  return {
    done,
    total: todos.length,
    // An empty list is 0 done of 0 — not a division by zero.
    ratio: todos.length === 0 ? 0 : done / todos.length,
  };
}
