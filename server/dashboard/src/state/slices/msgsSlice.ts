import { createContentSlice, DeviceContent } from "./createContentSlice";

export interface DeviceMessage extends DeviceContent {
  userMsg: string;
  userImgId?: string;
  assistantMsg: string;
}

export const {
  slice: msgsSlice,
  actions: msgsActions,
  selectors: msgsSelectors,
} = createContentSlice<DeviceMessage>("messages");

export default msgsSlice.reducer;
