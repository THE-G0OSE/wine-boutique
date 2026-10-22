import { AnimatePresence, motion } from "motion/react";
import { useState, type FC } from "react";
import { Link } from "react-router";
import { formatDay, tastingDate, useGetTastingsQuery, type Tasting, type TastingBooking } from "@/entities/tasting";
import { TastingSignupForm } from "@/features/tastings/bookTasting";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { MEDIA, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import { Eyebrow, Text } from "uikit;/";
import { panelSwap } from "../model/animations";
import { useCalendarParams } from "../model/lib/hooks/useCalendarParams";
import Invitation from "./components/invitation/Invitation";
import KindLegend from "./components/kindLegend/KindLegend";
import MonthCalendar from "./components/monthCalendar/MonthCalendar";
import TastingCard from "./components/tastingCard/TastingCard";

type Variant = "desktop" | "mobile";

interface IDayPanelProps {
  variant: Variant;
  label: string;
  tastings: Tasting[];
  isLoading: boolean;
  waited: Set<string>;
  onWaited: (id: string) => void;
}

/** Панель дня: дегустации → форма записи или листа ожидания → приглашение. Смена дня сбрасывает её (key) */
const DayPanel: FC<IDayPanelProps> = ({ variant, label, tastings, isLoading, waited, onWaited }) => {
  const isDesktop = variant === "desktop";
  const [signup, setSignup] = useState<{ tasting: Tasting; mode: "book" | "waitlist" } | null>(null);
  const [booking, setBooking] = useState<TastingBooking | null>(null);

  const view = booking ? "booked" : signup ? "signup" : "list";

  return (
    <section
      aria-live="polite"
      aria-label="Дегустации дня"
      className={cn("flex flex-col", {
        "sticky top-25 gap-4.5 rounded-3xl border border-amber-200/30 bg-cellar-900 p-9 shadow-panel": isDesktop,
        "gap-3.5": !isDesktop,
      })}
    >
      <span className={cn("text-neutral-350", { "text-[17px]": isDesktop, "text-[15px]": !isDesktop })}>{label}</span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={view} variants={panelSwap} initial="hidden" animate="visible" className={cn("flex flex-col", { "gap-4.5": isDesktop, "gap-3.5": !isDesktop })}>
          {view === "booked" && booking ? (
            <Invitation booking={booking} variant={variant} onBack={() => {
                setBooking(null);
                setSignup(null);
              }} />
          ) : view === "signup" && signup ? (
            <div className={cn({ "rounded-[20px] border border-cellar-700 bg-cellar-900 p-4.5": !isDesktop })}>
              <TastingSignupForm
                tasting={signup.tasting}
                mode={signup.mode}
                variant={variant}
                onBooked={setBooking}
                onWaitlisted={() => {
                  onWaited(signup.tasting.id);
                  setSignup(null);
                }}
                onCancel={() => setSignup(null)}
              />
            </div>
          ) : isLoading ? (
            <Text COLOR="MUTED" className={cn({ "text-[19px]": isDesktop, "text-sm": !isDesktop })}>
              Смотрим афишу…
            </Text>
          ) : tastings.length === 0 ? (
            <Text COLOR="MUTED" className={cn({ "text-[19px] leading-[1.55]": isDesktop, "text-sm leading-[1.55]": !isDesktop })}>
              В этот день дегустаций нет.{" "}
              {isDesktop ? (
                <>
                  Выберите день с отметкой — или соберите свою в{" "}
                  <Link to={ROUTES.hall} className="text-amber-200 hover:text-paper">
                    частном зале
                  </Link>
                  .
                </>
              ) : (
                <Link to={ROUTES.hall} className="text-amber-200 hover:text-paper">
                  Соберите свою в зале →
                </Link>
              )}
            </Text>
          ) : (
            tastings.map((tasting) => (
              <TastingCard
                key={tasting.id}
                tasting={tasting}
                variant={variant}
                waited={waited.has(tasting.id)}
                onBook={() => setSignup({ tasting, mode: "book" })}
                onWait={() => setSignup({ tasting, mode: "waitlist" })}
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

/**
 * Дегустации (/tastings, макеты Tastings и MTastings): легенда-фильтр типов, календарь месяца (GET /tastings?month=),
 * панель выбранного дня с записью и листом ожидания. Месяц, день и скрытые типы — в URL.
 */
const TastingsCalendar: FC = () => {
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const variant: Variant = isDesktop ? "desktop" : "mobile";
  const { today, month, months, day, hidden, setMonth, setDay, toggleKind } = useCalendarParams();
  const { data, isLoading } = useGetTastingsQuery(month);
  const [waited, setWaited] = useState<Set<string>>(() => new Set());

  // Ответ прошлого месяца, пока грузится новый, не показываем: даты были бы чужими
  const tastings = (data ?? []).filter((tasting) => !hidden.includes(tasting.kind) && tasting.startsAt.startsWith(month));
  const firstWithTastings = tastings.find((tasting) => tastingDate(tasting.startsAt) >= today)?.startsAt.slice(0, 10);
  const selected = day ?? (today.startsWith(month) ? today : (firstWithTastings ?? `${month}-01`));
  const dayTastings = tastings.filter((tasting) => tastingDate(tasting.startsAt) === selected);
  const index = months.indexOf(month);

  const intro = (
    <section
      className={cn("flex", {
        "mx-auto max-w-480 items-end justify-between gap-20 px-10 2xl:px-30": isDesktop,
        "flex-col gap-2.5 px-5": !isDesktop,
      })}
    >
      <div className={cn("flex flex-col", { "max-w-225 gap-3.5": isDesktop, "gap-2.5": !isDesktop })}>
        <Eyebrow size={isDesktop ? "lg" : "sm"} labelClassName={cn({ "text-[22px]": isDesktop })}>
          {isDesktop ? "Дегустации в погребе • Tastings" : "Дегустации в погребе"}
        </Eyebrow>
        <Text as="h1" FONT="FIRM" className={cn({ "text-4xl leading-32 text-shadow-2xl": isDesktop, "text-title leading-15 text-shadow-lg": !isDesktop })}>
          Дегустации
        </Text>
        <Text COLOR="MUTED" className={cn({ "text-[21px] leading-[1.55]": isDesktop, "text-sm leading-[1.55]": !isDesktop })}>
          {isDesktop
            ? "Каждую неделю открываем бутылки, ради которых стоит спуститься в погреб: вертикали одного шато, слепые сравнения, ужины с шефом. До 12 гостей за столом."
            : "Вертикали, слепые сравнения и ужины с шефом. До 12 гостей за столом."}
        </Text>
      </div>
      <KindLegend
        hidden={hidden}
        onToggle={toggleKind}
        className={cn({
          "max-w-155 flex-wrap justify-end": isDesktop,
          "-mx-5 mt-2 overflow-x-auto overflow-y-hidden px-5 [scrollbar-width:none]": !isDesktop,
        })}
      />
    </section>
  );

  const calendar = (
    <MonthCalendar
      variant={variant}
      month={month}
      today={today}
      selected={selected}
      tastings={tastings}
      onSelect={setDay}
      onPrev={index > 0 ? () => setMonth(months[index - 1]) : undefined}
      onNext={index < months.length - 1 ? () => setMonth(months[index + 1]) : undefined}
    />
  );

  const panel = (
    <DayPanel
      key={selected}
      variant={variant}
      label={`${formatDay(selected)}${selected === today ? " · сегодня" : ""}`}
      tastings={dayTastings}
      isLoading={isLoading}
      waited={waited}
      onWaited={(id) => setWaited((prev) => new Set(prev).add(id))}
    />
  );

  return (
    <>
      <div className={cn({ "pt-0": isDesktop, "pt-1.5": !isDesktop })}>{intro}</div>
      <section
        aria-label="Календарь дегустаций"
        className={cn({
          "mx-auto mt-12 grid max-w-480 grid-cols-[minmax(0,1fr)_minmax(400px,560px)] items-start gap-10 px-10 2xl:px-30": isDesktop,
          "mt-5 flex flex-col gap-4 px-4": !isDesktop,
        })}
      >
        {calendar}
        {panel}
      </section>
    </>
  );
};

export default TastingsCalendar;
