import type { ApiSchemas } from "@/shared/api";
import {
  DEMO_GUEST,
  demoCell,
  demoCertificates,
  demoFavorites,
  demoLoyalty,
  demoMonthly,
  demoProfile,
  demoReservations,
  demoTastings,
  WELCOME_BONUS,
} from "@wine/demo-data";

type S = ApiSchemas;

export interface MockAccount {
  profile: S["Profile"];
  reservations: S["MyReservations"];
  tastings: S["MyTastings"];
  cell: S["MyCell"] | null;
  monthly: S["MonthlySubscription"] | null;
  certificates: S["MyCertificate"][];
  loyalty: S["Loyalty"];
  favorites: S["WineSummary"][];
}

const KEY = "wine-boutique:mock-account:";

/** Кабинет мок-сервера: Анне (код 2015) — данные макета, новому гостю — пустой кабинет с приветственными бонусами */
const initial = (user: S["SessionUser"]): MockAccount => {
  const now = new Date();
  if (user.id === DEMO_GUEST.id) {
    return {
      profile: demoProfile(now),
      reservations: demoReservations(now),
      tastings: demoTastings(now),
      cell: demoCell(now),
      monthly: demoMonthly(),
      certificates: demoCertificates(now),
      loyalty: demoLoyalty(now),
      favorites: demoFavorites(),
    };
  }
  return {
    profile: {
      ...demoProfile(now),
      id: user.id,
      name: user.name,
      phone: null,
      email: null,
      birthDate: null,
      cardNumber: user.cardNumber,
      favoriteBoutiqueId: null,
      tastes: [],
      sessions: [{ id: "this", device: "Этот браузер", current: true, lastSeenAt: now.toISOString() }],
    },
    reservations: { active: [], history: [] },
    tastings: [],
    cell: null,
    monthly: null,
    certificates: [],
    loyalty: {
      balance: WELCOME_BONUS,
      level: "guest",
      bottles: 0,
      nextLevel: { level: "connoisseur", bottles: 6 },
      history: [{ id: "welcome", at: now.toISOString(), title: "Приветственные бонусы", amount: WELCOME_BONUS }],
    },
    favorites: [],
  };
};

/** Состояние кабинета вошедшего гостя — в sessionStorage, чтобы изменения переживали F5. Только для моков */
export const mockAccount = {
  get(user: S["SessionUser"]): MockAccount {
    try {
      const stored = sessionStorage.getItem(KEY + user.id);
      if (stored) return JSON.parse(stored) as MockAccount;
    } catch {
      // Хранилище недоступно — начинаем с чистого кабинета
    }
    return initial(user);
  },
  update(user: S["SessionUser"], change: (account: MockAccount) => void): MockAccount {
    const account = this.get(user);
    change(account);
    try {
      sessionStorage.setItem(KEY + user.id, JSON.stringify(account));
    } catch {
      // Изменения продержатся до перезагрузки
    }
    return account;
  },
  clear(user: S["SessionUser"]) {
    try {
      sessionStorage.removeItem(KEY + user.id);
    } catch {
      // Нечего стирать
    }
  },
};
