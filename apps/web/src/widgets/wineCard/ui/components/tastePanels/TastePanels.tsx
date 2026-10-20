import type { FC } from "react";
import type { TasteProfile, WineDetails } from "@/entities/wine";
import { cn } from "@/shared/lib/cn";
import { Eyebrow, Text } from "uikit;/";

interface IProps {
  wine: WineDetails;
  variant: "desktop" | "mobile";
}

const SCALES: { key: keyof TasteProfile; label: string }[] = [
  { key: "body", label: "Тело" },
  { key: "tannins", label: "Танины" },
  { key: "acidity", label: "Кислотность" },
  { key: "sweetness", label: "Сладость" },
];

const NOTES = [
  { key: "aroma", label: "Аромат" },
  { key: "taste", label: "Вкус" },
  { key: "finish", label: "Послевкусие" },
] as const;

const panel = (isDesktop: boolean) =>
  cn("border border-cellar-700", {
    "flex flex-col rounded-3xl bg-cellar-950/78 px-12 py-11": isDesktop,
    "mx-4 rounded-[20px] bg-cellar-950/82 px-5 py-5.5": !isDesktop,
  });

/** «Вкус и аромат» (шкалы из пяти точек и заметки) и «К столу» (с чем подать, температура, декантация, бокал) */
const TastePanels: FC<IProps> = ({ wine, variant }) => {
  const isDesktop = variant === "desktop";
  const heading = cn("m-0", { "mt-2 mb-7 text-title leading-16": isDesktop, "text-[32px] leading-11.5": !isDesktop });

  const scales = wine.profile ? (
    <div className={cn("flex flex-col", { "gap-5.5": isDesktop, "mt-3.5 gap-3.5": !isDesktop })}>
      {SCALES.map(({ key, label }) => {
        const { level, word } = wine.profile![key];
        return (
          <div key={key} className={cn("grid items-center", { "grid-cols-[180px_1fr_120px] gap-5": isDesktop, "grid-cols-[110px_1fr]": !isDesktop })}>
            <span className={cn({ "text-md": isDesktop, "text-[15px]": !isDesktop })}>{label}</span>
            <span role="img" aria-label={`${label}: ${level} из 5, ${word}`} className={cn("flex", { "gap-2.5": isDesktop, "gap-2": !isDesktop })}>
              {[1, 2, 3, 4, 5].map((dot) => (
                <span
                  key={dot}
                  className={cn("rounded-full border-2 border-amber-350", { "size-7": isDesktop, "size-5.5": !isDesktop, "bg-amber-350": dot <= level })}
                />
              ))}
            </span>
            {isDesktop ? <span className="text-right text-[15px] text-neutral-350">{word}</span> : null}
          </div>
        );
      })}
    </div>
  ) : (
    <Text COLOR="MUTED" SIZE="SYSTEM" className={cn({ "mt-3.5": !isDesktop })}>
      Профиль вкуса сомелье опишет, когда откроет бутылку.
    </Text>
  );

  const notes = (
    <div className={cn({ "mt-8.5 grid grid-cols-3 gap-5": isDesktop, "mt-4 flex flex-col gap-2.5": !isDesktop })}>
      {NOTES.map(({ key, label }) => (
        <div key={key} className={cn("flex flex-col border-t border-cellar-700", { "gap-1.5 pt-4": isDesktop, "pt-2.5": !isDesktop })}>
          <span className={cn("font-semibold text-amber-200", { "text-[17px]": isDesktop, "text-[15px]": !isDesktop })}>{label}</span>
          <span className={cn("text-neutral-350", { "text-sm leading-[1.5]": isDesktop, "text-micro": !isDesktop })}>{wine.notes[key]}</span>
        </div>
      ))}
    </div>
  );

  const food =
    wine.food.length > 0 ? (
      <div className={cn("grid grid-cols-2", { "gap-3.5": isDesktop, "mt-3 gap-2": !isDesktop })}>
        {wine.food.map((item) => (
          <div key={item.text} className={cn("flex items-center bg-cellar-800", { "gap-3.5 rounded-2xl px-4.5 py-4": isDesktop, "gap-2 rounded-[14px] p-3 text-micro": !isDesktop })}>
            <span
              aria-hidden="true"
              className={cn({ "flex size-11 shrink-0 items-center justify-center rounded-full bg-amber-200/14 text-[22px]": isDesktop })}
            >
              {item.icon}
            </span>
            <span className={cn({ "text-caption": isDesktop })}>{item.text}</span>
          </div>
        ))}
      </div>
    ) : null;

  const serve = wine.serve ? (
    <div className={cn("grid grid-cols-3", { "mt-7.5 gap-3.5": isDesktop, "mt-2.5 gap-2": !isDesktop })}>
      {[
        { value: wine.serve.temperature, label: "температура" },
        { value: wine.serve.decanting, label: "декантация" },
        { value: wine.serve.glass, label: "бокал" },
      ].map((item) => (
        <div key={item.label} className={cn("flex flex-col border border-cellar-700 text-center", { "gap-1 rounded-2xl p-4.5": isDesktop, "rounded-[14px] px-1.5 py-3": !isDesktop })}>
          <span className={cn("font-system font-semibold text-amber-200", { "text-lg": isDesktop, "text-sm": !isDesktop })}>{item.value}</span>
          <span className={cn("text-neutral-350", { "text-[15px]": isDesktop, "text-xs": !isDesktop })}>{item.label}</span>
        </div>
      ))}
    </div>
  ) : null;

  return (
    <div className={cn({ "mx-auto mt-10 grid max-w-480 grid-cols-2 gap-10 px-10 2xl:px-30": isDesktop, "mt-6.5 flex flex-col gap-4": !isDesktop })}>
      <section aria-labelledby="wine-taste" className={panel(isDesktop)}>
        {isDesktop ? <Eyebrow labelClassName="text-caption">Профиль вина</Eyebrow> : null}
        <Text as="h2" id="wine-taste" FONT="FIRM" className={heading}>
          Вкус и аромат
        </Text>
        {scales}
        {notes}
      </section>
      <section aria-labelledby="wine-table" className={panel(isDesktop)}>
        {isDesktop ? <Eyebrow labelClassName="text-caption">Совет сомелье</Eyebrow> : null}
        <Text as="h2" id="wine-table" FONT="FIRM" className={heading}>
          К столу
        </Text>
        {food}
        {serve}
        <Text COLOR="MUTED" className={cn({ "mt-auto pt-7 text-[17px] leading-[1.55]": isDesktop, "mt-3 text-micro": !isDesktop })}>
          {wine.sommelierNote}
        </Text>
      </section>
    </div>
  );
};

export default TastePanels;
