import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";

import { RootState } from "../store";

export interface DeviceData {
  id: string;
  latestImage?: string;
  latestImageCaptured?: number;
  lastConnected: number;
  latitude: number;
  longitude: number;
  locationCertainty: "low" | "high";
  battery: number;
}

const initialData: Omit<DeviceData, "id"> = {
  lastConnected: 0,
  latitude: 0,
  longitude: 0,
  locationCertainty: "low",
  battery: 0,
};

export const dataAdapter = createEntityAdapter<DeviceData>();

const initialState = dataAdapter.getInitialState(initialData);

export const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    upsertDataById: dataAdapter.upsertOne,
    updateDataById: dataAdapter.updateOne,
  },
});

export const { upsertDataById, updateDataById } = dataSlice.actions;

export const { selectById: selectDataById } = dataAdapter.getSelectors(
  (state: RootState) => state.data
);

export default dataSlice.reducer;
