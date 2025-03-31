import { configureStore } from "@reduxjs/toolkit";

import commReducer from "./slices/commSlice";
import dataReducer from "./slices/dataSlice";
import settingsReducer from "./slices/settingsSlice";

import notesReducer from "./slices/notesSlice";
import capturesReducer from "./slices/capturesSlice";
import messagesReducer from "./slices/msgsSlice";

export const store = configureStore({
  reducer: {
    comm: commReducer,
    settings: settingsReducer,
    data: dataReducer,
    notes: notesReducer,
    captures: capturesReducer,
    messages: messagesReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
