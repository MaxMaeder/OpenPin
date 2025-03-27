import { Tuple, combineReducers, configureStore } from "@reduxjs/toolkit";

import commReducer from "./slices/commSlice";
import dataReducer from "./slices/dataSlice";
import settingsReducer from "./slices/settingsSlice";
import { thunk } from "redux-thunk";

const rootReducer = combineReducers({
  comm: commReducer,
  settings: settingsReducer,
  data: dataReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: () => new Tuple(thunk),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
