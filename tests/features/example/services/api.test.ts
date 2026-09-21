import {
  fetchProductById,
  fetchProducts,
  login,
  searchProducts,
} from "@/features/example/services/api";
import axiosInstance from "@/plugins/axios";
import type { CustomAxiosRequestConfig } from "@/shared/models";

jest.mock("@/plugins/axios", () => ({
  __esModule: true,
  default: { request: jest.fn() },
}));

const request = axiosInstance.request as jest.MockedFunction<
  typeof axiosInstance.request
>;

/** The config the service handed to Axios. */
function sentConfig(): CustomAxiosRequestConfig {
  return request.mock.calls[0][0] as CustomAxiosRequestConfig;
}

function resolveWith(data: unknown) {
  request.mockResolvedValueOnce({ data } as never);
}

beforeEach(() => {
  request.mockReset();
});

describe("fetchProducts", () => {
  it("requests one page and unwraps the envelope", async () => {
    const payload = { products: [{ id: 1 }], total: 100, skip: 0, limit: 20 };
    resolveWith(payload);

    const result = await fetchProducts({ limit: 20, skip: 0 });

    expect(result).toBe(payload);
  });

  it("passes pagination through as query params", async () => {
    resolveWith({ products: [], total: 0, skip: 40, limit: 20 });

    await fetchProducts({ limit: 20, skip: 40 });

    expect(sentConfig()).toEqual(
      expect.objectContaining({
        url: "https://dummyjson.com/products",
        method: "GET",
        params: { limit: 20, skip: 40 },
      }),
    );
  });

  it("sends no token to a public endpoint", async () => {
    resolveWith({ products: [], total: 0, skip: 0, limit: 20 });

    await fetchProducts({ limit: 20, skip: 0 });

    expect(sentConfig().meta).toEqual({ requiresAuth: false });
  });
});

describe("searchProducts", () => {
  it("sends the query as q, alongside pagination", async () => {
    resolveWith({ products: [], total: 0, skip: 0, limit: 20 });

    await searchProducts({ query: "phone", limit: 20, skip: 0 });

    expect(sentConfig()).toEqual(
      expect.objectContaining({
        url: "https://dummyjson.com/products/search",
        params: { q: "phone", limit: 20, skip: 0 },
      }),
    );
  });

  it("does not leak the raw query key into the params", async () => {
    resolveWith({ products: [], total: 0, skip: 0, limit: 20 });

    await searchProducts({ query: "phone", limit: 20, skip: 0 });

    expect(sentConfig().params).not.toHaveProperty("query");
  });
});

describe("fetchProductById", () => {
  it("puts the id in the path", async () => {
    resolveWith({ id: 42, title: "Thing" });

    const result = await fetchProductById(42);

    expect(sentConfig().url).toBe("https://dummyjson.com/products/42");
    expect(result).toEqual({ id: 42, title: "Thing" });
  });
});

describe("login", () => {
  it("posts the credentials", async () => {
    resolveWith({ id: 1, username: "emilys", accessToken: "t" });

    await login({ username: "emilys", password: "emilyspass" });

    expect(sentConfig()).toEqual(
      expect.objectContaining({
        url: "https://dummyjson.com/auth/login",
        method: "POST",
        data: { username: "emilys", password: "emilyspass" },
      }),
    );
  });

  it("opts out of auth, so a stale token cannot break a valid password", async () => {
    resolveWith({ id: 1, username: "emilys", accessToken: "t" });

    await login({ username: "emilys", password: "emilyspass" });

    expect(sentConfig().meta).toEqual({ requiresAuth: false });
  });

  it("lets an API error reach the caller", async () => {
    request.mockRejectedValueOnce({
      message: "Invalid credentials",
      status: 400,
      isNetworkError: false,
    });

    await expect(
      login({ username: "emilys", password: "wrong" }),
    ).rejects.toEqual(
      expect.objectContaining({ message: "Invalid credentials", status: 400 }),
    );
  });
});
