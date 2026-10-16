import { HOME_ANCHORS } from "@/shared/config/routes";
import { MEDIA, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import { stage, stageFont } from "@/shared/lib/stage";
import { useScroll } from "motion/react";
import { useId, useMemo, useRef, type FC } from "react";
import { Eyebrow, Text } from "uikit;/";
import { CELLAR_STATS, CELLAR_YEARS } from "../model/content";
import { CELLAR_SHADE_MOBILE, CELLAR_SHADES, createDust, LAMP_GLOW } from "../model/decor";
import CellarCatalog from "./components/cellarCatalog/CellarCatalog";
import CellarTimeline from "./components/cellarTimeline/CellarTimeline";
import DepthGauge from "./components/depthGauge/DepthGauge";

const backgroundMask = "linear-gradient(180deg, transparent 0%, #000 12%, #000 100%)";

/** Десктоп: спуск под землю — шкала глубины, годы урожая, затем погреб с каталогом под лампой */
const CellarDescent: FC<{ titleId: string }> = ({ titleId }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start center", "end center"] });
  const dust = useMemo(() => createDust(), []);

  return (
    <div ref={ref} className="@container relative mx-auto w-full max-w-[1920px]">
      <img
        src="/images/backgrounds/cellar.webp"
        alt=""
        loading="lazy"
        className="absolute inset-0 size-full object-cover object-top"
        style={{ maskImage: backgroundMask, WebkitMaskImage: backgroundMask }}
      />
      {CELLAR_SHADES.map((style, index) => (
        <div key={index} aria-hidden="true" className="pointer-events-none absolute inset-x-0" style={style} />
      ))}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 animate-flicker mix-blend-screen" style={LAMP_GLOW} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {dust.map(({ id, style }) => (
          <span
            key={id}
            className="absolute animate-dust rounded-full bg-[rgba(255,220,160,0.9)] opacity-0 shadow-[0_0_6px_rgba(255,200,120,0.8)]"
            style={style}
          />
        ))}
      </div>

      {/* Спуск: верхняя часть по координатам макета */}
      <div className="relative" style={{ height: stage(1545) }}>
        <DepthGauge progress={scrollYProgress} />
        <div className="absolute flex flex-col gap-4" style={{ left: stage(160), top: stage(440), width: stage(760) }}>
          <Eyebrow labelClassName="text-shadow-glow">
            <span style={{ fontSize: stageFont(24, 18) }}>Спускаемся в погреб</span>
          </Eyebrow>
          <Text
            as="h2"
            FONT="FIRM"
            COLOR="WHITE"
            className="text-shadow-[18px_22px_5px_rgba(0,0,0,0.45)]"
            style={{ fontSize: stageFont(96, 56), lineHeight: 128 / 96 }}
          >
            Чем глубже — тем старше
          </Text>
          <Text COLOR="MUTED" className="max-w-155 text-shadow-glow" style={{ fontSize: stageFont(20, 16) }}>
            Каждый слой земли — год, который вино провело в темноте. На самой глубине ждут бутылки, которым уже больше
            тридцати лет.
          </Text>
        </div>
        <CellarTimeline />
      </div>

      {/* Погреб: текст и каталог — гибкой строкой, чтобы не налезали друг на друга на узких экранах */}
      <div
        className="relative flex items-start justify-between gap-10"
        style={{ padding: `${stage(120)} ${stage(120)} ${stage(160)}`, minHeight: stage(1035) }}
      >
        <div className="flex max-w-200 flex-1 flex-col gap-4.5" style={{ paddingTop: stage(50) }}>
          <Eyebrow>
            <span style={{ fontSize: stageFont(24, 18) }}>Наши погреба • Our cellars</span>
          </Eyebrow>
          <Text
            as="h2"
            id={titleId}
            FONT="FIRM"
            COLOR="WHITE"
            className="text-shadow-2xl"
            style={{ fontSize: stageFont(96, 56), lineHeight: 128 / 96 }}
          >
            Вино, которое умеет ждать
          </Text>
          <Text COLOR="MUTED" className="max-w-160" style={{ fontSize: stageFont(20, 16) }}>
            Мы не торопим вино. Бутылки годами лежат в наших подвалах — в темноте, прохладе и тишине, пока каждое не
            раскроется полностью.
          </Text>
          <dl className="m-0 mt-4.5 flex flex-wrap gap-x-14 gap-y-4">
            {CELLAR_STATS.map(({ value, caption }) => (
              <div key={caption} className="flex flex-col-reverse gap-0.5">
                <dt className="text-sm text-neutral-350">{caption}</dt>
                <dd className="m-0 font-firm text-amber-200" style={{ fontSize: stageFont(64, 44), lineHeight: 84 / 64 }}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="shrink-0" style={{ width: `clamp(520px, ${stage(720)}, 720px)` }}>
          <CellarCatalog variant="desktop" />
        </div>
      </div>
    </div>
  );
};

/** Мобильные: заголовок, слои-годы списком и каталог */
const CellarStack: FC<{ titleId: string }> = ({ titleId }) => (
  <div className="relative">
    <img
      src="/images/backgrounds/cellar.webp"
      alt=""
      loading="lazy"
      className="absolute inset-0 size-full object-cover object-[50%_70%] opacity-85"
    />
    <div aria-hidden="true" className="absolute inset-0 animate-flicker [animation-duration:6s]" style={{ backgroundImage: CELLAR_SHADE_MOBILE }} />

    <div className="relative flex flex-col gap-2.5 px-5 pt-12">
      <Eyebrow size="sm">Погреб · Cellar</Eyebrow>
      <Text as="h2" id={titleId} FONT="FIRM" COLOR="WHITE" className="text-title leading-15 text-shadow-[8px_10px_4px_rgba(0,0,0,0.4)]">
        Чем глубже — тем старше
      </Text>
      <Text COLOR="MUTED" className="text-sm leading-[1.55]">
        Каждый слой земли — год, который вино провело в темноте.
      </Text>
    </div>

    <ol aria-label="Слои погреба" className="relative mx-5 mt-6.5 flex list-none flex-col gap-5.5 border-l-2 border-amber-200/40 p-0 pl-5.5">
      {CELLAR_YEARS.map(({ year, caption }) => (
        <li key={year} className="relative flex flex-col">
          <span
            aria-hidden="true"
            className="absolute top-2 -left-7.75 size-4 rounded-full bg-amber-350 shadow-[0_0_12px_rgba(232,184,120,0.7)]"
          />
          <span className="font-system text-lg font-semibold text-amber-200">{year}</span>
          <span className="text-[15px] text-neutral-350">{caption}</span>
        </li>
      ))}
    </ol>

    <div className="relative">
      <CellarCatalog variant="mobile" />
    </div>
  </div>
);

const HomePageCellarSection = () => {
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const titleId = useId();

  return (
    <section id={HOME_ANCHORS.cellar} aria-labelledby={titleId} className="relative scroll-mt-20 overflow-hidden bg-cellar-950">
      {isDesktop ? <CellarDescent titleId={titleId} /> : <CellarStack titleId={titleId} />}
    </section>
  );
};

export default HomePageCellarSection;
