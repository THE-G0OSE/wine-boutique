const WEEKDAYS = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
const MONTHS = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

const parse = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

/** Подпись дня самовывоза: «сегодня», «завтра», дальше — день недели (Reserve) */
export const formatPickupWeekday = (date: string, index: number) =>
  index === 0 ? "сегодня" : index === 1 ? "завтра" : WEEKDAYS[parse(date).getUTCDay()];

/** «2026-10-21» → { day: "21", month: "окт" } */
export const formatPickupDate = (date: string) => {
  const parsed = parse(date);
  return { day: String(parsed.getUTCDate()), month: MONTHS[parsed.getUTCMonth()] };
};

/** «21 окт, 15:00» */
export const formatPickupMoment = (date: string, time: string) => {
  const { day, month } = formatPickupDate(date);
  return `${day} ${month}, ${time}`;
};

/** ISO со смещением бутика («2026-10-21T15:00:00+03:00») → «21 окт, 15:00» по часам бутика */
export const formatZonedMoment = (iso: string) => formatPickupMoment(iso.slice(0, 10), iso.slice(11, 16));
