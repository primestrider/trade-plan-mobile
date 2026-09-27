/**
 * Global Jest setup.
 *
 * Only native modules that cannot run inside Jest are mocked here; everything
 * else is exercised for real so the tests reflect actual app behavior.
 */

// `Input` calls `useResizeMode()` and `KeyboardController.dismiss()`, both of
// which need the native keyboard module. The library ships its own mock.
jest.mock("react-native-keyboard-controller", () =>
  require("react-native-keyboard-controller/jest"),
);

// `Screen` reads safe-area insets, which are measured natively. The library's
// own mock reports a fixed inset, so layout assertions stay deterministic.
jest.mock(
  "react-native-safe-area-context",
  () => require("react-native-safe-area-context/jest/mock").default,
);

// MMKV is a Nitro native module with no JS fallback, and `@/styles` now reaches
// it through the persisted theme store. This in-memory stand-in keeps the real
// storage semantics (synchronous, string values) that the app relies on.
jest.mock("react-native-mmkv", () => {
  const stores = new Map<string, Map<string, string>>();

  return {
    createMMKV: ({ id = "default" }: { id?: string } = {}) => {
      if (!stores.has(id)) stores.set(id, new Map());
      const store = stores.get(id)!;

      return {
        set: (key: string, value: string | number | boolean) =>
          store.set(key, String(value)),
        getString: (key: string) => store.get(key),
        getNumber: (key: string) => Number(store.get(key)),
        getBoolean: (key: string) => store.get(key) === "true",
        contains: (key: string) => store.has(key),
        remove: (key: string) => store.delete(key),
        delete: (key: string) => store.delete(key),
        getAllKeys: () => [...store.keys()],
        clearAll: () => store.clear(),
      };
    },
  };
});

// `@expo/ui` presents its sheet natively (SwiftUI / Compose), which Jest cannot
// do, and its host is `pointerEvents="none"` on the React Native side, which
// would swallow every press inside. The stand-in renders the content inline
// and keeps its props (`isPresented`, `onDismiss`, …) on a node tests can reach, so a user's
// swipe-to-dismiss is `fireEvent(sheet, "dismiss")`.
jest.mock("@expo/ui", () => {
  const { createElement } = require("react");
  const { View } = require("react-native");

  return {
    ...jest.requireActual("@expo/ui"),
    BottomSheet: ({ children, ...props }: any) =>
      createElement(
        View,
        { testID: "native-bottom-sheet", ...props },
        children,
      ),
    RNHostView: ({ children }: any) => children,
  };
});
