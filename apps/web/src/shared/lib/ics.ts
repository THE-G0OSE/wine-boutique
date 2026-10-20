/** Событие для календаря: начало и конец — моменты времени (в файл уходят в UTC) */
export interface CalendarEvent {
  uid: string;
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
}

const utc = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** Экранирование текста по RFC 5545: обратная косая, точка с запятой, запятая, перевод строки */
const escape = (value: string) => value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** Строки длиннее 75 октетов переносятся с пробелом в начале продолжения (RFC 5545 §3.1) */
const fold = (line: string) => {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let current = "";
  for (const char of line) {
    if (new TextEncoder().encode(current + char).length > (parts.length ? 74 : 75)) {
      parts.push(current);
      current = char;
    } else current += char;
  }
  parts.push(current);
  return parts.join("\r\n ");
};

/** Файл .ics с одним событием — для «В календарь» (квитанция брони, запись на дегустацию) */
export const createIcs = (event: CalendarEvent) =>
  [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Premium Wine Boutique//RU",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${utc(new Date())}`,
    `DTSTART:${utc(event.start)}`,
    `DTEND:${utc(event.end)}`,
    `SUMMARY:${escape(event.title)}`,
    ...(event.description ? [`DESCRIPTION:${escape(event.description)}`] : []),
    ...(event.location ? [`LOCATION:${escape(event.location)}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .map(fold)
    .join("\r\n");

/** Скачать событие файлом */
export const downloadIcs = (event: CalendarEvent, filename: string) => {
  const url = URL.createObjectURL(new Blob([createIcs(event)], { type: "text/calendar;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
