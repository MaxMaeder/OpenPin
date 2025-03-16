import { RootState } from "../store";
import { createSlice } from "@reduxjs/toolkit";

interface CommState {
  isConnected: boolean;
  connectionError?: string;
}

const initialState: CommState = {
  isConnected: false,
};

export const commSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setConnected: (state, { payload: isConnected }) => {
      state.isConnected = isConnected;
    },
    setConnError: (state, { payload: connectionError }) => {
      state.connectionError = connectionError;
    },
    clearConnError: (state) => {
      delete state.connectionError;
    },
  },
});

export const { setConnected, setConnError, clearConnError } = commSlice.actions;

export const selectIsConnected = (state: RootState) =>
  state.comm.connectionError;
export const selectConnError = (state: RootState) => state.comm.connectionError;

export default commSlice.reducer;
