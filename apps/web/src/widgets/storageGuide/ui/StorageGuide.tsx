import { useState, type FC, type ReactNode } from "react";
import { Link } from "react-router";
import { ROUTES } from "@/shared/config/routes";
import { asset } from "@/shared/lib/asset";
import { cn } from "@/shared/lib/cn";
import { MEDIA, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import { Text } from "uikit;/";
import { AGING, AGING_LABELS, agingScale, CONDITIONS, POSITIONS, SERVING, THERMOMETER_MAX, THERMOMETER_TICKS } from "../model/mock";

/**
 * Справочник хранения (/storage, макеты Storage и MStorage): страница «Справочника погреба» на старой бумаге —
 * термометр по типам вин, положение бутылки, условия и шкала выдержки
 */
const StorageGuide: FC = () => {
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const [selected, setSelected] = useState(4);
  const serving = SERVING[selected];
  const v = <T,>(value: { desktop: T; mobile: T }) => (isDesktop ? value.desktop : value.mobile);

  const table = (title: { desktop: string; mobile: string }, label: { desktop: string; mobile: string }, children: ReactNode, wide = false) => (
    <section
      aria-label={title.desktop}
      className={cn("flex flex-col border border-ink outline outline-ink", {
        "gap-3.5 px-7.5 py-7 outline-offset-[-6px]": isDesktop,
        "mt-4 p-4 outline-offset-[-5px]": !isDesktop,
        "col-span-full": wide,
      })}
    >
      <div className={cn("flex items-baseline justify-between border-b border-ink", { "pb-2": isDesktop, "pb-1.5": !isDesktop })}>
        <Text as="h2" FONT="PAPER_DISPLAY" className={cn({ "text-[38px]": isDesktop, "text-[26px]": !isDesktop })}>
          {v(title)}
        </Text>
        <span className={cn("uppercase", { "text-[15px] tracking-[0.24em]": isDesktop, "text-[10px] tracking-[0.2em]": !isDesktop })}>{v(label)}</span>
      </div>
      <div className={cn({ "mt-3": !isDesktop })}>{children}</div>
    </section>
  );

  // Термометр: колба и шарик, ртуть поднимается до середины диапазона подачи
  const tube = isDesktop ? { width: 60, height: 380, glass: 330, bulb: 52, column: 24, mercury: 12, base: 40 } : { width: 40, height: 250, glass: 216, bulb: 36, column: 16, mercury: 8, base: 30 };
  const level = (degrees: number) => ((tube.glass - tube.base) * degrees) / THERMOMETER_MAX;
  const thermometer = (
    <div role="img" aria-label={`${serving.title.desktop}: ${serving.range.desktop}`} className="relative mx-auto" style={{ width: tube.width, height: tube.height }}>
      <span
        className="absolute top-0 rounded-full border-2 border-ink bg-white/40"
        style={{ left: (tube.width - tube.column) / 2, width: tube.column, height: tube.glass }}
      />
      <span
        className="absolute rounded-full bg-primary-500 transition-[height] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none"
        style={{ left: (tube.width - tube.mercury) / 2, bottom: tube.base, width: tube.mercury, height: level(serving.degrees) }}
      />
      <span className="absolute bottom-0 rounded-full border-2 border-ink bg-primary-500" style={{ left: (tube.width - tube.bulb) / 2, width: tube.bulb, height: tube.bulb }} />
      {isDesktop
        ? THERMOMETER_TICKS.map((degrees) => (
            <span
              key={degrees}
              aria-hidden="true"
              className="absolute left-12 bg-[linear-gradient(var(--color-ink),var(--color-ink))] bg-size-[8px_1px] bg-position-[0_50%] bg-no-repeat pl-3 text-micro whitespace-nowrap"
              style={{ bottom: tube.base + level(degrees) - 9 }}
            >
              {degrees}°
            </span>
          ))
        : null}
    </div>
  );

  const temperature = table(
    { desktop: "Температура", mobile: "Температура" },
    { desktop: "Таблица I", mobile: "Табл. I" },
    <>
      <div className={cn("grid items-center", { "grid-cols-[120px_1fr] gap-6.5": isDesktop, "grid-cols-[60px_1fr] gap-3.5": !isDesktop })}>
        {thermometer}
        <div className={cn("flex flex-col", { "gap-2": isDesktop, "gap-1.5": !isDesktop })} role="group" aria-label="Тип вина">
          {SERVING.map((item, index) => {
            const on = index === selected;
            return (
              <button
                key={item.title.desktop}
                type="button"
                aria-pressed={on}
                onClick={() => setSelected(index)}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded border border-ink font-paper transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500",
                  { "h-11 px-4 text-caption": isDesktop, "h-9 px-2.5 text-micro": !isDesktop, "bg-ink text-paper": on, "bg-transparent text-ink hover:bg-ink/8": !on }
                )}
              >
                <span>{v(item.title)}</span>
                <span className="font-bold">{v(item.range)}</span>
              </button>
            );
          })}
          {isDesktop ? <p className="m-0 mt-1.5 text-[17px] leading-normal italic">Хранить — при +10…14 °C для всех. Цифры справа — температура подачи.</p> : null}
        </div>
      </div>
      {isDesktop ? null : <p className="m-0 mt-2.5 text-micro italic">Хранить — при +10…14 °C. Справа — температура подачи.</p>}
    </>
  );

  const bottle = asset("/images/bottles/red.webp");
  const positions = table(
    { desktop: "Положение бутылки", mobile: "Положение" },
    { desktop: "Таблица II", mobile: "Табл. II" },
    <div className={cn({ "grid grid-cols-3 gap-4.5 text-center": isDesktop, "flex flex-col gap-2.5": !isDesktop })}>
      {POSITIONS.map((position) => {
        const mark = (
          <span className={cn({ "text-ink-green": position.ok, "text-primary-500": !position.ok })} aria-label={position.ok ? "можно" : "нельзя"}>
            {position.ok ? "✓" : "✕"}
          </span>
        );
        return isDesktop ? (
          <figure key={position.title.desktop} className="m-0 flex flex-col items-center gap-2.5">
            <span className="flex size-37.5 items-center justify-center">
              <img src={bottle} alt="" className="h-37.5 w-auto" style={{ transform: `rotate(${position.angle}deg)` }} />
            </span>
            <span className="font-paper-display text-[26px]">
              {position.title.desktop} {mark}
            </span>
            <figcaption className="text-sm leading-[1.45]">{position.text.desktop}</figcaption>
          </figure>
        ) : (
          <div key={position.title.desktop} className="grid grid-cols-[80px_1fr] items-center gap-3">
            <span className="flex h-20 items-center justify-center">
              <img src={bottle} alt="" className="h-20 w-auto" style={{ transform: `rotate(${position.angle}deg)` }} />
            </span>
            <span>
              <b className="font-paper-display text-[22px] font-normal">
                {position.title.mobile} {mark}
              </b>
              <span className="block text-micro leading-[1.45]">{position.text.mobile}</span>
            </span>
          </div>
        );
      })}
    </div>
  );

  const conditions = table(
    { desktop: "Условия", mobile: "Условия" },
    { desktop: "Таблица III", mobile: "Табл. III" },
    <div className={cn({ "grid grid-cols-2 gap-5": isDesktop, "flex flex-col gap-3": !isDesktop })}>
      {CONDITIONS.map((condition) => (
        <div key={condition.title} className={cn("grid items-start", { "grid-cols-[60px_1fr] gap-3.5": isDesktop, "grid-cols-[44px_1fr] gap-2.5": !isDesktop })}>
          <span
            aria-hidden="true"
            className={cn("flex items-center justify-center rounded-full border-2 border-ink font-paper-display", { "size-14 text-[28px]": isDesktop, "size-10 text-md": !isDesktop })}
          >
            {condition.icon}
          </span>
          <span className="flex flex-col gap-0.5">
            <span className={cn("font-bold", { "text-md": isDesktop, "text-sm": !isDesktop })}>{condition.title}</span>
            <span className={cn({ "text-[17px] leading-[1.45]": isDesktop, "text-micro leading-[1.45]": !isDesktop })}>{v(condition.text)}</span>
          </span>
        </div>
      ))}
    </div>,
    true
  );

  const hatch = "border-[1.5px] border-ink bg-[repeating-linear-gradient(45deg,var(--color-ink)_0_3px,transparent_3px_7px)]";
  const aging = table(
    { desktop: "Сколько можно ждать", mobile: "Сколько ждать" },
    { desktop: "Таблица IV", mobile: "Табл. IV" },
    <div className={cn("flex flex-col", { "gap-3": isDesktop, "gap-2.5": !isDesktop })}>
      {isDesktop ? (
        <div aria-hidden="true" className="grid grid-cols-[220px_repeat(5,minmax(0,1fr))] text-micro tracking-[0.1em]">
          <span />
          {AGING_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      ) : null}
      {AGING.map((row) => {
        const label = `${row.from}–${row.to}${row.to >= 30 ? "+" : ""} лет`;
        const left = isDesktop ? agingScale(row.from) : (row.from / 30) * 100;
        const width = isDesktop ? agingScale(row.to) - agingScale(row.from) : ((Math.min(row.to, 30) - row.from) / 30) * 100;
        return isDesktop ? (
          <div key={row.title} className="grid grid-cols-[220px_1fr] items-center">
            <span className="text-caption">{row.title}</span>
            <span role="img" aria-label={`${row.title}: от ${row.from} до ${row.to}${row.to >= 30 ? "+" : ""} лет`} className="relative h-5.5 border-b border-dotted border-ink">
              <span className={cn("absolute top-1 h-3.5 rounded-full", hatch)} style={{ left: `${left}%`, width: `${width}%` }} />
            </span>
          </div>
        ) : (
          <div key={row.title}>
            <span className="text-micro">
              {row.title} — <b>{label}</b>
            </span>
            <span role="img" aria-label={`${row.title}: ${label}`} className="relative mt-1 block h-3 border-b border-dotted border-ink">
              <span className={cn("absolute top-0 h-2.5 rounded-full", hatch, "bg-[repeating-linear-gradient(45deg,var(--color-ink)_0_2px,transparent_2px_5px)]")} style={{ left: `${left}%`, width: `${width}%` }} />
            </span>
          </div>
        );
      })}
    </div>,
    true
  );

  return (
    <article
      className={cn("relative box-border font-paper text-ink shadow-panel", {
        "mx-auto mt-0 mb-24 w-[min(1500px,calc(100%-80px))] px-16 pt-14 pb-15": isDesktop,
        "mx-2.5 mb-10 px-4 pt-5.5 pb-6": !isDesktop,
      })}
    >
      <img src={asset("/images/textures/newspaper.webp")} alt="" className="absolute inset-0 size-full object-cover" />
      <div aria-hidden="true" className="absolute inset-0 bg-[rgb(250_245_234/0.45)] shadow-[inset_0_0_140px_rgb(120_85_35/0.22)]" />
      <div className="relative">
        <div className={cn("flex justify-between border-b-4 border-double border-ink uppercase", { "pb-2.5 text-[15px] tracking-[0.22em]": isDesktop, "pb-1.5 text-[10px] tracking-[0.18em]": !isDesktop })}>
          <span>Справочникъ погреба</span>
          {isDesktop ? (
            <>
              <span>Том I · Хранение</span>
              <span>стр. 12</span>
            </>
          ) : (
            <span>Том I</span>
          )}
        </div>
        <Text as="h1" FONT="PAPER_DISPLAY" className={cn("text-center", { "mt-7 text-[104px] leading-none": isDesktop, "mt-4 text-[50px] leading-none": !isDesktop })}>
          Как хранить вино
        </Text>
        <p className={cn("mx-auto text-center italic", { "mt-3.5 max-w-245 text-lg leading-[1.45]": isDesktop, "mt-2.5 text-[17px] leading-[1.4]": !isDesktop })}>
          {isDesktop
            ? "Вину нужны четыре вещи: прохлада, темнота, покой и немного влаги. Всё остальное — детали, собранные в таблицах ниже."
            : "Прохлада, темнота, покой и немного влаги."}
        </p>
        <div className={cn({ "mt-10 grid grid-cols-2 gap-7.5": isDesktop })}>
          {temperature}
          {positions}
          {conditions}
          {aging}
        </div>
        {isDesktop ? (
          <div className="mt-9 flex items-center justify-between border-t-4 border-double border-ink pt-4.5 text-[19px]">
            <span className="italic">Нет подходящего места дома? Храните у нас.</span>
            <Link to={ROUTES.cellar} className="font-regular font-semibold text-primary-500 hover:text-primary-350">
              Ячейка в погребе →
            </Link>
          </div>
        ) : (
          <Link to={ROUTES.cellar} className="mt-4.5 block border-t-4 border-double border-ink pt-3 font-regular font-semibold text-primary-500">
            Нет места дома? Ячейка в погребе →
          </Link>
        )}
      </div>
    </article>
  );
};

export default StorageGuide;
