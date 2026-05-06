import {
  afterEach,
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { configureStore } from "@reduxjs/toolkit";

import {
  AUTH_STORAGE_KEY,
  DEMO_USER_STORAGE_KEY,
} from "@/lib/authStorage";
import authReducer, {
  hydrateAuth,
  login,
  logoutAndClearSession,
} from "@/store/slices/authSlice";

function createStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
  });
}

const originalFetch = globalThis.fetch;
const mockFetch = jest.fn();

describe("auth slice", () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, "fetch", {
      writable: true,
      value: mockFetch,
    });
  });

  beforeEach(() => {
    window.localStorage.clear();
    mockFetch.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    Object.defineProperty(globalThis, "fetch", {
      writable: true,
      value: originalFetch,
    });
  });

  it("hydrates auth state from localStorage", async () => {
    window.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        token: "persisted-token",
        provider: "dummyjson",
        user: {
          id: 1,
          username: "emilys",
          email: "emily@example.com",
          firstName: "Emily",
          lastName: "Stone",
        },
      }),
    );

    const store = createStore();
    await store.dispatch(hydrateAuth());

    expect(store.getState().auth.token).toBe("persisted-token");
    expect(store.getState().auth.user?.username).toBe("emilys");
    expect(store.getState().auth.isHydrated).toBe(true);
  });

  it("logs in with the registered local demo user and persists a demo token", async () => {
    jest.spyOn(Date, "now").mockReturnValue(1700000000000);
    window.localStorage.setItem(
      DEMO_USER_STORAGE_KEY,
      JSON.stringify({
        id: 5,
        name: "Alex Johnson",
        username: "alexdemo",
        email: "alex@example.com",
        password: "supersecret",
        firstName: "Alex",
        lastName: "Johnson",
        createdAt: 1699999999000,
      }),
    );

    const store = createStore();
    const action = await store.dispatch(
      login({
        username: "alex@example.com",
        password: "supersecret",
      }),
    );

    expect(login.fulfilled.match(action)).toBe(true);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(store.getState().auth.token).toBe("demo-token-1700000000000");
    expect(store.getState().auth.user?.username).toBe("alexdemo");

    const savedSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
    expect(savedSession).not.toBeNull();
    expect(savedSession).toContain("demo-token-1700000000000");
    expect(savedSession).toContain('"provider":"demo"');
  });

  it("falls back to DummyJSON login when no matching demo user exists", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 9,
        username: "emilys",
        email: "emily@example.com",
        firstName: "Emily",
        lastName: "Stone",
        accessToken: "api-token-123",
        refreshToken: "refresh-token-123",
      }),
    } as Response);

    const store = createStore();
    const action = await store.dispatch(
      login({
        username: "emilys",
        password: "emilyspass",
        expiresInMins: 60,
      }),
    );

    expect(login.fulfilled.match(action)).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://dummyjson.com/auth/login",
      expect.objectContaining({
        method: "POST",
        cache: "no-store",
        credentials: "include",
      }),
    );
    expect(store.getState().auth.token).toBe("api-token-123");
    expect(store.getState().auth.user?.firstName).toBe("Emily");
    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toContain(
      '"provider":"dummyjson"',
    );
  });

  it("clears stored auth data on logout", async () => {
    window.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        token: "persisted-token",
        provider: "dummyjson",
        user: {
          id: 1,
          username: "emilys",
          email: "emily@example.com",
          firstName: "Emily",
          lastName: "Stone",
        },
      }),
    );

    const store = createStore();
    await store.dispatch(hydrateAuth());
    store.dispatch(logoutAndClearSession());

    expect(store.getState().auth.token).toBeNull();
    expect(store.getState().auth.user).toBeNull();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });
});
