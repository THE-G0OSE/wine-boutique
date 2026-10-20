import type { FC } from "react";
import { LuGrape } from "react-icons/lu";
import type { WineDetails } from "@/entities/wine";
import { cn } from "@/shared/lib/cn";

interface IProps {
  wine: WineDetails;
  variant: "desktop" | "mobile";
}

/** «Sassicaia 2015» → «Sassicaia»: год урожая стоит строкой ниже */
const labelName = (wine: WineDetails) =>
  wine.vintage !== null && wine.name.endsWith(String(wine.vintage)) ? wine.name.slice(0, -String(wine.vintage).length).trim() : wine.name;

/** Строки паспорта вина — как на этикетке (макет Product) */
const passportOf = (wine: WineDetails) => [
  { k: "Страна", v: wine.country ?? "[страна]" },
  { k: "Регион", v: wine.region },
  { k: "Сорта", v: wine.grapes.join(", ") },
  { k: "Урожай", v: wine.vintage === null ? "без года" : String(wine.vintage) },
  { k: "Объём", v: wine.volume },
  { k: "Крепость", v: wine.abv },
  { k: "Выдержка", v: wine.aging },
  { k: "Потенциал", v: wine.potential },
];

const MOBILE_PASSPORT_ROWS = 6;

/** Этикетка-паспорт на бумаге: винодельня, название, апелласьон и год, таблица паспорта */
const WineLabel: FC<IProps> = ({ wine, variant }) => {
  const isDesktop = variant === "desktop";
  const subtitle = [wine.appellation, wine.vintage === null ? null : isDesktop ? `урожай ${wine.vintage}` : String(wine.vintage)]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={cn("relative rounded bg-paper shadow-panel", { "-rotate-[0.4deg] p-3.5": isDesktop, "p-2.5": !isDesktop })}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded bg-radial-[at_80%_10%] from-white/50 to-transparent to-50%"
      />
      <div
        className={cn(
          "relative flex flex-col items-center border-2 border-primary-500 text-center font-paper text-label-ink outline outline-primary-500",
          { "px-14 pt-10 pb-9 -outline-offset-8": isDesktop, "px-5.5 pt-6.5 pb-4.5 -outline-offset-6": !isDesktop }
        )}
      >
        {wine.producer ? (
          <span className={cn("tracking-[0.32em] text-primary-500 uppercase", { "text-sm": isDesktop, "text-xs": !isDesktop })}>{wine.producer}</span>
        ) : null}
        <h1 className={cn("m-0 font-firm font-normal text-label-ink", { "mt-2.5 text-[92px] leading-30": isDesktop, "mt-1 text-[54px] leading-18": !isDesktop })}>
          {labelName(wine)}
        </h1>
        <span className={cn("italic", { "text-lg": isDesktop, "text-[17px]": !isDesktop })}>{subtitle || `${wine.region}${wine.country ? `, ${wine.country}` : ""}`}</span>
        {isDesktop ? (
          <div aria-hidden="true" className="mt-5.5 mb-4.5 flex w-full items-center gap-3.5 text-primary-500">
            <span className="h-px flex-1 bg-primary-500" />
            <LuGrape size={20} />
            <span className="h-px flex-1 bg-primary-500" />
          </div>
        ) : null}
        <dl className={cn("m-0 w-full text-left", { "grid grid-cols-2 gap-x-12": isDesktop, "mt-4": !isDesktop })}>
          {/* На мобильных этикетка короче: шесть строк (MProduct) */}
          {passportOf(wine)
            .slice(0, isDesktop ? undefined : MOBILE_PASSPORT_ROWS)
            .map((row) => (
            <div key={row.k} className={cn("flex justify-between border-b border-dotted border-label-ink/40", { "gap-4 py-2.75": isDesktop, "gap-3 py-2": !isDesktop })}>
              <dt className={cn("text-paper-ink", { "text-caption": isDesktop, "text-[15px]": !isDesktop })}>{row.k}</dt>
              <dd className={cn("m-0 text-right font-bold", { "text-caption": isDesktop, "text-[15px]": !isDesktop })}>{row.v}</dd>
            </div>
            ))}
        </dl>
      </div>
    </div>
  );
};

export default WineLabel;
