import { useState, type FC } from "react";
import { Link } from "react-router";
import { formatDots, formatShortMoment, type MyCell } from "@/entities/account";
import { CELLAR_TIERS } from "@/entities/cellarCell";
import { usePrepareMyCellMutation } from "@/features/account/prepareCell";
import { isApiError } from "@/shared/api";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { boutiqueToday, shiftDate } from "@/shared/lib/date";
import { plural } from "@/shared/lib/plural";
import { Button, Text } from "uikit;/";
import { PANEL } from "../../model/tabs";

interface IProps {
  cell: MyCell | null;
}

/** Визит к ячейке — завтра в 19:00 по Москве (сомелье поднимет бутылки заранее) */
const tomorrowEvening = () => `${shiftDate(boutiqueToday(), 1)}T19:00:00+03:00`;

/** Моя ячейка: схема мест с торца (готово / выдерживается / свободно), опись и «Подготовить к визиту» */
const CellTab: FC<IProps> = ({ cell }) => {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [prepare, { isLoading, error }] = usePrepareMyCellMutation();

  if (!cell) {
    return (
      <div className={cn(PANEL, "flex flex-col items-start gap-3")}>
        <Text as="h2" FONT="FIRM" className="text-xl leading-10.5">
          Ячейки пока нет
        </Text>
        <Text COLOR="MUTED" className="text-sm">
          Храните бутылки в погребе: +12…14 °C круглый год, опись с фото и охрана.
        </Text>
        <Link to={ROUTES.cellar} className="text-amber-200 hover:text-paper">
          Выбрать ячейку →
        </Link>
      </div>
    );
  }

  const thisYear = new Date().getFullYear();
  // Места по порядку: сначала готовые, потом выдерживаемые, остальные свободны
  const slots = [
    ...cell.bottles.filter((bottle) => bottle.readyFrom === null).flatMap((bottle) => Array.from({ length: bottle.qty }, () => "ready" as const)),
    ...cell.bottles.filter((bottle) => bottle.readyFrom !== null).flatMap((bottle) => Array.from({ length: bottle.qty }, () => "wait" as const)),
  ];
  const filled = slots.length;
  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const prepText = cell.preparation
    ? `Сомелье поднимет бутылки к визиту ${formatShortMoment(cell.preparation.visitAt)} ✓`
    : selected.size
      ? `Выбрано бутылок: ${selected.size} — поднимем из погреба и охладим к визиту`
      : "Отметьте бутылки, которые хотите забрать или открыть";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] lg:gap-10">
      <div className={cn(PANEL, "flex flex-col gap-4 self-start")}>
        <div className="flex items-baseline justify-between gap-3">
          <span className="rounded-md bg-linear-to-b from-amber-200 to-amber-500 px-3.5 py-1.5 font-system font-semibold tracking-[0.08em] text-note-ink">ЯЧЕЙКА № {cell.number}</span>
          <span className="text-micro text-neutral-350">
            {CELLAR_TIERS[cell.tier].title.split(" ")[0].toLowerCase()} · {filled} из {cell.capacity}
          </span>
        </div>
        <div role="grid" aria-label="Схема ячейки, вид с торца" className="grid grid-cols-6 gap-2 rounded-xl bg-linear-to-b from-rack-700 to-rack-800 p-3.5 shadow-rack-sm">
          {Array.from({ length: cell.capacity }, (_, index) => {
            const state = index < slots.length ? slots[index] : "free";
            return (
              <span
                key={index}
                role="gridcell"
                aria-label={`Место ${index + 1}: ${state === "free" ? "свободно" : state === "ready" ? "готово к открытию" : "выдерживается"}`}
                className={cn("aspect-square rounded-full border inset-shadow-cell", {
                  "border-cellar-700 bg-cellar-950/60": state === "free",
                  "border-black/60 bg-[radial-gradient(circle_at_50%_50%,var(--color-sage)_0_22%,var(--color-ink)_24%_44%,var(--color-rack-neck)_46%_52%,var(--color-cellar-950)_54%)]":
                    state === "ready",
                  "border-black/60 bg-[radial-gradient(circle_at_50%_50%,var(--color-primary-500)_0_22%,var(--color-ink)_24%_44%,var(--color-rack-neck)_46%_52%,var(--color-cellar-950)_54%)]":
                    state === "wait",
                })}
              />
            );
          })}
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-neutral-350">
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-3 rounded-full bg-sage" /> готово к открытию
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-3 rounded-full bg-primary-500" /> пусть ещё полежит
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-3 rounded-full border border-cellar-700" /> свободно
          </span>
        </div>
        <dl className="m-0 flex flex-col gap-2 border-t border-cellar-700 pt-3.5 text-sm text-neutral-350">
          <div className="flex justify-between gap-3">
            <dt>Хранение оплачено до</dt>
            <dd className="m-0 font-semibold text-white">{formatDots(cell.paidUntil)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Условия сейчас</dt>
            <dd className="m-0 font-semibold text-white">
              +{String(cell.conditions.temperature).replace(".", ",")} °C · {cell.conditions.humidity} %
            </dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link to={ROUTES.cellar} className="text-amber-200 hover:text-paper">
            Ячейка побольше
          </Link>
          <Link to={ROUTES.shop} className="text-amber-200 hover:text-paper">
            Докупить бутылки
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <Text as="h2" FONT="FIRM" className="text-xl leading-10.5 lg:text-2xl lg:leading-13">
            Опись
          </Text>
          <span className="text-micro text-neutral-350">Отметьте бутылки — подготовим их к вашему визиту</span>
        </div>
        {cell.bottles.map((bottle) => {
          const checked = selected.has(bottle.id);
          const ready = bottle.readyFrom === null || bottle.readyFrom <= thisYear;
          return (
            <label
              key={bottle.id}
              className={cn("grid cursor-pointer grid-cols-[30px_48px_minmax(0,1fr)] items-center gap-3.5 rounded-[18px] border px-4 py-3 lg:grid-cols-[30px_64px_minmax(0,1fr)_auto] lg:gap-4.5", {
                "border-amber-200/50 bg-amber-350/12": checked,
                "border-cellar-700 bg-cellar-950/80": !checked,
              })}
            >
              <input type="checkbox" checked={checked} onChange={() => toggle(bottle.id)} className="peer sr-only" aria-label={`Подготовить к визиту: ${bottle.name}`} />
              <span
                aria-hidden="true"
                className="flex size-7.5 items-center justify-center rounded-lg border-2 border-amber-350 font-bold text-black peer-checked:bg-amber-350 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-amber-200"
              >
                {checked ? "✓" : ""}
              </span>
              <span className="flex h-16 items-end justify-center">
                <img src={bottle.image} alt="" className="h-16 w-auto" />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <b className="font-semibold">
                  {bottle.name}
                  {bottle.qty > 1 ? ` ×${bottle.qty}` : ""}
                </b>
                <span className="text-micro text-neutral-350">{bottle.meta}</span>
                <span className="text-xs text-cellar-400">
                  в ячейке с {formatDots(bottle.since)} · фото описи: {bottle.photos} шт.
                </span>
                <span className={cn("mt-1 self-start rounded-full px-3 py-1 text-xs lg:hidden", { "bg-sage/20 text-sage": ready, "bg-primary-500/25 text-note-pink": !ready })}>
                  {ready ? "Готово к открытию" : `Ждать до ${bottle.readyFrom}`}
                </span>
              </span>
              <span className={cn("hidden rounded-full px-3 py-1.5 text-[13px] whitespace-nowrap lg:inline", { "bg-sage/20 text-sage": ready, "bg-primary-500/25 text-note-pink": !ready })}>
                {ready ? "Готово к открытию" : `Ждать до ${bottle.readyFrom}`}
              </span>
            </label>
          );
        })}
        <div className={cn(PANEL, "mt-1 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between")}>
          <span aria-live="polite" className={cn("text-sm", { "text-sage": cell.preparation, "text-neutral-350": !cell.preparation })}>
            {prepText}
          </span>
          <Button
            disabled={!selected.size || isLoading}
            onClick={async () => {
              const result = await prepare({ bottleIds: [...selected], visitAt: tomorrowEvening() });
              if ("data" in result) setSelected(new Set());
            }}
            className="shrink-0"
          >
            {isLoading ? "Отправляем…" : `Подготовить ${selected.size ? `${selected.size} ${plural(selected.size, ["бутылку", "бутылки", "бутылок"])}` : "к визиту"}`}
          </Button>
        </div>
        {error ? (
          <Text role="alert" SIZE="SYSTEM" className="text-error">
            {isApiError(error) ? error.data.message : "Не получилось — попробуйте ещё раз"}
          </Text>
        ) : null}
      </div>
    </div>
  );
};

export default CellTab;
