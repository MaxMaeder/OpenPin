import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api, { ApiError } from "src/comm/api";

export interface User {
  uid: string;
  email: string;
  displayName?: string | null;
  customClaims?: Record<string, unknown>;
}

interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
};

const rejectMessage = (err: unknown, fallback: string) =>
  err instanceof ApiError ? err.message : fallback;

export const login = createAsyncThunk<
  User,
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    return await api.login(payload.email, payload.password);
  } catch (err) {
    return rejectWithValue(rejectMessage(err, "Login failed"));
  }
});

export const signup = createAsyncThunk<
  User,
  { email: string; password: string },
  { rejectValue: string }
>("auth/signup", async (payload, { rejectWithValue }) => {
  try {
    return await api.signup(payload.email, payload.password);
  } catch (err) {
    return rejectWithValue(rejectMessage(err, "Signup failed"));
  }
});

export const fetchCurrentUser = createAsyncThunk<User, void, { rejectValue: string }>(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      return await api.me();
    } catch (err) {
      return rejectWithValue(rejectMessage(err, "Not authenticated"));
    }
  }
);

export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.logout();
    } catch (err) {
      return rejectWithValue(rejectMessage(err, "Logout failed"));
    }
  }
);

export const resetPassword = createAsyncThunk<void, { email: string }, { rejectValue: string }>(
  "auth/resetPassword",
  async (payload, { rejectWithValue }) => {
    try {
      await api.resetPassword(payload.email);
    } catch (err) {
      return rejectWithValue(rejectMessage(err, "Reset password failed"));
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Login failed";
      })
      // signup
      .addCase(signup.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Signup failed";
      })
      // fetchCurrentUser
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = "failed";
        state.user = null;
        state.error = action.payload ?? null;
      })
      // logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = "idle";
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = action.payload ?? "Logout failed";
      })
      // resetPassword
      .addCase(resetPassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Reset password failed";
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
