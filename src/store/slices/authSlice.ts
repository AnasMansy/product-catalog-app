import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  clearStoredAuth,
  createDemoSession,
  createDummyJsonSession,
  persistAuth,
  readDemoUser,
  readStoredAuth,
} from "@/lib/authStorage";
import { loginUser } from "@/lib/api";
import type { AppDispatch } from "@/store/store";
import type {
  AuthState,
  LoginCredentials,
  StoredAuthSession,
} from "@/types/auth";

const initialState: AuthState = {
  token: null,
  user: null,
  status: "idle",
  error: null,
  isHydrated: false,
};

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
    const demoUser = readDemoUser();
    const normalizedIdentifier = credentials.username.trim().toLowerCase();

    if (demoUser) {
      const matchesDemoIdentity =
        normalizedIdentifier === demoUser.username.toLowerCase() ||
        normalizedIdentifier === demoUser.email.toLowerCase();

      if (matchesDemoIdentity) {
        if (demoUser.password !== credentials.password) {
          throw new Error(
            "The password for your registered demo account is incorrect.",
          );
        }

        const demoSession = createDemoSession(demoUser);
        persistAuth(demoSession);
        return demoSession;
      }
    }

    const response = await loginUser(credentials);
    const session = createDummyJsonSession(response);

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
