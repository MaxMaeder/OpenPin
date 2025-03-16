import { Tuple, combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";

import commReducer from "./slices/commSlice";
import dataReducer from "./slices/dataSlice";
import devSelectReducer from "./slices/devSelectSlice";
import settingsReducer from "./slices/settingsSlice";
import storage from "redux-persist/lib/storage";
import { thunk } from "redux-thunk";
import userReducer from "./slices/userSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"],
};

const rootReducer = combineReducers({
  user: userReducer,
  comm: commReducer,
  settings: settingsReducer,
  data: dataReducer,
  devSelect: devSelectReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: () => new Tuple(thunk),
});
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
