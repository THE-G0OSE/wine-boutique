/** Часовой пояс бутиков и погреба: даты услуг считаем по нему, где бы ни был гость */
export const BOUTIQUE_TIMEZONE = "Europe/Moscow";

/** Сегодня по часам бутика: «2026-10-20» */
export const boutiqueToday = (now = new Date()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: BOUTIQUE_TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);

/** «2026-10-20» + n дней */
export const shiftDate = (date: string, days: number) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
};
