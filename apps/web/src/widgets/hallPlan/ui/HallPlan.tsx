import { useCallback, type FC } from "react";
import { useSearchParams } from "react-router";
import { HALL_LAYOUT_ORDER, HALL_LAYOUTS, isHallLayout, type HallLayout } from "@/entities/hall";
import { HallRequestForm } from "@/features/hall/requestHall";
import { cn } from "@/shared/lib/cn";
import { MEDIA, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import { Eyebrow, Text } from "uikit;/";
import { HALL_INCLUDED, HALL_OCCASIONS } from "../model/mock";
import Blueprint from "./components/blueprint/Blueprint";

/**
 * Аренда зала (/hall, макеты Hall и MHall): три рассадки на «чертеже», что входит, заявка (POST /requests/hall), поводы.
 * Рассадка — в URL (`?layout=buffet`).
 */
const HallPlan: FC = () => {
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const variant = isDesktop ? "desktop" : "mobile";
  const [params, setParams] = useSearchParams();
  const raw = params.get("layout") ?? "";
  const layout: HallLayout = isHallLayout(raw) ? raw : "banquet";
  const setLayout = useCallback(
    (value: HallLayout) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("layout", value);
          return next;
        },
        { replace: true, preventScrollReset: true }
      ),
    [setParams]
  );
  const meta = HALL_LAYOUTS[layout];

  const picker = (
    <div role="radiogroup" aria-label="Формат рассадки" className={cn({ "flex shrink-0 gap-2.5": isDesktop, "mx-4 mt-4.5 grid grid-cols-3 gap-2": !isDesktop })}>
      {HALL_LAYOUT_ORDER.map((item) => {
        const checked = item === layout;
        return (
          <button
            key={item}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => setLayout(item)}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-0.5 border text-white transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200",
              {
                "h-18 rounded-[18px] px-6.5": isDesktop,
                "h-15 rounded-[14px]": !isDesktop,
                "border-amber-350 bg-amber-350/18": checked,
                "border-cellar-700 bg-cellar-950/75 hover:border-amber-350/60": !checked && isDesktop,
                "border-cellar-700 bg-cellar-950": !checked && !isDesktop,
              }
            )}
          >
            <span className={cn("font-semibold", { "text-caption": isDesktop, "text-[15px]": !isDesktop })}>{HALL_LAYOUTS[item].title}</span>
            <span className={cn("opacity-80", { "text-micro": isDesktop, "text-xs": !isDesktop })}>до {HALL_LAYOUTS[item].capacity}{isDesktop ? " гостей" : ""}</span>
          </button>
        );
      })}
    </div>
  );

  const intro = (
    <section className={cn("flex", { "mx-auto max-w-480 items-end justify-between gap-20 px-10 2xl:px-30": isDesktop, "flex-col gap-2.5 px-5": !isDesktop })}>
      <div className={cn("flex flex-col", { "max-w-225 gap-3.5": isDesktop, "gap-2.5": !isDesktop })}>
        <Eyebrow size={isDesktop ? "lg" : "sm"} labelClassName={cn({ "text-[22px]": isDesktop })}>
          {isDesktop ? "Аренда зала • Private room" : "Аренда зала"}
        </Eyebrow>
        <Text as="h1" FONT="FIRM" className={cn({ "text-4xl leading-32 text-shadow-2xl": isDesktop, "text-title leading-15 text-shadow-lg": !isDesktop })}>
          Зал под сводами
        </Text>
        <Text COLOR="MUTED" className={cn({ "text-[21px] leading-[1.55]": isDesktop, "text-sm leading-[1.55]": !isDesktop })}>
          {isDesktop
            ? "Кирпичные арки, свечи и стеллажи с бутылками до потолка. Закрываем погреб для вашей компании — с сомелье, бокалами и подбором вин под повод."
            : "Закрываем погреб для вашей компании — с сомелье, бокалами и подбором вин."}
        </Text>
      </div>
      {isDesktop ? picker : null}
    </section>
  );

  const priceRow = (
    <div className={cn("flex items-baseline justify-between", { "border-t border-cellar-700 pt-3.5": isDesktop })}>
      <span className={cn("text-neutral-350", { "text-[17px]": isDesktop })}>от, за вечер</span>
      <span className={cn("font-system font-semibold text-amber-200", { "text-xl": isDesktop, "text-lg": !isDesktop })}>[цена] ₽</span>
    </div>
  );

  const details = (
    <section
      aria-label="Аренда"
      className={cn("flex flex-col border border-amber-200/30 bg-cellar-900", {
        "gap-4 rounded-3xl p-9 shadow-panel": isDesktop,
        "mx-4 mt-4 gap-3 rounded-[20px] p-5": !isDesktop,
      })}
    >
      {isDesktop ? (
        <Text as="h2" FONT="FIRM" className="text-[34px] leading-12">
          {meta.title} · до {meta.capacity} гостей
        </Text>
      ) : null}
      <Text COLOR="MUTED" className={cn("leading-[1.55]", { "text-[17px]": isDesktop, "text-sm": !isDesktop })}>
        {isDesktop ? meta.text.desktop : meta.text.mobile}
      </Text>
      <ul className={cn("m-0 flex list-none flex-col p-0", { "gap-2.5 text-[17px]": isDesktop, "gap-1.5 text-[15px]": !isDesktop })}>
        {HALL_INCLUDED.map((item) => (
          <li key={item.desktop} className="flex items-start gap-3">
            <span aria-hidden="true" className="text-amber-350">
              ✦
            </span>
            <span>{isDesktop ? item.desktop : item.mobile}</span>
          </li>
        ))}
      </ul>
      <HallRequestForm layout={layout} variant={variant} priceRow={priceRow} />
    </section>
  );

  const occasions = (
    <section aria-labelledby="hall-occasions" className={cn({ "mx-auto mt-24 mb-24 max-w-480 px-10 2xl:px-30": isDesktop, "mt-7 mb-10": !isDesktop })}>
      <Text as="h2" id="hall-occasions" FONT="FIRM" className={cn({ "text-display-sm leading-19": isDesktop, "mx-5 text-[32px] leading-11.5": !isDesktop })}>
        Для каких поводов
      </Text>
      <ul
        className={cn("m-0 list-none p-0", {
          "mt-7 grid grid-cols-4 gap-6": isDesktop,
          "mt-3 flex gap-3 overflow-x-auto px-5 [scrollbar-width:none]": !isDesktop,
        })}
      >
        {HALL_OCCASIONS.map((occasion) => (
          <li
            key={occasion.title}
            className={cn("flex flex-col border border-cellar-700", {
              "gap-2.5 rounded-3xl bg-cellar-950/80 p-7.5": isDesktop,
              "w-50 shrink-0 gap-1.5 rounded-[20px] bg-cellar-950/82 p-4.5": !isDesktop,
            })}
          >
            <occasion.icon aria-hidden="true" className={cn("text-amber-350", { "size-8.5": isDesktop, "size-6.5": !isDesktop })} />
            <span className={cn("font-semibold", { "text-[21px]": isDesktop })}>{occasion.title}</span>
            <span className={cn("text-neutral-350", { "text-[17px] leading-[1.55]": isDesktop, "text-micro": !isDesktop })}>
              {isDesktop ? occasion.text.desktop : occasion.text.mobile}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );

  return (
    <>
      {intro}
      {isDesktop ? (
        <section aria-label="План зала" className="mx-auto mt-11 grid max-w-480 grid-cols-[minmax(0,1fr)_minmax(400px,480px)] items-start gap-10 px-10 2xl:px-30">
          <Blueprint layout={layout} variant={variant} />
          {details}
        </section>
      ) : (
        <>
          {picker}
          <div className="mx-4 mt-4">
            <Blueprint layout={layout} variant={variant} />
          </div>
          {details}
        </>
      )}
      {occasions}
    </>
  );
};

export default HallPlan;
