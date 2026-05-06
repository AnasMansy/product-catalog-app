import { configureStore } from "@reduxjs/toolkit";
import type { Action, ThunkAction } from "@reduxjs/toolkit";

import authReducer from "@/store/slices/authSlice";
import productsReducer from "@/store/slices/productsSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      products: productsReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action
>;
