import type { FC } from "react";
import { formatDay, tastingDate, tastingTime, type TastingBooking } from "@/entities/tasting";
import { cn } from "@/shared/lib/cn";
import { downloadIcs } from "@/shared/lib/ics";
import { Button, Text } from "uikit;/";

interface IProps {
  booking: TastingBooking;
  variant: "desktop" | "mobile";
  onBack: () => void;
}

/** Приглашение после записи: бумажный билет с вырезами, «В календарь» — файл .ics */
const Invitation: FC<IProps> = ({ booking, variant, onBack }) => {
  const isDesktop = variant === "desktop";
  const { tasting } = booking;
  const start = new Date(tasting.startsAt);

  const addToCalendar = () =>
    downloadIcs(
      {
        uid: `${booking.id}@wine-boutique`,
        title: `Дегустация «${tasting.title}»`,
        description: `Гостей: ${booking.guests}. Ведёт: ${tasting.host}. Возьмите паспорт — 18+.`,
        start,
        end: new Date(start.getTime() + tasting.durationMinutes * 60_000),
      },
      `tasting-${tasting.id}.ics`
    );

  const notch = cn("absolute top-1/2 -mt-3 size-6 rounded-full", { "bg-cellar-900": isDesktop, "bg-cellar-950": !isDesktop });

  return (
    <div className="flex flex-col gap-3">
      <div role="status" className={cn("relative flex flex-col gap-1.5 rounded-2xl bg-paper text-label-ink", { "px-6.5 py-6": isDesktop, "p-5 shadow-ticket": !isDesktop })}>
        <span aria-hidden="true" className={cn(notch, "-left-3")} />
        <span aria-hidden="true" className={cn(notch, "-right-3")} />
        <span className="text-micro tracking-[0.2em] text-primary-500 uppercase">Приглашение</span>
        <Text as="span" FONT="FIRM" className="text-[28px] leading-10">
          Вы записаны!
        </Text>
        <span className="text-sm">
          {formatDay(tastingDate(tasting.startsAt))} · {tasting.title}, {tastingTime(tasting.startsAt)} · гостей: {booking.guests}
        </span>
        <span className="text-micro text-paper-ink">Напомним SMS за день. Возьмите паспорт — 18+.</span>
      </div>
      <Button variant="outline" size={isDesktop ? "lg" : "md"} onClick={addToCalendar} className="w-full">
        В календарь
      </Button>
      <Button variant="link" onClick={onBack} className="h-11 self-center text-neutral-350">
        К афише дня
      </Button>
    </div>
  );
};

export default Invitation;
