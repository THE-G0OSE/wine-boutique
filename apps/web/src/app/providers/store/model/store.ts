import { combineSlices, configureStore } from "@reduxjs/toolkit";
import { cartSlice } from "@/entities/cart";
import { wineModeSlice } from "@/entities/wineMode";
import { ageGateSlice } from "@/features/age/confirmAge";
import { baseApi } from "@/shared/api";
import { loadPersisted, persistenceMiddleware } from "./persistence";

const rootReducer = combineSlices(baseApi, cartSlice, wineModeSlice, ageGateSlice);

export const makeStore = () => {
  const persisted = loadPersisted();

  return configureStore({
    reducer: rootReducer,
    preloadedState: {
      cart: { items: persisted.cartItems ?? [], isOpen: false },
      ageGate: { confirmed: persisted.ageConfirmed ?? false },
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(persistenceMiddleware.middleware).concat(baseApi.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore["dispatch"];
