import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { loginUser } from "@/lib/api";
import type { AppDispatch } from "@/store/store";
import type { AuthState, LoginCredentials, User } from "@/types/auth";

const AUTH_STORAGE_KEY = "product-catalog-auth";

interface StoredAuthSession {
  token: string;
  user: User;
}

const initialState: AuthState = {
  token: null,
  user: null,
  status: "idle",
  error: null,
  isHydrated: false,
};

function readStoredAuth(): StoredAuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as StoredAuthSession;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function persistAuth(session: StoredAuthSession) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

function clearStoredAuth() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to authenticate right now.";
}

export const hydrateAuth = createAsyncThunk(
  "auth/hydrateAuth",
  async () => readStoredAuth(),
);

export const login = createAsyncThunk<
  StoredAuthSession,
  LoginCredentials,
  { rejectValue: string }
>("auth/login", async (credentials, thunkApi) => {
  try {
    const response = await loginUser(credentials);
    const session = {
      token: response.accessToken,
      user: {
        id: response.id,
        username: response.username,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        gender: response.gender,
        image: response.image,
      },
    };

    persistAuth(session);
    return session;
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorMessage(error));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.status = "idle";
      state.error = null;
      state.isHydrated = true;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        state.token = action.payload?.token ?? null;
        state.user = action.payload?.user ?? null;
        state.isHydrated = true;
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.isHydrated = true;
      })
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isHydrated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Unable to log in.";
        state.isHydrated = true;
      });
  },
});

export const logoutAndClearSession = () => (dispatch: AppDispatch) => {
  clearStoredAuth();
  dispatch(authSlice.actions.logout());
};

export const { clearAuthError, logout } = authSlice.actions;

export default authSlice.reducer;
