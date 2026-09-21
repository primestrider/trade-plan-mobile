import { dummyJsonAuthAdapter } from "@/features/example/services/auth.adapter";
import { login, refreshSession } from "@/features/example/services/api";

jest.mock("@/features/example/services/api", () => ({
  login: jest.fn(),
  refreshSession: jest.fn(),
}));

const loginMock = login as jest.MockedFunction<typeof login>;
const refreshMock = refreshSession as jest.MockedFunction<typeof refreshSession>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("dummyJsonAuthAdapter", () => {
  it("splits the login response into a profile and a token pair", async () => {
    loginMock.mockResolvedValue({
      id: 1,
      username: "emilys",
      email: "emily@example.com",
      firstName: "Emily",
      lastName: "Johnson",
      gender: "female",
      image: "https://example.com/emily.png",
      accessToken: "access-1",
      refreshToken: "refresh-1",
    });

    const result = await dummyJsonAuthAdapter.signIn({
      username: "emilys",
      password: "emilyspass",
    });

    expect(result.user).toEqual({
      id: 1,
      username: "emilys",
      email: "emily@example.com",
      firstName: "Emily",
      lastName: "Johnson",
      image: "https://example.com/emily.png",
    });
    expect(result.tokens).toEqual({
      accessToken: "access-1",
      refreshToken: "refresh-1",
    });
  });

  it("keeps no token on the profile", async () => {
    loginMock.mockResolvedValue({
      id: 1,
      username: "emilys",
      email: "emily@example.com",
      firstName: "Emily",
      lastName: "Johnson",
      gender: "female",
      image: "https://example.com/emily.png",
      accessToken: "access-1",
      refreshToken: "refresh-1",
    });

    const { user } = await dummyJsonAuthAdapter.signIn({
      username: "emilys",
      password: "emilyspass",
    });

    expect(user).not.toHaveProperty("accessToken");
    expect(user).not.toHaveProperty("refreshToken");
  });

  it("exchanges a refresh token for a new pair", async () => {
    refreshMock.mockResolvedValue({
      accessToken: "access-2",
      refreshToken: "refresh-2",
    });

    await expect(dummyJsonAuthAdapter.refresh("refresh-1")).resolves.toEqual({
      accessToken: "access-2",
      refreshToken: "refresh-2",
    });
    expect(refreshMock).toHaveBeenCalledWith("refresh-1");
  });
});
