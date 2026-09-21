import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react-native";
import type { ComponentType, ReactNode } from "react";

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
});
