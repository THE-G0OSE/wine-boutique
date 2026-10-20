import { useState, type FC } from "react";
import { Link } from "react-router";
import { crateMonthGenitive, crateStencil, useGetMonthlyCratesQuery, type MonthlyCrate, type MonthlyPlan } from "@/entities/monthlyCrate";
import { MonthlySubscribeForm } from "@/features/monthly/subscribeMonthly";
import { ROUTES } from "@/shared/config/routes";
import { asset } from "@/shared/lib/asset";
import { cn } from "@/shared/lib/cn";
import { MEDIA, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import { buttonClasses, Eyebrow, Text } from "uikit;/";
import { HERO_BOTTLES, MONTHLY_ANCHORS, MONTHLY_PLANS } from "../model/mock";
import Crate from "./components/crate/Crate";

/** Сцена hero в макете: Monthly — 860×700 (правая колонка), MMonthly — 390×380 */
const FIGURE = { desktop: { width: 860, height: 700 }, mobile: { width: 390, height: 380 } };

/**
 * Набор месяца (/monthly, макеты Monthly и MMonthly): ящик месяца с запиской сомелье (GET /monthly), тарифы,
 * подписка (POST /monthly/subscriptions) и прошлые ящики с описью
 */
const MonthlyCrateShowcase: FC = () => {
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const variant = isDesktop ? "desktop" : "mobile";
  const { data } = useGetMonthlyCratesQuery();
  const [plan, setPlan] = useState<MonthlyPlan>("classic");
  const [archiveMonth, setArchiveMonth] = useState<string | null>(null);
  const figure = FIGURE[variant];
  const px = (value: number) => `${(value / figure.width) * 100}cqw`;

  const current = data?.current;
  const selected: MonthlyCrate | undefined = data?.archive.find((crate) => crate.month === archiveMonth) ?? data?.archive[0];

  const hero = (
    <div className="@container">
      <figure className="relative m-0" style={{ height: px(figure.height) }}>
        {isDesktop ? (
          <div aria-hidden="true" className="absolute rounded-[50%] bg-[radial-gradient(ellipse,rgb(232_184_120/0.3),transparent_65%)]" style={{ left: px(60), right: px(60), top: px(80), bottom: px(40) }} />
        ) : null}
        <div className="absolute flex items-end" style={{ left: px(isDesktop ? 110 : 50), top: px(isDesktop ? 40 : 20), gap: px(isDesktop ? 22 : 6) }}>
          {HERO_BOTTLES.map((src, index) => (
            <img
              key={src}
              src={asset(src)}
              alt=""
              className={cn("w-auto drop-shadow-bottle", { "-rotate-4": index === 0, "rotate-5": index === 2 })}
              style={{ height: px(index === 1 ? (isDesktop ? 460 : 240) : isDesktop ? 420 : 220) }}
            />
          ))}
        </div>
        {current ? (
          <>
            <div
              className="absolute"
              style={isDesktop ? { left: px(40), top: px(330), width: px(680), height: px(340) } : { left: px(20), right: px(20), top: px(170), height: px(190) }}
            >
              <Crate crate={current} size="hero" className="size-full" />
            </div>
            <div
              className="absolute box-border bg-paper font-hand text-label-ink shadow-ticket"
              style={
                isDesktop
                  ? { right: 0, top: 0, width: px(290), padding: `${px(26)} ${px(26)} ${px(22)}`, transform: "rotate(6deg)" }
                  : { right: px(14), top: 0, width: px(150), padding: px(14), transform: "rotate(6deg)" }
              }
            >
              <span
                aria-hidden="true"
                className="absolute left-1/2 size-6 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_35%_35%,var(--color-primary-200),var(--color-primary-500))] shadow-tag"
                style={{ top: "-12px" }}
              />
              {isDesktop ? (
                <>
                  <div className="text-[30px] leading-[1.1]">
                    Тема {crateMonthGenitive(current.month)}: «{current.theme}»
                  </div>
                  <ol className="m-0 mt-3 pl-5.5 text-lg leading-[1.3]">
                    {current.wines.map((wine) => (
                      <li key={wine}>{wine}</li>
                    ))}
                  </ol>
                  <div className="mt-2.5 text-[22px] text-paper-ink">— {current.sommelier}</div>
                </>
              ) : (
                <div className="text-[19px] leading-[1.1]">Тема: «{current.theme}»</div>
              )}
            </div>
          </>
        ) : null}
      </figure>
    </div>
  );

  const intro = (
    <section
      className={cn({
        "mx-auto grid min-h-197 max-w-480 grid-cols-[minmax(0,760px)_minmax(0,1fr)] items-center gap-15 px-10 2xl:px-30": isDesktop,
        "flex flex-col": !isDesktop,
      })}
    >
      <div className={cn("flex flex-col", { "gap-3.5": isDesktop, "gap-2.5 px-5": !isDesktop })}>
        <Eyebrow size={isDesktop ? "lg" : "sm"} labelClassName={cn({ "text-[22px]": isDesktop })}>
          {isDesktop ? "Набор месяца • Monthly crate" : "Набор месяца"}
        </Eyebrow>
        <Text as="h1" FONT="FIRM" className={cn({ "text-4xl leading-32 text-shadow-2xl": isDesktop, "text-title leading-15 text-shadow-lg": !isDesktop })}>
          Ящик, который ждёт вас
        </Text>
        <Text COLOR="MUTED" className={cn({ "text-[21px] leading-[1.55]": isDesktop, "text-sm leading-[1.55]": !isDesktop })}>
          {isDesktop
            ? "Каждый месяц сомелье собирает ящик из трёх вин на одну тему и откладывает его на ваше имя. Заходите в бутик в удобный день — забираете ящик и записку о том, что внутри и как это пить."
            : "Каждый месяц сомелье собирает три вина на одну тему и откладывает ящик на ваше имя."}
        </Text>
        {isDesktop ? (
          <div className="mt-3.5 flex gap-4">
            <a href={`#${MONTHLY_ANCHORS.plans}`} className={buttonClasses({ size: "xl" })}>
              Выбрать набор
            </a>
            <a href={`#${MONTHLY_ANCHORS.archive}`} className={buttonClasses({ variant: "outline", size: "xl", className: "border-amber-200/50 bg-cellar-950/60" })}>
              Прошлые ящики
            </a>
          </div>
        ) : null}
      </div>
      <div className={cn({ "mt-2.5": !isDesktop })}>{hero}</div>
    </section>
  );

  const plans = (
    <section
      id={MONTHLY_ANCHORS.plans}
      aria-labelledby="monthly-plans"
      className={cn("scroll-mt-28", { "mx-auto mt-14 max-w-480 px-10 2xl:px-30": isDesktop, "mx-4 mt-2.5": !isDesktop })}
    >
      <Text as="h2" id="monthly-plans" FONT="FIRM" className={cn({ "text-display-sm leading-19": isDesktop, "text-[32px] leading-11.5": !isDesktop })}>
        {isDesktop ? "Какой ящик откладывать" : "Какой ящик"}
      </Text>
      <div role="radiogroup" aria-label="Размер набора" className={cn({ "mt-7 grid grid-cols-3 gap-6": isDesktop, "mt-3 flex flex-col gap-2.5": !isDesktop })}>
        {MONTHLY_PLANS.map((item) => {
          const checked = item.id === plan;
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => setPlan(item.id)}
              className={cn(
                "cursor-pointer text-left text-white transition-[transform,border-color] duration-250 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200",
                {
                  "flex min-h-75 flex-col items-start gap-2.5 rounded-3xl p-8": isDesktop,
                  "grid grid-cols-[50px_1fr_auto] items-center gap-3 rounded-[18px] px-4 py-3.5": !isDesktop,
                  "border-2 border-amber-350 bg-amber-350/14": checked,
                  "border border-cellar-700 bg-cellar-950/80 hover:border-amber-350/60": !checked,
                  "-translate-y-1.5": checked && isDesktop,
                }
              )}
            >
              <span className={cn("font-paper-display font-bold text-amber-200", { "text-display leading-none": isDesktop, "text-3xl leading-none": !isDesktop })}>{item.count}</span>
              {isDesktop ? (
                <>
                  <span className="font-firm text-[32px] leading-11">{item.title}</span>
                  <span className="text-[17px] leading-[1.55] text-neutral-350">{item.text.desktop}</span>
                  <span className="mt-auto font-system text-lg font-semibold">
                    [цена] ₽ <span className="text-sm font-normal text-neutral-350">в месяц</span>
                  </span>
                </>
              ) : (
                <>
                  <span className="flex flex-col">
                    <b>{item.title}</b>
                    <span className="text-[13px] text-neutral-350">{item.text.mobile}</span>
                  </span>
                  <span className="font-system font-semibold">[цена] ₽</span>
                </>
              )}
            </button>
          );
        })}
      </div>
      <div className={cn({ "mt-7": isDesktop, "mt-4": !isDesktop })}>
        <MonthlySubscribeForm plan={plan} variant={variant} />
      </div>
    </section>
  );

  const note = selected ? (
    <aside
      aria-live="polite"
      aria-label="Опись ящика"
      className={cn("relative bg-paper font-hand text-label-ink shadow-panel", {
        "-rotate-1 px-8.5 pt-8.5 pb-7.5": isDesktop,
        "mt-4 p-5": !isDesktop,
      })}
    >
      <div className={cn("text-primary-500", { "text-[22px]": isDesktop, "text-lg": !isDesktop })}>
        {crateStencil(selected.month, selected.wines.length).month} {selected.month.slice(0, 4)}
      </div>
      <div className={cn({ "text-[38px] leading-[1.1]": isDesktop, "text-[28px] leading-[1.1]": !isDesktop })}>«{selected.theme}»</div>
      <ol className={cn("m-0", { "mt-4 pl-6.5 text-[28px] leading-[1.35]": isDesktop, "mt-2 pl-5 text-[22px] leading-[1.35]": !isDesktop })}>
        {selected.wines.map((wine) => (
          <li key={wine}>{wine}</li>
        ))}
      </ol>
      <Link to={ROUTES.shop} className="mt-4 inline-block font-regular text-sm text-primary-500 hover:text-primary-350">
        Эти вина на полках →
      </Link>
    </aside>
  ) : null;

  const archive = data?.archive.length ? (
    <section
      id={MONTHLY_ANCHORS.archive}
      aria-labelledby="monthly-archive"
      className={cn("scroll-mt-28", { "mx-auto my-24 max-w-480 px-10 2xl:px-30": isDesktop, "mt-7.5 mb-10": !isDesktop })}
    >
      <Text as="h2" id="monthly-archive" FONT="FIRM" className={cn({ "text-display-sm leading-19": isDesktop, "mx-5 text-[32px] leading-11.5": !isDesktop })}>
        Прошлые ящики
      </Text>
      <div className={cn({ "mt-7 grid grid-cols-[minmax(0,1fr)_minmax(360px,520px)] items-start gap-10": isDesktop, "mt-3 px-4": !isDesktop })}>
        <div
          role="radiogroup"
          aria-label="Архив наборов"
          className={cn({ "grid grid-cols-3 gap-x-6 gap-y-7": isDesktop, "-mx-4 flex gap-3 overflow-x-auto px-4 pt-2 pb-3 [scrollbar-width:none]": !isDesktop })}
        >
          {data.archive.map((crate) => {
            const checked = crate.month === selected?.month;
            const stencil = crateStencil(crate.month, crate.wines.length);
            return (
              <button
                key={crate.month}
                type="button"
                role="radio"
                aria-checked={checked}
                aria-label={`Набор ${stencil.month.toLowerCase()} ${stencil.year}: ${crate.theme}`}
                onClick={() => setArchiveMonth(crate.month)}
                className={cn(
                  "flex shrink-0 cursor-pointer flex-col gap-3 rounded-md border-0 bg-transparent p-0 text-left transition-transform duration-250",
                  "outline-offset-8 focus-visible:outline-2 focus-visible:outline-amber-200",
                  { "outline-2 outline-amber-350": checked, "-translate-y-2": checked && isDesktop, "outline-offset-4": !isDesktop }
                )}
              >
                <Crate crate={crate} size="thumb" className={cn({ "h-37.5 w-full": isDesktop, "h-20 w-30": !isDesktop })} />
                {isDesktop ? <span className="text-sm text-neutral-350">{crate.theme}</span> : null}
              </button>
            );
          })}
        </div>
        {note}
      </div>
    </section>
  ) : null;

  return (
    <>
      {intro}
      {plans}
      {archive}
    </>
  );
};

export default MonthlyCrateShowcase;
