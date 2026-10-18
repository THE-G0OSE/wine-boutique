import { cn } from "@/shared/lib/cn";
import { stage, stageFont } from "@/shared/lib/stage";
import { motion } from "motion/react";
import { CELLAR_YEARS } from "../../../model/content";

/** Координаты из макета: подписи прижаты правым краем к x = 1720, линия — x = 1760, точки — x = 1752 */
const FIRST_TOP = 264;
const STEP = 320;

/** Годы урожая справа: чем ниже, тем старше вино. Каждый слой проявляется при прокрутке */
const CellarTimeline = () => {
  return (
    <>
      <span
        aria-hidden="true"
        className="absolute w-0.5 bg-neutral-350/25"
        style={{ left: stage(1760), top: stage(260), height: stage(1080) }}
      />
      <ol aria-label="Слои погреба" className="m-0 list-none p-0">
        {CELLAR_YEARS.map(({ year, caption, isCurrent }, index) => {
          const isDeepest = index === CELLAR_YEARS.length - 1;
          return (
            <motion.li
              key={year}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
              className="absolute flex flex-col items-end gap-0.5 text-right text-shadow-glow"
              style={{ right: stage(200), top: stage(FIRST_TOP + index * STEP) }}
            >
              <span
                className={cn("font-firm", isCurrent ? "text-neutral-350" : "text-amber-200")}
                style={{ fontSize: stageFont(64, 44), lineHeight: 80 / 64 }}
              >
                {year}
              </span>
              <span className="text-caption text-neutral-350">{caption}</span>
              <span
                aria-hidden="true"
                className={cn(
                  "absolute size-4.5 rounded-full",
                  isCurrent ? "border-2 border-neutral-350 bg-cellar-950" : "bg-amber-350",
                  isDeepest && "shadow-[0_0_16px_rgba(210,140,60,0.7)]"
                )}
                style={{ left: `calc(100% + ${stage(32)})`, top: stage(69) }}
              />
            </motion.li>
          );
        })}
      </ol>
    </>
  );
};

export default CellarTimeline;
