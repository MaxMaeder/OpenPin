import api, { ApiError } from "../../comm/api";
import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";

import { RootState } from "../store";
import { jwtDecode } from "jwt-decode";

export interface UserCredentials {
  username: string;
  password: string;
}

export const loginUser = createAsyncThunk<string, UserCredentials>(
  "users/loginUser",
  async ({ username, password }: { username: string; password: string }) => {
    return await api.loginUser(username, password);
  }
);

interface UserState {
  token?: string;
  isAuthenticating: boolean;
  authenticationError: string;
}

const initialState: UserState = {
  isAuthenticating: false,
  authenticationError: "",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logoutUser: (state) => {
      delete state.token;
      state.authenticationError = "";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginUser.pending, (state) => {
      state.authenticationError = "";
      state.isAuthenticating = true;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.token = action.payload;
      state.isAuthenticating = false;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.authenticationError = (action.error as ApiError).message;
      state.isAuthenticating = false;
    });
  },
});

export const { logoutUser } = userSlice.actions;

export const selectAuthToken = (state: RootState) => state.user.token;
export const selectUserId = createSelector([selectAuthToken], (token) => {
  if (!token) return;
  return jwtDecode(token);
});
export const selectIsAuthenticating = (state: RootState) =>
  state.user.isAuthenticating;
export const selectAuthError = (state: RootState) =>
  state.user.authenticationError;
export const selectIsAuthenticated = (state: RootState) =>
  state.user.token !== undefined;

export default userSlice.reducer;
