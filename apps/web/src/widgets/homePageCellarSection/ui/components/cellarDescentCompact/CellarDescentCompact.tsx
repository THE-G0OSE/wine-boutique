import { asset } from "@/shared/lib/asset";
import { cn } from "@/shared/lib/cn";
import { motion, useScroll, useTransform } from "motion/react";
import { useMemo, useRef, type FC } from "react";
import { Eyebrow, Text } from "uikit;/";
import { CELLAR_STATS, CELLAR_YEARS } from "../../../model/content";
import { CELLAR_SHADE_MOBILE, createDust, LAMP_GLOW_COMPACT } from "../../../model/decor";
import CellarCatalog from "../cellarCatalog/CellarCatalog";

interface IProps {
  titleId: string;
}

/** Пылинки в луче лампы над каталогом: координаты — доли области лампы */
const dustAt = (x: number, y: number) => ({ left: `${x * 100}%`, top: `${y * 100}%` });

/**
 * Телефон: тот же спуск, что на десктопе, — шкала глубины слева растёт с прокруткой, слои-годы проявляются
 * по одному, ниже — погреб: лампа мерцает, в луче пыль, под ней каталог. Раскладка — в потоке, не по 1920
 */
const CellarDescentCompact: FC<IProps> = ({ titleId }) => {
  const descentRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: descentRef, offset: ["start center", "end center"] });
  const fill = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const dust = useMemo(() => createDust(18, dustAt), []);

  return (
    <div className="relative">
      <img
        src={asset("/images/backgrounds/cellar.webp")}
        alt=""
        loading="lazy"
        className="absolute inset-0 size-full object-cover object-[50%_70%] opacity-85"
      />
      <div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: CELLAR_SHADE_MOBILE }} />

      {/* Спуск: шкала глубины — от заголовка до погреба */}
      <div ref={descentRef} className="relative pt-12 pr-5 pb-4 pl-13">
        <div aria-hidden="true" className="absolute top-14 bottom-0 left-5 w-0.5 bg-neutral-350/25">
          <motion.div className="absolute inset-x-0 top-0 bg-amber-350" style={{ height: fill }} />
          <motion.div
            className="absolute -left-1.5 size-3.5 -translate-y-1/2 rounded-full bg-amber-350 shadow-[0_0_16px_rgba(210,140,60,0.7)]"
            style={{ top: fill }}
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <span aria-hidden="true" className="font-system text-xs text-neutral-350">поверхность</span>
          <Eyebrow size="sm" labelClassName="text-shadow-glow">Спускаемся в погреб</Eyebrow>
          <Text as="h2" FONT="FIRM" COLOR="WHITE" className="text-title leading-15 text-shadow-[8px_10px_4px_rgba(0,0,0,0.4)]">
            Чем глубже — тем старше
          </Text>
          <Text COLOR="MUTED" className="text-sm leading-[1.55] text-shadow-glow">
            Каждый слой земли — год, который вино провело в темноте. На самой глубине ждут бутылки старше тридцати лет.
          </Text>
        </div>

        <span aria-hidden="true" className="mt-10 block font-system text-xs text-neutral-350">корни</span>
        <ol aria-label="Слои погреба" className="m-0 mt-5 flex list-none flex-col gap-11 p-0">
          {CELLAR_YEARS.map(({ year, caption, isCurrent }, index) => {
            const isDeepest = index === CELLAR_YEARS.length - 1;
            return (
              <motion.li
                key={year}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
                className="relative flex flex-col text-shadow-glow"
              >
                <span className={cn("font-firm text-[44px] leading-14", { "text-neutral-350": isCurrent, "text-amber-200": !isCurrent })}>
                  {year}
                </span>
                <span className="text-[15px] text-neutral-350">{caption}</span>
                {/* Точка слоя — на шкале глубины */}
                <span
                  aria-hidden="true"
                  className={cn("absolute top-5 -left-9.75 size-4 rounded-full", {
                    "border-2 border-neutral-350 bg-cellar-950": isCurrent,
                    "bg-amber-350": !isCurrent,
                    "shadow-[0_0_16px_rgba(210,140,60,0.7)]": isDeepest,
                  })}
                />
              </motion.li>
            );
          })}
        </ol>

        <span aria-hidden="true" className="mt-12 block font-system text-xs text-neutral-350">погреб</span>
        <div className="mt-4 flex flex-col gap-3">
          <Eyebrow size="sm">Наши погреба</Eyebrow>
          <Text as="h2" id={titleId} FONT="FIRM" COLOR="WHITE" className="text-title leading-15 text-shadow-[8px_10px_4px_rgba(0,0,0,0.4)]">
            Вино, которое умеет ждать
          </Text>
          <Text COLOR="MUTED" className="text-sm leading-[1.55]">
            Мы не торопим вино. Бутылки годами лежат в наших подвалах — в темноте, прохладе и тишине, пока каждое не
            раскроется полностью.
          </Text>
          <dl className="m-0 mt-2 flex flex-wrap gap-x-10 gap-y-3">
            {CELLAR_STATS.map(({ value, caption }) => (
              <div key={caption} className="flex flex-col-reverse gap-0.5">
                <dt className="max-w-40 text-xs text-neutral-350">{caption}</dt>
                <dd className="m-0 font-firm text-[40px] leading-13 text-amber-200">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Погреб под лампой: свет мерцает, в луче — пыль */}
      <div className="relative pt-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-130 animate-flicker mix-blend-screen" style={LAMP_GLOW_COMPACT} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-[15%] top-10 h-90">
          {dust.map(({ id, style }) => (
            <span
              key={id}
              className="absolute animate-dust rounded-full bg-[rgba(255,220,160,0.9)] opacity-0 shadow-[0_0_6px_rgba(255,200,120,0.8)]"
              style={style}
            />
          ))}
        </div>
        <div className="relative">
          <CellarCatalog variant="mobile" />
        </div>
      </div>
    </div>
  );
};

export default CellarDescentCompact;
