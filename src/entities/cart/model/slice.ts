import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ApiSchemas } from "@/shared/api";

/** Снимок вина на момент добавления: корзина живёт на клиенте до брони */
export type CartWine = ApiSchemas["WineSummary"];

export interface CartItem {
  wine: CartWine;
  qty: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

/** Больше бутылок одного вина в бронь не берём (как на карточке вина в дизайне) */
export const CART_MAX_QTY = 12;

const initialState: CartState = { items: [], isOpen: false };

const clampQty = (qty: number) => Math.min(CART_MAX_QTY, Math.max(1, qty));

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(state, { payload }: PayloadAction<{ wine: CartWine; qty?: number }>) {
      const item = state.items.find(({ wine }) => wine.id === payload.wine.id);
      if (item) item.qty = clampQty(item.qty + (payload.qty ?? 1));
      else state.items.push({ wine: payload.wine, qty: clampQty(payload.qty ?? 1) });
    },
    changeQty(state, { payload }: PayloadAction<{ wineId: string; delta: number }>) {
      const item = state.items.find(({ wine }) => wine.id === payload.wineId);
      if (item) item.qty = clampQty(item.qty + payload.delta);
    },
    removeItem(state, { payload: wineId }: PayloadAction<string>) {
      state.items = state.items.filter(({ wine }) => wine.id !== wineId);
    },
    clear(state) {
      state.items = [];
    },
    open(state) {
      state.isOpen = true;
    },
    close(state) {
      state.isOpen = false;
    },
  },
  selectors: {
    selectItems: (state) => state.items,
    selectCount: (state) => state.items.reduce((sum, { qty }) => sum + qty, 0),
    selectIsOpen: (state) => state.isOpen,
    /** Сумма брони; null, пока хоть у одного вина нет цены */
    selectTotal: (state) =>
      state.items.every(({ wine }) => wine.price !== null)
        ? state.items.reduce((sum, { wine, qty }) => sum + (wine.price ?? 0) * qty, 0)
        : null,
    selectHasWine: (state, wineId: string) => state.items.some(({ wine }) => wine.id === wineId),
  },
});

export const cartActions = cartSlice.actions;
export const cartSelectors = cartSlice.selectors;
