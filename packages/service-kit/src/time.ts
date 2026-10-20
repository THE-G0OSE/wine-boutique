/**
 * Время по часам места (бутик, погреб): IANA-пояс вместо смещения, чтобы переходы на летнее время не ломали расчёт.
 * Даты — строки «2026-10-21», время — «15:00».
 */

const partsIn = (instant: Date, timezone: string) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(instant)
      .map(({ type, value }) => [type, value])
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour), minute: Number(parts.minute), second: Number(parts.second) };
};

/** Смещение пояса от UTC в момент `instant`, мс */
const offsetMs = (instant: Date, timezone: string) => {
  const { date, hour, minute, second } = partsIn(instant, timezone);
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d, hour, minute, second) - Math.floor(instant.getTime() / 1000) * 1000;
};

/** «2026-10-21» + «15:00» по часам пояса → момент времени */
export const zonedInstant = (date: string, time: string, timezone: string): Date => {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const first = guess - offsetMs(new Date(guess), timezone);
  // Второй проход — на случай перехода на летнее время между догадкой и ответом
  return new Date(guess - offsetMs(new Date(first), timezone));
};

/** Момент → ISO со смещением пояса: «2026-10-21T15:00:00+03:00» */
export const toZonedIso = (instant: Date, timezone: string): string => {
  const { date, hour, minute, second } = partsIn(instant, timezone);
  const offset = Math.round(offsetMs(instant, timezone) / 60_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const abs = Math.abs(offset);
  return `${date}T${pad(hour)}:${pad(minute)}:${pad(second)}${offset < 0 ? "-" : "+"}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
};

/** Дата по часам пояса: «2026-10-21» */
export const localDate = (instant: Date, timezone: string) => partsIn(instant, timezone).date;
