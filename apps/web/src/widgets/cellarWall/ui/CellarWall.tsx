import { useEffect, type FC } from "react";
import {
  CELLAR_TERMS,
  CELLAR_TIER_ORDER,
  CELLAR_TIERS,
  formatCapacity,
  useGetCellarCellsQuery,
  type CellarCell,
  type CellarTier,
} from "@/entities/cellarCell";
import { CellRequestForm } from "@/features/cellar/requestCell";
import { asset } from "@/shared/lib/asset";
import { cn } from "@/shared/lib/cn";
import { formatPrice } from "@/shared/lib/formatPrice";
import { MEDIA, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import { Eyebrow, Text } from "uikit;/";
import { useCellParams } from "../model/lib/hooks/useCellParams";
import { CELL_FORM_ANCHOR, CELLAR_FACTS, CELLAR_STEPS } from "../model/mock";
import CellButton from "./components/cellButton/CellButton";

/** Ячейка из макета по умолчанию — средняя № 204; занята — первая свободная того же размера или любая */
const DEFAULT_CELL = "204";

const firstFree = (cells: CellarCell[], tier?: CellarTier) =>
  cells.find((cell) => cell.status === "free" && (!tier || cell.tier === tier)) ?? cells.find((cell) => cell.status === "free");

const priceText = (cell: CellarCell | undefined) => (cell?.pricePerMonth == null ? "[цена] ₽" : formatPrice(cell.pricePerMonth));

/**
 * Хранение в погребе (/cellar, макеты CellarStorage и MCellarStorage): условия, стена из 32 ячеек (GET /cellar/cells),
 * карточка выбранной ячейки со сроком, шаги и заявка. Ячейка и срок — в URL.
 */
const CellarWall: FC = () => {
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const variant = isDesktop ? "desktop" : "mobile";
  const { data: cells = [], refetch } = useGetCellarCellsQuery();
  const { cell: cellParam, term, setCell, setTerm } = useCellParams();

  const fromUrl = cells.find((cell) => cell.number === cellParam && cell.status === "free");
  const selected = fromUrl ?? cells.find((cell) => cell.number === DEFAULT_CELL && cell.status === "free") ?? firstFree(cells);

  // Ячейку из ссылки заняли — выбираем соседнюю того же размера
  useEffect(() => {
    if (cellParam && cells.length && !fromUrl && selected) setCell(selected.number);
  }, [cellParam, cells.length, fromUrl, selected, setCell]);

  const tier = selected?.tier ?? "medium";
  const termLabel = CELLAR_TERMS.find((item) => item.id === term)!.label;

  const intro = (
    <section className={cn("flex flex-col", { "mx-auto max-w-480 gap-3.5 px-10 2xl:px-30": isDesktop, "gap-2.5 px-5": !isDesktop })}>
      <div className={cn("flex flex-col", { "max-w-215 gap-3.5": isDesktop, "gap-2.5": !isDesktop })}>
        <Eyebrow size={isDesktop ? "lg" : "sm"} labelClassName={cn({ "text-[22px]": isDesktop })}>
          {isDesktop ? "Погреб • Private cellar" : "Погреб · Private cellar"}
        </Eyebrow>
        <Text as="h1" FONT="FIRM" className={cn({ "text-4xl leading-32 text-shadow-2xl": isDesktop, "text-title leading-15 text-shadow-lg": !isDesktop })}>
          Ваша ячейка в погребе
        </Text>
        <Text COLOR="MUTED" className={cn({ "text-[21px] leading-[1.55]": isDesktop, "text-sm leading-[1.55]": !isDesktop })}>
          {isDesktop
            ? "Храните свои бутылки там же, где выдерживаем наши: под землёй, в темноте и тишине. Заберёте, когда придёт время, — или попросите открыть к дегустации."
            : "Храните бутылки там же, где выдерживаем наши: под землёй, в темноте и тишине."}
        </Text>
      </div>
      <ul className={cn("m-0 grid list-none p-0", { "mt-6.5 grid-cols-4 gap-5": isDesktop, "mt-2 grid-cols-2 gap-2.5": !isDesktop })}>
        {CELLAR_FACTS.map((fact) => (
          <li
            key={fact.value}
            className={cn("flex flex-col border border-cellar-700", {
              "gap-1 rounded-[20px] bg-cellar-950/70 px-6.5 py-5.5": isDesktop,
              "rounded-2xl bg-cellar-950/75 p-3.5": !isDesktop,
            })}
          >
            <span className={cn("font-system font-semibold text-amber-200", { "text-xl": isDesktop, "text-md": !isDesktop })}>{fact.value}</span>
            <span className={cn("text-neutral-350", { "text-sm": isDesktop, "text-[13px]": !isDesktop })}>{isDesktop ? fact.text.desktop : fact.text.mobile}</span>
          </li>
        ))}
      </ul>
    </section>
  );

  const wallCells = isDesktop ? cells : cells.filter((cell) => cell.tier === tier);
  const wall = (
    <div
      className={cn("relative rounded-[10px] bg-linear-to-b from-rack-700 to-rack-800", {
        "p-6.5 shadow-rack": isDesktop,
        "mt-3 p-3.5 shadow-rack-sm": !isDesktop,
      })}
    >
      {isDesktop ? (
        <img
          src={asset("/images/textures/shelf.webp")}
          alt=""
          className="pointer-events-none absolute inset-0 size-full rounded-[10px] object-cover opacity-35 mix-blend-overlay"
        />
      ) : null}
      <div role="radiogroup" aria-label="Ячейки погреба" className={cn("relative grid", { "grid-cols-8 gap-3.5": isDesktop, "grid-cols-4 gap-2.5": !isDesktop })}>
        {wallCells.map((cell) => (
          <CellButton key={cell.number} cell={cell} variant={variant} selected={cell.number === selected?.number} onSelect={setCell} />
        ))}
      </div>
    </div>
  );

  const pill = (checked: boolean) =>
    cn("cursor-pointer border text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200", {
      "border-amber-350 bg-amber-350/18": checked,
      "border-cellar-700 bg-cellar-950 hover:border-amber-350/60": !checked,
    });

  const terms = (
    <div role="radiogroup" aria-label="Срок хранения" className="grid grid-cols-3 gap-2">
      {CELLAR_TERMS.map((item) => (
        <button
          key={item.id}
          type="button"
          role="radio"
          aria-checked={item.id === term}
          onClick={() => setTerm(item.id)}
          className={cn(pill(item.id === term), "flex flex-col items-center justify-center", {
            "h-15 rounded-[14px] text-sm": isDesktop,
            "h-13.5 rounded-xl text-micro": !isDesktop,
          })}
        >
          <span className="font-semibold">{item.label}</span>
          <span className={cn("opacity-80", { "text-[13px]": isDesktop, "text-xs": !isDesktop })}>{item.note}</span>
        </button>
      ))}
    </div>
  );

  const plate = (
    <span
      className={cn(
        "self-start rounded-md bg-linear-to-b from-amber-200 via-amber-300 to-amber-500 font-system font-semibold text-note-ink",
        { "px-5.5 py-2.5 text-lg tracking-[0.1em] shadow-plaque": isDesktop, "px-3.5 py-1.5 tracking-[0.08em]": !isDesktop }
      )}
    >
      ЯЧЕЙКА № {selected?.number ?? "—"}
    </span>
  );

  const priceRow = (
    <div className={cn("flex items-baseline justify-between", { "border-t border-cellar-700 pt-3.5": isDesktop })}>
      <span className={cn("text-neutral-350", { "text-[17px]": isDesktop })}>в месяц</span>
      <span className={cn("font-system font-semibold text-amber-200", { "text-xl": isDesktop, "text-lg": !isDesktop })}>{priceText(selected)}</span>
    </div>
  );

  const card = isDesktop ? (
    <aside
      aria-label="Выбранная ячейка"
      className="sticky top-25 mt-32.5 flex flex-col gap-4 rounded-3xl border border-amber-200/30 bg-cellar-900 p-9 shadow-panel"
    >
      {plate}
      <Text as="span" FONT="FIRM" className="text-[34px] leading-12">
        {CELLAR_TIERS[tier].title}
      </Text>
      <dl className="m-0 flex flex-col gap-2.5 text-[17px] text-neutral-350">
        {[
          ["Вместимость", selected ? formatCapacity(selected.capacity) : "—"],
          ["Ряд", CELLAR_TIERS[tier].row],
          ["Опись и фото бутылок", "включено"],
        ].map(([key, value]) => (
          <div key={key} className="flex justify-between gap-4">
            <dt>{key}</dt>
            <dd className="m-0 text-white">{value}</dd>
          </div>
        ))}
      </dl>
      {terms}
      {priceRow}
      <a
        href={`#${CELL_FORM_ANCHOR}`}
        className="inline-flex h-15 items-center justify-center rounded-full bg-amber-350 px-8 text-caption font-semibold text-black no-underline transition-colors hover:bg-amber-200"
      >
        Оставить заявку
      </a>
    </aside>
  ) : (
    <section aria-label="Выбранная ячейка" className="mx-4 mt-4.5 flex flex-col gap-3 rounded-[20px] border border-amber-200/30 bg-cellar-900 p-5">
      {plate}
      <Text as="span" FONT="FIRM" className="text-lg">
        {CELLAR_TIERS[tier].group} ячейки · {selected ? formatCapacity(selected.capacity) : "—"}
      </Text>
      {terms}
      {priceRow}
    </section>
  );

  const chooser = isDesktop ? (
    <section aria-labelledby="cellar-wall" className="mx-auto mt-24 grid max-w-480 grid-cols-[minmax(0,1fr)_minmax(400px,500px)] items-start gap-10 px-10 2xl:px-30">
      <div className="min-w-0">
        <Text as="h2" id="cellar-wall" FONT="FIRM" className="text-display-sm leading-19">
          Выберите ячейку
        </Text>
        <Text COLOR="MUTED" className="mt-1.5 mb-6 text-caption">
          Светятся свободные. Верхний ряд — малые, ниже — средние, внизу — большие.
        </Text>
        {wall}
        <div className="mt-4 flex gap-6 text-[15px] text-neutral-350">
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="size-4 rounded border border-amber-200 bg-amber-200/35" />
            свободна
          </span>
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="size-4 rounded border border-cellar-700 bg-cellar-950" />
            занята
          </span>
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="size-4 rounded bg-amber-350" />
            ваш выбор
          </span>
        </div>
      </div>
      {card}
    </section>
  ) : (
    <>
      <section aria-labelledby="cellar-wall" className="mx-4 mt-7.5">
        <Text as="h2" id="cellar-wall" FONT="FIRM" className="text-[32px] leading-11.5">
          Выберите ячейку
        </Text>
        <div role="radiogroup" aria-label="Размер ячейки" className="mt-2.5 flex gap-2">
          {CELLAR_TIER_ORDER.map((item) => (
            <button
              key={item}
              type="button"
              role="radio"
              aria-checked={item === tier}
              onClick={() => {
                const target = firstFree(cells, item);
                if (target) setCell(target.number);
              }}
              className={cn(pill(item === tier), "h-11 flex-1 rounded-full text-micro")}
            >
              {CELLAR_TIERS[item].group}
            </button>
          ))}
        </div>
        {wall}
      </section>
      {card}
    </>
  );

  const steps = (
    <section aria-labelledby="cellar-steps" className={cn({ "mx-auto mt-27.5 max-w-480 px-10 2xl:px-30": isDesktop, "mt-7": !isDesktop })}>
      <Text as="h2" id="cellar-steps" FONT="FIRM" className={cn({ "text-display-sm leading-19": isDesktop, "mx-5 text-[32px] leading-11.5": !isDesktop })}>
        Как это работает
      </Text>
      <ol className={cn("m-0 list-none p-0", { "mt-7 grid grid-cols-4 gap-6": isDesktop, "mt-3 flex flex-col gap-2.5 px-5": !isDesktop })}>
        {CELLAR_STEPS.map((step, index) => (
          <li
            key={step.title}
            className={cn("border border-cellar-700", {
              "flex flex-col gap-2.5 rounded-3xl bg-cellar-950/80 p-7.5": isDesktop,
              "grid grid-cols-[40px_1fr] gap-2.5 rounded-[20px] bg-cellar-950/82 p-3.5": !isDesktop,
            })}
          >
            <span aria-hidden="true" className={cn("font-firm text-amber-350", { "text-[54px] leading-15": isDesktop, "text-xl leading-8.5": !isDesktop })}>
              {index + 1}
            </span>
            <span className={cn("flex flex-col", { "gap-2.5": isDesktop })}>
              <span className={cn("font-semibold", { "text-[21px]": isDesktop })}>{step.title}</span>
              <span className={cn("text-neutral-350", { "text-[17px] leading-[1.55]": isDesktop, "text-micro": !isDesktop })}>
                {isDesktop ? step.text.desktop : step.text.mobile}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );

  const request = (
    <section
      id={CELL_FORM_ANCHOR}
      aria-labelledby="cellar-request"
      className={cn("scroll-mt-28 border border-cellar-700", {
        "grid grid-cols-2 gap-14 rounded-3xl bg-cellar-950/80 px-14 py-12": isDesktop,
        "mx-4 mt-7 mb-10 flex flex-col gap-3 rounded-[20px] bg-cellar-950/82 p-5": !isDesktop,
      })}
    >
      <div className={cn("flex flex-col", { "gap-3.5": isDesktop })}>
        <Text as="h2" id="cellar-request" FONT="FIRM" className={cn({ "text-display-sm leading-19": isDesktop, "text-[32px] leading-11.5": !isDesktop })}>
          {isDesktop ? "Заявка на ячейку" : "Заявка"}
        </Text>
        {isDesktop ? (
          <>
            <Text COLOR="MUTED" className="text-caption leading-[1.55]">
              Перезвоним, ответим на вопросы и договоримся, когда привезти бутылки. Договор хранения подписываем в бутике.
            </Text>
            <div aria-live="polite" className="mt-2.5 rounded-2xl bg-cellar-800 px-5.5 py-4.5 text-sm leading-normal text-neutral-350">
              Выбрана ячейка <strong className="text-amber-200">№ {selected?.number ?? "—"}</strong> · {CELLAR_TIERS[tier].title} · срок {termLabel}
            </div>
          </>
        ) : null}
      </div>
      <CellRequestForm cell={selected} term={term} variant={variant} onCellBusy={refetch} />
    </section>
  );

  return (
    <>
      {intro}
      {chooser}
      {steps}
      {isDesktop ? <div className="mx-auto my-24 max-w-480 px-10 2xl:px-30">{request}</div> : request}
    </>
  );
};

export default CellarWall;
