import type { Boutique } from "./types.js";

const daily = (opens: string, closes: string, weekdays = [1, 2, 3, 4, 5, 6, 7]) =>
  weekdays.map((weekday) => ({ weekday, opens, closes }));

/**
 * Бутики из макетов Reserve и Pickup. Адреса и телефоны — плейсхолдеры дизайна; город не указан,
 * поэтому часовой пояс — московский, пока заказчик не даст адреса.
 */
export const boutiqueFixtures: Boutique[] = [
  {
    id: "street",
    name: "Бутик на [улице]",
    address: "[город], [улица], [дом]",
    hours: "ежедневно 12:00–22:00",
    phone: "[телефон]",
    timezone: "Europe/Moscow",
    schedule: daily("12:00", "22:00"),
  },
  {
    id: "cellar",
    name: "Бутик «Погреб»",
    address: "[город], [улица], [дом]",
    hours: "пн–сб 12:00–21:00",
    phone: "[телефон]",
    timezone: "Europe/Moscow",
    schedule: daily("12:00", "21:00", [1, 2, 3, 4, 5, 6]),
  },
];
