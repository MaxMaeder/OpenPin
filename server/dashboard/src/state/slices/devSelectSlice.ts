import { RootState } from "../store";
import { createSlice } from "@reduxjs/toolkit";

interface DevSelectState {
  selectedDevice?: string;
}

const initialState: DevSelectState = {};

export const devSelectSlice = createSlice({
  name: "devSelect",
  initialState,
  reducers: {
    setSelectedDevice: (state, { payload: selectedDevice }) => {
      state.selectedDevice = selectedDevice;
    },
  },
});

export const { setSelectedDevice } = devSelectSlice.actions;

export const selectSelectedDevice = (state: RootState) =>
  state.devSelect.selectedDevice;

export default devSelectSlice.reducer;
