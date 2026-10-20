import { useState, type FC } from "react";
import { Link } from "react-router";
import { useGetBoutiquesQuery } from "@/entities/boutique";
import { ROUTES } from "@/shared/config/routes";
import { asset } from "@/shared/lib/asset";
import { cn } from "@/shared/lib/cn";
import { MEDIA, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import { ButtonLink, Eyebrow, Text } from "uikit;/";
import { BOUTIQUES_ANCHOR, RESERVATION_RULES, ROUTE_STOPS } from "../model/mock";

/** Координаты на карте 1680×760 → проценты фигуры: карта сжимается вместе со страницей */
const MAP = { width: 1680, height: 760 };
const pct = (value: number, of: number) => `${(value / of) * 100}%`;
/** Кегль, который сжимается с картой (ширина карты — 100cqw), но не меньше `min` */
const mapFont = (px: number, min: number) => `clamp(${min}px, ${(px / MAP.width) * 100}cqw, ${px}px)`;

const stopLink = (to: string, className: string, children: string) =>
  to.startsWith("#") ? (
    <a href={to} className={className}>
      {children}
    </a>
  ) : (
    <Link to={to} className={className}>
      {children}
    </Link>
  );

/**
 * Самовывоз (/pickup, макеты Pickup и MPickup): старая карта с четырьмя остановками пути бутылки,
 * правила брони и бутики (GET /boutiques) с «Забронировать сюда»
 */
const PickupRoute: FC = () => {
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const [current, setCurrent] = useState(1);
  const { data: boutiques } = useGetBoutiquesQuery();
  const stop = ROUTE_STOPS[current];

  const mapBackground = (
    <>
      <img src={asset("/images/pickup/old-map.webp")} alt="" className="absolute inset-0 size-full object-cover opacity-70 mix-blend-multiply" />
      <div aria-hidden="true" className="absolute inset-0 inset-shadow-map" />
    </>
  );

  const intro = (
    <section className={cn("flex flex-col", { "mx-auto max-w-480 gap-3.5 px-10 2xl:px-30": isDesktop, "gap-2.5 px-5": !isDesktop })}>
      <Eyebrow size={isDesktop ? "lg" : "sm"} labelClassName={cn({ "text-[22px]": isDesktop })}>
        {isDesktop ? "Покупателям • Pickup" : "Покупателям"}
      </Eyebrow>
      <Text as="h1" FONT="FIRM" className={cn({ "text-4xl leading-32 text-shadow-2xl": isDesktop, "text-title leading-15 text-shadow-lg": !isDesktop })}>
        Путь бутылки к вам
      </Text>
      <Text COLOR="MUTED" className={cn({ "max-w-250 text-[21px] leading-[1.55]": isDesktop, "text-sm leading-[1.55]": !isDesktop })}>
        {isDesktop
          ? "По закону мы не доставляем алкоголь. Зато бронируем бутылку на ваше имя и держим её в погребе, пока вы не придёте. Вот как это устроено."
          : "По закону мы не доставляем алкоголь. Бронируем бутылку на ваше имя и держим в погребе, пока вы не придёте."}
      </Text>
    </section>
  );

  const rules = (
    <section aria-labelledby="pickup-rules" className={cn({ "rounded-3xl border border-cellar-700 bg-cellar-950/80 px-11 py-10": isDesktop })}>
      <Text as="h2" id="pickup-rules" FONT="FIRM" className={cn({ "text-display-sm leading-19": isDesktop, "text-[32px] leading-11.5": !isDesktop })}>
        Правила брони
      </Text>
      <ul className={cn("m-0 flex list-none flex-col p-0", { "mt-5 gap-4 text-caption leading-[1.5]": isDesktop, "mt-2.5 gap-2.5 text-[15px] leading-[1.45]": !isDesktop })}>
        {RESERVATION_RULES.map((rule) => (
          <li key={rule.key} className={cn({ "grid grid-cols-[34px_1fr] gap-2.5": isDesktop })}>
            <span aria-hidden="true" className={cn("text-amber-350", { "text-[22px]": isDesktop })}>
              ✦
            </span>{" "}
            <span>
              <strong className="font-semibold text-amber-200">{rule.key}</strong> — {isDesktop ? rule.desktop : rule.mobile}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );

  const shops = (
    <section id={BOUTIQUES_ANCHOR} aria-labelledby="pickup-boutiques" className={cn("flex scroll-mt-28 flex-col", { "gap-6": isDesktop, "gap-3": !isDesktop })}>
      <Text as="h2" id="pickup-boutiques" FONT="FIRM" className={cn({ "text-display-sm leading-19": isDesktop, "text-[32px] leading-11.5": !isDesktop })}>
        Где забрать
      </Text>
      {boutiques?.map((boutique) => (
        <div
          key={boutique.id}
          className={cn("rounded-3xl border border-cellar-700 bg-cellar-950/80", {
            "grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2.5 px-8.5 py-7.5": isDesktop,
            "flex flex-col gap-1.5 rounded-[20px] p-4.5": !isDesktop,
          })}
        >
          <span className={cn("font-firm", { "text-[32px] leading-11": isDesktop, "text-[22px]": !isDesktop })}>{boutique.name}</span>
          <ButtonLink
            to={`${ROUTES.reserve}?${new URLSearchParams({ boutique: boutique.id })}`}
            size={isDesktop ? "xl" : "md"}
            className={cn({ "row-span-3": isDesktop, "order-last mt-2 w-full": !isDesktop })}
          >
            Забронировать сюда
          </ButtonLink>
          <span className={cn("text-neutral-350", { "text-caption": isDesktop, "text-[15px]": !isDesktop })}>{boutique.address}</span>
          <span className={cn("text-amber-200", { "text-sm": isDesktop, "text-micro": !isDesktop })}>
            {boutique.hours} · {boutique.phone}
          </span>
        </div>
      ))}
    </section>
  );

  if (!isDesktop) {
    return (
      <div className="pb-10">
        {intro}
        <figure className="relative m-0 mx-4 mt-5.5 overflow-hidden rounded-md bg-map px-4.5 pt-6.5 pb-2.5 shadow-panel">
          {mapBackground}
          <ol className="relative m-0 flex list-none flex-col gap-5.5 p-0">
            {ROUTE_STOPS.map((item, index) => (
              <li key={item.title} className="grid grid-cols-[56px_1fr] items-start gap-3">
                <span
                  className={cn("flex size-12.5 items-center justify-center rounded-full border-3 border-map-ink font-paper text-[22px] font-bold", {
                    "bg-primary-500 text-paper": index === 1,
                    "bg-paper/70 text-map-ink": index !== 1,
                  })}
                >
                  {index + 1}
                </span>
                <span className={cn("bg-paper px-4 py-3.5 text-label-ink shadow-tag", { "-rotate-1": index % 2 === 0, "rotate-1": index % 2 === 1 })}>
                  <span className="block font-hand text-[30px] leading-none font-bold">{item.title}</span>
                  <span className="mt-1.5 block font-paper text-sm leading-[1.45]">{item.text.mobile}</span>
                  {stopLink(item.link.to, "mt-1.5 inline-block text-micro text-primary-500", item.link.label.mobile)}
                </span>
              </li>
            ))}
          </ol>
        </figure>
        <div className="mx-4 mt-6 rounded-[20px] border border-cellar-700 bg-cellar-950/82 p-5">{rules}</div>
        <div className="mx-4 mt-6">{shops}</div>
      </div>
    );
  }

  return (
    <div className="pb-30">
      {intro}
      <div className="mx-auto mt-12 max-w-480 px-10 2xl:px-30">
        <figure className="@container relative m-0 aspect-[1680/760] overflow-hidden rounded-md bg-map shadow-panel">
          {mapBackground}
          <svg aria-hidden="true" viewBox={`0 0 ${MAP.width} ${MAP.height}`} className="absolute inset-0 size-full text-map-ink">
            <path
              d="M150 560 C 320 380, 420 640, 600 470 S 860 200, 1040 330 S 1320 560, 1520 250"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray="14 12"
              strokeLinecap="round"
            />
            <path d="M1500 236 l 30 6 -14 26" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <g stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5">
              <circle cx="1560" cy="640" r="60" />
              <path d="M1560 570 v140 M1490 640 h140" />
            </g>
            <text x="1552" y="566" fontFamily="Old Standard TT" fontSize="22" fill="currentColor">
              С
            </text>
          </svg>

          {ROUTE_STOPS.map((item, index) => {
            const active = index === current;
            return (
              <button
                key={item.title}
                type="button"
                aria-pressed={active}
                onClick={() => setCurrent(index)}
                className="absolute flex cursor-pointer items-center gap-3 border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-map-ink"
                style={{ left: pct(item.pin.x, MAP.width), top: pct(item.pin.y, MAP.height) }}
              >
                <span
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-full border-3 border-map-ink font-paper font-bold shadow-tag transition-transform duration-250",
                    { "scale-115 bg-primary-500 text-paper": active, "bg-paper/60 text-map-ink": !active }
                  )}
                  style={{ width: mapFont(64, 40), fontSize: mapFont(28, 18) }}
                >
                  {index + 1}
                </span>
                <span className="font-hand leading-none font-bold text-map-ink" style={{ fontSize: mapFont(34, 22) }}>
                  {item.title}
                </span>
              </button>
            );
          })}

          <div
            aria-live="polite"
            className="absolute -rotate-[1.5deg] bg-paper text-label-ink shadow-tag"
            style={{ left: pct(60, MAP.width), top: pct(50, MAP.height), width: pct(520, MAP.width), padding: `${mapFont(26, 16)} ${mapFont(30, 18)}` }}
          >
            <span className="font-paper tracking-[0.24em] text-primary-500 uppercase" style={{ fontSize: mapFont(14, 11) }}>
              Шаг {current + 1} из {ROUTE_STOPS.length}
            </span>
            <div className="mt-1.5 font-hand leading-none font-bold" style={{ fontSize: mapFont(44, 26) }}>
              {stop.title}
            </div>
            <p className="m-0 mt-2.5 font-paper leading-[1.5]" style={{ fontSize: mapFont(19, 13) }}>
              {stop.text.desktop}
            </p>
            {stopLink(stop.link.to, "mt-3 inline-block font-regular text-primary-500", stop.link.label.desktop)}
          </div>
        </figure>
      </div>
      <div className="mx-auto mt-24 grid max-w-480 grid-cols-2 gap-10 px-10 2xl:px-30">
        {rules}
        {shops}
      </div>
    </div>
  );
};

export default PickupRoute;
