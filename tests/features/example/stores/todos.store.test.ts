import { act } from "@testing-library/react-native";

import {
  filterTodos,
  todoProgress,
  useTodosStore,
  type ExampleTodo,
} from "@/features/example/stores/todos.store";
import { mmkvStorage } from "@/plugins/mmkv";

function todos(): ExampleTodo[] {
  return useTodosStore.getState().todos;
}

function titles(): string[] {
  return todos().map((todo) => todo.title);
}

beforeEach(() => {
  mmkvStorage.clearAll();
  act(() => useTodosStore.setState({ todos: [] }));
});

describe("useTodosStore", () => {
  it("starts empty", () => {
    expect(todos()).toEqual([]);
  });

  it("adds a todo as not done", () => {
    act(() => useTodosStore.getState().add("Buy milk"));

    expect(todos()).toHaveLength(1);
    expect(todos()[0]).toEqual(
      expect.objectContaining({ title: "Buy milk", done: false }),
    );
  });

  it("puts the newest todo first", () => {
    act(() => {
      useTodosStore.getState().add("First");
      useTodosStore.getState().add("Second");
    });

    expect(titles()).toEqual(["Second", "First"]);
  });

  it("trims the title", () => {
    act(() => useTodosStore.getState().add("   Buy milk   "));

    expect(titles()).toEqual(["Buy milk"]);
  });

  it("gives every todo a distinct id, even within one millisecond", () => {
    act(() => {
      useTodosStore.getState().add("One");
      useTodosStore.getState().add("Two");
      useTodosStore.getState().add("Three");
    });

    const ids = todos().map((todo) => todo.id);

    expect(new Set(ids).size).toBe(3);
  });

  it("toggles a todo without touching the others", () => {
    act(() => {
      useTodosStore.getState().add("Keep");
      useTodosStore.getState().add("Flip");
    });

    const target = todos().find((todo) => todo.title === "Flip")!;
    act(() => useTodosStore.getState().toggle(target.id));

    expect(todos().find((todo) => todo.title === "Flip")?.done).toBe(true);
    expect(todos().find((todo) => todo.title === "Keep")?.done).toBe(false);
  });

  it("toggles back", () => {
    act(() => useTodosStore.getState().add("Flip"));
    const { id } = todos()[0];

    act(() => useTodosStore.getState().toggle(id));
    act(() => useTodosStore.getState().toggle(id));

    expect(todos()[0].done).toBe(false);
  });

  it("ignores a toggle for an unknown id", () => {
    act(() => useTodosStore.getState().add("Keep"));

    act(() => useTodosStore.getState().toggle("does-not-exist"));

    expect(todos()[0].done).toBe(false);
  });

  it("removes only the named todo", () => {
    act(() => {
      useTodosStore.getState().add("Keep");
      useTodosStore.getState().add("Drop");
    });

    const target = todos().find((todo) => todo.title === "Drop")!;
    act(() => useTodosStore.getState().remove(target.id));

    expect(titles()).toEqual(["Keep"]);
  });

  it("clears completed todos and keeps the rest", () => {
    act(() => {
      useTodosStore.getState().add("Active");
      useTodosStore.getState().add("Done");
    });

    const done = todos().find((todo) => todo.title === "Done")!;
    act(() => useTodosStore.getState().toggle(done.id));
    act(() => useTodosStore.getState().clearCompleted());

    expect(titles()).toEqual(["Active"]);
  });

  it("persists to storage so a restart keeps the list", () => {
    act(() => useTodosStore.getState().add("Survives"));

    const persisted = mmkvStorage.getString("example.todos");

    expect(persisted).toBeDefined();
    expect(persisted).toContain("Survives");
  });
});

describe("filterTodos", () => {
  const list: ExampleTodo[] = [
    { id: "1", title: "Active", done: false, createdAt: "" },
    { id: "2", title: "Done", done: true, createdAt: "" },
  ];

  it("returns everything for all", () => {
    expect(filterTodos(list, "all")).toHaveLength(2);
  });

  it("returns only unfinished for active", () => {
    expect(filterTodos(list, "active").map((todo) => todo.title)).toEqual(["Active"]);
  });

  it("returns only finished for done", () => {
    expect(filterTodos(list, "done").map((todo) => todo.title)).toEqual(["Done"]);
  });
});

describe("todoProgress", () => {
  it("reports zero for an empty list without dividing by zero", () => {
    expect(todoProgress([])).toEqual({ done: 0, total: 0, ratio: 0 });
  });

  it("reports the completed share", () => {
    const list: ExampleTodo[] = [
      { id: "1", title: "a", done: true, createdAt: "" },
      { id: "2", title: "b", done: false, createdAt: "" },
      { id: "3", title: "c", done: true, createdAt: "" },
      { id: "4", title: "d", done: false, createdAt: "" },
    ];

    expect(todoProgress(list)).toEqual({ done: 2, total: 4, ratio: 0.5 });
  });
});
