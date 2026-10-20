/**
 * Правила самовывоза — те же, что в эталоне @wine/demo-data (тесты сверяют):
 * - слоты на семь дней начиная с сегодняшнего по часам бутика, по часу, последний — за час до закрытия;
 * - сегодняшние — не раньше чем через час от текущего момента;
 * - бронь держим до закрытия бутика на третий день, считая день самовывоза (закрыт — до закрытия в ближайший рабочий).
 */

export interface OpeningHours {
  /** 1 — понедельник … 7 — воскресенье */
  weekday: number;
  opens: string;
  closes: string;
}

export interface Boutique {
  id: string;
  name: string;
  address: string;
  hours: string;
  phone: string;
  timezone: string;
  schedule: OpeningHours[];
}

export interface PickupDay {
  date: string;
  times: string[];
}

export const PICKUP_DAYS = 7;
export const PICKUP_LEAD_MINUTES = 60;
export const HOLD_DAYS = 3;

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

export const addDays = (date: string, days: number) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
};

export const weekdayOf = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return ((new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7) + 1;
};

const hoursOn = (boutique: Boutique, date: string) => boutique.schedule.find((day) => day.weekday === weekdayOf(date));
const toMinutes = (time: string) => {
  const [hh, mm] = time.split(":").map(Number);
  return hh * 60 + mm;
};
const toTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

export const pickupDays = (boutique: Boutique, now: Date): PickupDay[] => {
  const today = partsIn(now, boutique.timezone).date;
  const earliest = now.getTime() + PICKUP_LEAD_MINUTES * 60_000;
  return Array.from({ length: PICKUP_DAYS }, (_, index) => {
    const date = addDays(today, index);
    const hours = hoursOn(boutique, date);
    const times: string[] = [];
    if (hours) {
      for (let minutes = toMinutes(hours.opens); minutes + 60 <= toMinutes(hours.closes); minutes += 60) {
        const time = toTime(minutes);
        if (zonedInstant(date, time, boutique.timezone).getTime() >= earliest) times.push(time);
      }
    }
    return { date, times };
  });
};

export const isSlotAvailable = (boutique: Boutique, date: string, time: string, now: Date) =>
  pickupDays(boutique, now).some((day) => day.date === date && day.times.includes(time));

export const holdUntilOf = (boutique: Boutique, pickupDate: string): Date => {
  for (let shift = HOLD_DAYS - 1; shift < HOLD_DAYS + 6; shift++) {
    const date = addDays(pickupDate, shift);
    const hours = hoursOn(boutique, date);
    if (hours) return zonedInstant(date, hours.closes, boutique.timezone);
  }
  return zonedInstant(addDays(pickupDate, HOLD_DAYS - 1), "23:59", boutique.timezone);
};

/** «WB-000123» */
export const reservationNumber = (sequence: number) => `WB-${String(sequence).padStart(6, "0")}`;
