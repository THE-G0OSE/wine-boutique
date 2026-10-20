import { useState, type FC, type ReactNode } from "react";
import { Link } from "react-router";
import {
  DEFAULT_GIFT,
  GIFT_DEFAULT_ENGRAVING,
  GIFT_ENGRAVING_LENGTH,
  GIFT_EXTRAS,
  GIFT_MAX_BOTTLES,
  GIFT_PACKS,
  GIFT_RUNS,
  type GiftBox,
  type GiftExtra,
  type GiftPack,
  type GiftRun,
} from "@/entities/giftBox";
import { GiftRequestForm } from "@/features/gifts/requestGifts";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { MEDIA, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import { plural } from "@/shared/lib/plural";
import { Eyebrow, Text } from "uikit;/";
import GiftPreview from "./components/giftPreview/GiftPreview";

const GIFT_FORM_ANCHOR = "gift-form";
const PERKS = ["Закрывающие документы", "Оплата по счёту", "Персональный менеджер"];

/**
 * Корпоративные подарки (/gifts, макеты Gifts и MGifts): конструктор ящика (упаковка, 1–3 бутылки, дополнения,
 * текст бирки, тираж) с живым превью и запрос сметы (POST /requests/gift)
 */
const GiftBuilder: FC = () => {
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const variant = isDesktop ? "desktop" : "mobile";
  const [gift, setGift] = useState<GiftBox>(DEFAULT_GIFT);
  const update = (patch: Partial<GiftBox>) => setGift((prev) => ({ ...prev, ...patch }));
  const toggleExtra = (extra: GiftExtra) =>
    setGift((prev) => ({ ...prev, extras: prev.extras.includes(extra) ? prev.extras.filter((item) => item !== extra) : [...prev.extras, extra] }));

  const pill = (checked: boolean) =>
    cn("flex cursor-pointer flex-col items-center justify-center border text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200", {
      "min-h-14 rounded-[14px] px-2 py-1.5 text-[15px]": isDesktop,
      "min-h-12 rounded-xl text-micro": !isDesktop,
      "border-amber-350 bg-amber-350/18": checked,
      "border-cellar-700 bg-cellar-950 hover:border-amber-350/60": !checked,
    });
  const step = (title: string, control: ReactNode) => (
    <div className="flex flex-col gap-2.5">
      <span className={cn("font-semibold", { "text-caption": isDesktop })}>{title}</span>
      {control}
    </div>
  );
  const radios = <T extends string | number>(label: string, options: { value: T; content: ReactNode }[], value: T, onPick: (value: T) => void) => (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-3 gap-2.5">
      {options.map((option) => (
        <button key={option.value} type="button" role="radio" aria-checked={option.value === value} onClick={() => onPick(option.value)} className={pill(option.value === value)}>
          {option.content}
        </button>
      ))}
    </div>
  );

  const packs = radios<GiftPack>(
    "Упаковка",
    (Object.keys(GIFT_PACKS) as GiftPack[]).map((pack) => ({ value: pack, content: isDesktop ? GIFT_PACKS[pack].title : GIFT_PACKS[pack].short })),
    gift.pack,
    (pack) => update({ pack })
  );
  const counts = radios<number>(
    "Количество бутылок",
    Array.from({ length: GIFT_MAX_BOTTLES }, (_, index) => index + 1).map((n) => ({
      value: n,
      content: isDesktop ? `${n} ${plural(n, ["бутылка", "бутылки", "бутылок"])}` : String(n),
    })),
    gift.bottles,
    (bottles) => update({ bottles })
  );
  const extras = (Object.keys(GIFT_EXTRAS) as GiftExtra[]).map((extra) => {
    const checked = gift.extras.includes(extra);
    return (
      <button
        key={extra}
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => toggleExtra(extra)}
        className={cn("flex min-h-11 cursor-pointer items-center gap-3.5 border-0 bg-transparent p-0 text-left text-white", { "text-[17px]": isDesktop, "text-[15px]": !isDesktop })}
      >
        <span
          aria-hidden="true"
          className={cn("flex size-6.5 shrink-0 items-center justify-center rounded-lg border-2 border-amber-350 font-bold text-black", { "bg-amber-350": checked })}
        >
          {checked ? "✓" : ""}
        </span>
        <span className="flex-1">{isDesktop ? GIFT_EXTRAS[extra].title : GIFT_EXTRAS[extra].short}</span>
        {isDesktop ? <span className="font-system text-[15px] text-amber-200">+[цена] ₽</span> : null}
      </button>
    );
  });
  const engraving = (
    <label className={cn("flex flex-col gap-2 font-semibold", { "text-caption": isDesktop })}>
      4 · Текст на бирке
      <input
        type="text"
        maxLength={GIFT_ENGRAVING_LENGTH}
        value={gift.engraving}
        onChange={(event) => update({ engraving: event.target.value })}
        placeholder={GIFT_DEFAULT_ENGRAVING}
        className={cn(
          "w-full min-w-0 rounded-[14px] border border-cellar-700 bg-cellar-950 font-system font-normal text-white outline-none placeholder:text-cellar-400 focus:border-amber-350",
          { "h-14 px-4.5 text-[17px]": isDesktop, "h-13 px-4 text-sm": !isDesktop }
        )}
      />
    </label>
  );
  const price = (
    <div className={cn("flex items-baseline justify-between", { "border-t border-cellar-700 pt-3.5": isDesktop })}>
      <span className={cn("text-neutral-350", { "text-[17px]": isDesktop })}>за подарок</span>
      <span className={cn("font-system font-semibold text-amber-200", { "text-xl": isDesktop, "text-lg": !isDesktop })}>[цена] ₽</span>
    </div>
  );

  const intro = (
    <section className={cn("flex flex-col", { "mx-auto max-w-480 gap-3.5 px-10 2xl:px-30": isDesktop, "gap-2.5 px-5": !isDesktop })}>
      <div className={cn("flex flex-col", { "max-w-215 gap-3.5": isDesktop, "gap-2.5": !isDesktop })}>
        <Eyebrow size={isDesktop ? "lg" : "sm"} labelClassName={cn({ "text-[22px]": isDesktop })}>
          {isDesktop ? "Корпоративные подарки • Corporate gifts" : "Корпоративные подарки"}
        </Eyebrow>
        <Text as="h1" FONT="FIRM" className={cn({ "text-4xl leading-32 text-shadow-2xl": isDesktop, "text-title leading-15 text-shadow-lg": !isDesktop })}>
          Подарок, который откроют
        </Text>
        <Text COLOR="MUTED" className={cn({ "text-[21px] leading-[1.55]": isDesktop, "text-sm leading-[1.55]": !isDesktop })}>
          {isDesktop
            ? "Соберите ящик для партнёров и команды: выберите упаковку, вина и бирку с гравировкой. От 10 подарков — с подбором сомелье и вашим логотипом."
            : "Соберите ящик для партнёров: упаковка, вина и бирка с гравировкой. От 10 подарков."}
        </Text>
      </div>
    </section>
  );

  const settings = (
    <section
      aria-label="Состав подарка"
      className={cn("flex flex-col border border-amber-200/30 bg-cellar-900", {
        "gap-5.5 rounded-3xl p-9 shadow-panel": isDesktop,
        "mx-4 gap-4 rounded-[20px] p-5": !isDesktop,
      })}
    >
      {step("1 · Упаковка", packs)}
      {step(isDesktop ? "2 · Сколько бутылок" : "2 · Бутылок", (
        <>
          {counts}
          {isDesktop ? (
            <Link to={ROUTES.shop} className="text-[15px] text-amber-200 hover:text-paper">
              Выбрать вина самому →
            </Link>
          ) : null}
        </>
      ))}
      {step("3 · Дополнения", <div className="flex flex-col">{extras}</div>)}
      {engraving}
      {isDesktop
        ? step(
            "5 · Тираж",
            radios<GiftRun>(
              "Тираж",
              (Object.keys(GIFT_RUNS) as GiftRun[]).map((run) => ({
                value: run,
                content: (
                  <>
                    <span className="font-semibold">{GIFT_RUNS[run].title}</span>
                    <span className="text-[13px] opacity-80">{GIFT_RUNS[run].note}</span>
                  </>
                ),
              })),
              gift.run,
              (run) => update({ run })
            )
          )
        : null}
      {price}
      {isDesktop ? (
        <a
          href={`#${GIFT_FORM_ANCHOR}`}
          className="inline-flex h-15 items-center justify-center rounded-full bg-amber-350 px-8 text-caption font-semibold text-black no-underline transition-colors hover:bg-amber-200"
        >
          Запросить предложение
        </a>
      ) : null}
    </section>
  );

  const request = (
    <section
      id={GIFT_FORM_ANCHOR}
      aria-labelledby="gift-request"
      className={cn("scroll-mt-28 border border-cellar-700", {
        "grid grid-cols-2 gap-14 rounded-3xl bg-cellar-950/80 px-14 py-12": isDesktop,
        "mx-4 mt-7 mb-10 flex flex-col gap-3 rounded-[20px] bg-cellar-950/82 p-5": !isDesktop,
      })}
    >
      <div className={cn("flex flex-col", { "gap-3.5": isDesktop, "gap-2": !isDesktop })}>
        <Text as="h2" id="gift-request" FONT="FIRM" className={cn({ "text-display-sm leading-19": isDesktop, "text-[32px] leading-11.5": !isDesktop })}>
          Обсудим подарки
        </Text>
        <Text COLOR="MUTED" className={cn("leading-[1.55]", { "text-caption": isDesktop, "text-micro": !isDesktop })}>
          {isDesktop
            ? "Пришлём макет бирки и смету за день. Готовые подарки забираете в бутике в удобный день — соберём и упакуем заранее."
            : "Пришлём макет бирки и смету за день. Готовые подарки забираете в бутике."}
        </Text>
        {isDesktop ? (
          <ul className="m-0 mt-1.5 flex list-none flex-wrap gap-2.5 p-0">
            {PERKS.map((perk) => (
              <li key={perk} className="rounded-full bg-cellar-800 px-4 py-2 text-[15px]">
                {perk}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <GiftRequestForm gift={gift} variant={variant} />
    </section>
  );

  return (
    <>
      {intro}
      {isDesktop ? (
        <>
          <section aria-label="Конструктор подарка" className="mx-auto mt-12 grid max-w-480 grid-cols-[minmax(0,1fr)_minmax(420px,600px)] items-start gap-12 px-10 2xl:px-30">
            <GiftPreview gift={gift} variant={variant} />
            {settings}
          </section>
          <div className="mx-auto my-24 max-w-480 px-10 2xl:px-30">{request}</div>
        </>
      ) : (
        <>
          <div className="mx-4 mt-4">
            <GiftPreview gift={gift} variant={variant} />
          </div>
          {settings}
          {request}
        </>
      )}
    </>
  );
};

export default GiftBuilder;
