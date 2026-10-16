import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { cartActions, type CartItem } from "@/entities/cart";
import { confirmAge } from "@/features/age/confirmAge";

/**
 * Клиентское состояние, которое переживает перезагрузку: позиции корзины и ответ «мне есть 18».
 * Версия в ключе — чтобы при смене формы данных старые записи просто игнорировались.
 */
const STORAGE_KEY = "wine-boutique:v1";

interface IPersisted {
  cartItems: CartItem[];
  ageConfirmed: boolean;
}

interface IPersistableState {
  cart: { items: CartItem[] };
  ageGate: { confirmed: boolean };
}

export const loadPersisted = (): Partial<IPersisted> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as Partial<IPersisted>;
    return {
      cartItems: Array.isArray(data.cartItems) ? data.cartItems : undefined,
      ageConfirmed: data.ageConfirmed === true,
    };
  } catch {
    return {};
  }
};

export const persistenceMiddleware = createListenerMiddleware();

persistenceMiddleware.startListening({
  matcher: isAnyOf(...Object.values(cartActions), confirmAge),
  effect: (_, api) => {
    const state = api.getState() as IPersistableState;
    const data: IPersisted = { cartItems: state.cart.items, ageConfirmed: state.ageGate.confirmed };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // хранилище недоступно (приватный режим) — просто не запоминаем
    }
  },
});
