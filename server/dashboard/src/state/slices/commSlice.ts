import { RootState } from "../store";
import { createSlice } from "@reduxjs/toolkit";

interface CommState {
  isConnected: boolean;
  isLoading: boolean;
  connectionError?: string;
}

const initialState: CommState = {
  isConnected: false,
  isLoading: false
};

export const commSlice = createSlice({
  name: "comm",
  initialState,
  reducers: {
    setConnected: (state, { payload: isConnected }) => {
      state.isConnected = isConnected;
    },
    setLoading: (state, { payload: isLoading }) => {
      state.isLoading = isLoading;
    },
    setConnError: (state, { payload: connectionError }) => {
      state.connectionError = connectionError;
    },
    clearConnError: (state) => {
      delete state.connectionError;
    },
  },
});

export const { setConnected, setLoading, setConnError, clearConnError } = commSlice.actions;

export const selectIsConnected = (state: RootState) =>
  state.comm.isConnected;
export const selectIsLoading = (state: RootState) =>
  state.comm.isLoading;
export const selectIsLoaded = (state: RootState) =>
  state.comm.isConnected && !state.comm.isLoading;
export const selectConnError = (state: RootState) => state.comm.connectionError;

export default commSlice.reducer;
