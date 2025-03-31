import { createContentSlice, DeviceContent } from "./createContentSlice";

export interface DeviceNote extends DeviceContent {
  title: string;
  content: string;
}

export const {
  slice: notesSlice,
  actions: notesActions,
  selectors: notesSelectors,
} = createContentSlice<DeviceNote>("notes");

export default notesSlice.reducer;
