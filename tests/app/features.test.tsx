import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen } from "@testing-library/react-native";
import type { ComponentType, ReactNode } from "react";

import FeaturesIndex from "@/app/(public)/example/features/index";
import ProductDetailScreen from "@/app/(public)/example/features/products/[id]";
import ProductsScreen from "@/app/(public)/example/features/products/index";
import SettingsScreen from "@/app/(public)/example/features/settings";
import TodosScreen from "@/app/(public)/example/features/todos";
import { useTodosStore } from "@/features/example/stores/todos.store";
import "@/plugins/i18n";
import { mmkvStorage } from "@/plugins/mmkv";
import { ToastProvider } from "@/shared/components";

/**
 * The feature screens are where the plugins meet the component library.
 * Type-checking proves the props line up; this proves each screen mounts —
 * providers, stores, query hooks and all.
 */
jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ push: jest.fn() }),
  useLocalSearchParams: () => ({ id: "1" }),
  Link: ({ children }: { children: ReactNode }) => children,
}));

jest.mock("expo-image", () => {
  const { View } = require("react-native");
  return { Image: View };
});

/** No screen may reach the network during a test. */
jest.mock("@/features/example/services/api", () => ({
  fetchProducts: jest.fn(() =>
    Promise.resolve({ products: [], total: 0, skip: 0, limit: 20 }),
  ),
  searchProducts: jest.fn(() =>
    Promise.resolve({ products: [], total: 0, skip: 0, limit: 20 }),
  ),
  fetchProductById: jest.fn(() =>
    Promise.resolve({
      id: 1,
      title: "Test Product",
      description: "A product",
      category: "misc",
      price: 9.99,
      discountPercentage: 0,
      rating: 4.5,
      stock: 3,
      thumbnail: "https://example.com/a.png",
      images: [],
      reviews: [],
    }),
  ),
  login: jest.fn(),
}));

function renderScreen(Component: ComponentType) {
  // Retries would keep a failed query pending past the end of the test.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Component />
      </ToastProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  mmkvStorage.clearAll();
  act(() => {
    useTodosStore.setState({ todos: [] });
  });
});

describe("feature example screens", () => {
  it("renders the feature index with every feature listed", () => {
    renderScreen(FeaturesIndex);

    expect(screen.getByText("Sign in")).toBeOnTheScreen();
    expect(screen.getByText("Products")).toBeOnTheScreen();
    expect(screen.getByText("Todos")).toBeOnTheScreen();
    expect(screen.getByText("Settings")).toBeOnTheScreen();
  });

  it("renders the products screen", () => {
    renderScreen(ProductsScreen);

    expect(screen.getByText("Products")).toBeOnTheScreen();
    expect(
      screen.getByPlaceholderText("Search products"),
    ).toBeOnTheScreen();
  });

  it("shows a skeleton before the product arrives", () => {
    renderScreen(ProductDetailScreen);

    // The tabs belong to the loaded product, so their absence is the proof.
    expect(screen.queryByText("Overview")).toBeNull();
  });

  it("renders the product detail screen once the query resolves", async () => {
    renderScreen(ProductDetailScreen);

    expect(await screen.findByText("Overview")).toBeOnTheScreen();
    expect(screen.getByText("Specs")).toBeOnTheScreen();
    expect(screen.getByText("Test Product")).toBeOnTheScreen();
  });

  it("renders the todos screen with its empty state", () => {
    renderScreen(TodosScreen);

    expect(screen.getByText("Nothing to do")).toBeOnTheScreen();
    expect(screen.getByText("Add")).toBeOnTheScreen();
  });

  it("lists a persisted todo", () => {
    act(() =>
      useTodosStore.setState({
        todos: [
          {
            id: "1",
            title: "Persisted task",
            done: false,
            createdAt: new Date().toISOString(),
          },
        ],
      }),
    );

    renderScreen(TodosScreen);

    expect(screen.getByText("Persisted task")).toBeOnTheScreen();
  });

  it("renders the settings screen with its formatting preview", () => {
    renderScreen(SettingsScreen);

    expect(screen.getByText("Notifications")).toBeOnTheScreen();
    expect(screen.getByText("Formatting preview")).toBeOnTheScreen();
  });
});
