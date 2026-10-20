const KEY = "wine-boutique:mock-tastings";

interface IStore {
  /** Сколько мест заняли записи через сайт — поверх занятых в макете */
  taken: Record<string, number>;
  /** Телефоны в листе ожидания по дегустациям */
  waitlist: Record<string, string[]>;
}

const read = (): IStore => {
  try {
    return { taken: {}, waitlist: {}, ...(JSON.parse(sessionStorage.getItem(KEY) ?? "{}") as Partial<IStore>) };
  } catch {
    return { taken: {}, waitlist: {} };
  }
};

const write = (store: IStore) => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // Хранилище недоступно (приватный режим) — места вернутся после перезагрузки
  }
};

/**
 * Записи мок-сервера: живут в sessionStorage вкладки, чтобы занятые места не пропадали после F5.
 * Только для моков — настоящие записи хранит сервис tastings.
 */
export const mockTastings = {
  taken(id: string) {
    return read().taken[id] ?? 0;
  },
  book(id: string, guests: number) {
    const store = read();
    store.taken[id] = (store.taken[id] ?? 0) + guests;
    write(store);
  },
  wait(id: string, phone: string) {
    const store = read();
    store.waitlist[id] = [...new Set([...(store.waitlist[id] ?? []), phone])];
    write(store);
  },
};
