import type { FC } from "react";
import { formatDay, formatMonth, monthGrid, TASTING_KINDS, tastingDate, type Tasting } from "@/entities/tasting";
import { cn } from "@/shared/lib/cn";
import { plural } from "@/shared/lib/plural";
import { Text } from "uikit;/";

interface IProps {
  variant: "desktop" | "mobile";
  month: string;
  today: string;
  selected: string;
  /** Дегустации месяца — уже без скрытых в легенде типов */
  tastings: Tasting[];
  onSelect: (date: string) => void;
  /** Листание месяцев; нет обработчика — стрелка неактивна */
  onPrev?: () => void;
  onNext?: () => void;
}

const WEEKDAYS = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

/** Месяц сеткой с понедельника: на десктопе в клетке — бирки дегустаций, на мобильных — точка цвета первой */
const MonthCalendar: FC<IProps> = ({ variant, month, today, selected, tastings, onSelect, onPrev, onNext }) => {
  const isDesktop = variant === "desktop";
  const byDay = new Map<string, Tasting[]>();
  for (const tasting of tastings) {
    const date = tastingDate(tasting.startsAt);
    byDay.set(date, [...(byDay.get(date) ?? []), tasting]);
  }

  const navButton = cn(
    "flex cursor-pointer items-center justify-center rounded-full border border-cellar-700 bg-cellar-900 text-white transition-colors",
    "hover:border-amber-350 disabled:cursor-default disabled:opacity-35 disabled:hover:border-cellar-700",
    { "size-13 text-md": isDesktop, "size-10 text-sm": !isDesktop }
  );

  return (
    <div
      className={cn("border border-cellar-700", {
        "rounded-3xl bg-cellar-950/80 px-10 pt-9 pb-10": isDesktop,
        "rounded-[20px] bg-cellar-950/82 p-4": !isDesktop,
      })}
    >
      <div className="flex items-center justify-between gap-3">
        <Text as="h2" FONT="FIRM" aria-live="polite" className={cn({ "text-title leading-15": isDesktop, "text-lg leading-9": !isDesktop })}>
          {formatMonth(month)}
        </Text>
        <div className={cn("flex", { "gap-2.5": isDesktop, "gap-1.5": !isDesktop })}>
          <button type="button" aria-label="Предыдущий месяц" disabled={!onPrev} onClick={onPrev} className={navButton}>
            ←
          </button>
          <button type="button" aria-label="Следующий месяц" disabled={!onNext} onClick={onNext} className={navButton}>
            →
          </button>
        </div>
      </div>
      {isDesktop ? null : <span className="mt-1 block text-[13px] text-neutral-350">точка — есть дегустация</span>}

      <div
        aria-hidden="true"
        className={cn("grid grid-cols-7 text-center text-cellar-400 uppercase", {
          "mt-6 gap-2.5 font-system text-micro tracking-[0.08em]": isDesktop,
          "mt-2.5 text-[11px]": !isDesktop,
        })}
      >
        {WEEKDAYS.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>

      <div className={cn("grid grid-cols-7", { "mt-2.5 gap-2.5": isDesktop, "mt-1.5 gap-1": !isDesktop })}>
        {monthGrid(month).map((date, index) => {
          if (!date) return <span key={`empty-${index}`} aria-hidden="true" />;
          const list = byDay.get(date) ?? [];
          const isSelected = date === selected;
          const isToday = date === today;
          const isPast = date < today;
          const count = list.length ? `, ${list.length} ${plural(list.length, ["дегустация", "дегустации", "дегустаций"])}` : "";
          return (
            <button
              key={date}
              type="button"
              aria-label={`${formatDay(date)}${isToday ? ", сегодня" : ""}${count}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(date)}
              className={cn(
                "cursor-pointer border text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200",
                {
                  "flex h-26 min-w-0 flex-col items-start justify-between rounded-[14px] p-2.5": isDesktop,
                  "flex h-11 flex-col items-center justify-center gap-0.75 rounded-[10px] p-0 font-system text-micro": !isDesktop,
                  "opacity-45": isPast,
                  "border-2 border-amber-350": isSelected,
                  "border-amber-200": !isSelected && isToday,
                  "border-cellar-800 hover:border-amber-350/60": isDesktop && !isSelected && !isToday,
                  "border-transparent": !isDesktop && !isSelected && !isToday,
                  "bg-amber-350/16": isDesktop && isSelected,
                  "bg-amber-350/20": !isDesktop && isSelected,
                  "bg-cellar-900": !isSelected && list.length > 0,
                  "bg-cellar-900/50": isDesktop && !isSelected && list.length === 0,
                  "bg-transparent": !isDesktop && !isSelected && list.length === 0,
                }
              )}
            >
              <span className={cn({ "font-system text-caption font-semibold": isDesktop })}>{Number(date.slice(8))}</span>
              {isDesktop ? (
                <span className="flex w-full flex-col gap-1">
                  {list.map((tasting) => (
                    <span
                      key={tasting.id}
                      className={cn("block truncate rounded-md px-2 py-0.75 text-left text-xs text-cellar-950", TASTING_KINDS[tasting.kind].fill)}
                    >
                      {TASTING_KINDS[tasting.kind].label}
                    </span>
                  ))}
                </span>
              ) : (
                <span aria-hidden="true" className={cn("size-1.5 rounded-full", list.length ? TASTING_KINDS[list[0].kind].fill : "bg-transparent")} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MonthCalendar;
