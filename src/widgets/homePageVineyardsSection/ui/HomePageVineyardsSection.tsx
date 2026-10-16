import { GRAPE_TYPE_LABELS, useGetGrapesQuery, type GrapeVariety } from "@/entities/grapeVariety";
import { HOME_ANCHORS } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { MEDIA, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import { stage, stageFont } from "@/shared/lib/stage";
import { useId, useState, type FC } from "react";
import { Eyebrow, Text } from "uikit;/";
import { GRAPE_PLACES, GRAPE_TONE, VINEYARD_GLOW, VINEYARD_SHADE, VINEYARD_SHADE_MOBILE } from "../model/layout";
import GrapeCluster from "./components/grapeCluster/GrapeCluster";
import GrapeModal from "./components/grapeModal/GrapeModal";
import GrapeSheet from "./components/grapeSheet/GrapeSheet";

interface ISectionProps {
  grapes: GrapeVariety[];
  titleId: string;
  onOpen: (slug: string) => void;
}

/** Десктоп: сцена 16:9 с гроздями на лозе по координатам макета */
const VineyardsScene: FC<ISectionProps> = ({ grapes, titleId, onOpen }) => {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  return (
    <div className="@container relative mx-auto aspect-video max-h-[1080px] w-full max-w-[1920px]">
      <header
        className="absolute inset-x-0 flex flex-col items-center gap-4 px-10 text-center"
        style={{ top: stage(96) }}
      >
        <Eyebrow tone="muted" direction="column" className="items-center">
          <span style={{ fontSize: stageFont(24, 18) }}>Собственные виноградники • Our vineyards</span>
        </Eyebrow>
        <Text
          as="h2"
          id={titleId}
          FONT="FIRM"
          COLOR="WHITE"
          className="text-shadow-2xl"
          style={{ maxWidth: stage(1320), fontSize: stageFont(96, 56), lineHeight: 128 / 96 }}
        >
          Выращиваем виноград на собственных плантациях
        </Text>
        <Text COLOR="MUTED" className="max-w-190 text-shadow-[0_2px_12px_rgba(0,0,0,0.6)]" style={{ fontSize: stageFont(20, 16) }}>
          Наведите на гроздь, чтобы узнать сорт. Нажмите — расскажем, какие вина мы из него делаем.
        </Text>
      </header>

      {grapes.map((grape, index) => {
        const place = GRAPE_PLACES[grape.slug];
        if (!place) return null;
        return (
          <GrapeCluster
            key={grape.id}
            grape={grape}
            place={place}
            index={index}
            isHovered={hoveredSlug === grape.slug}
            onHover={setHoveredSlug}
            onOpen={onOpen}
          />
        );
      })}
    </div>
  );
};

/** Мобильные: лента гроздей, по тапу — шторка с описанием сорта */
const VineyardsStrip: FC<ISectionProps> = ({ grapes, titleId, onOpen }) => (
  <div className="relative h-190">
    <div className="relative flex flex-col gap-2.5 px-5 pt-11">
      <Eyebrow size="sm">Собственные виноградники</Eyebrow>
      <Text as="h2" id={titleId} FONT="FIRM" COLOR="WHITE" className="text-title leading-15 text-shadow-[8px_10px_4px_rgba(0,0,0,0.4)]">
        Выращиваем виноград на собственных плантациях
      </Text>
      <Text COLOR="MUTED" className="text-sm leading-[1.55]">
        Листайте лозу и нажмите на гроздь — расскажем о сорте.
      </Text>
    </div>

    <div className="absolute inset-x-0 bottom-10 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-5 [scrollbar-width:none]">
      {grapes.map((grape, index) => (
        <button
          key={grape.id}
          type="button"
          onClick={() => onOpen(grape.slug)}
          aria-label={`Подробнее о сорте ${grape.name}`}
          className="relative h-75 w-[150px] shrink-0 cursor-pointer snap-center border-0 bg-transparent p-0"
        >
          <span aria-hidden="true" className="absolute top-0 left-1/2 h-10 w-0.5 bg-amber-650" />
          <img
            src={grape.image}
            alt=""
            loading="lazy"
            className="absolute inset-x-0 top-7.5 mx-auto h-52.5 w-auto origin-top animate-sway brightness-80 contrast-92 saturate-80 sepia-15 drop-shadow-[0_12px_14px_rgba(0,0,0,0.6)]"
            style={{ animationDuration: "4s", animationDelay: `${-index * 0.7}s` }}
          />
          <span className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-0.5 rounded-xl border border-amber-200/35 bg-cellar-950/80 p-2">
            <span className="font-firm text-[17px] text-white">{grape.name}</span>
            <span className={cn("text-xs", GRAPE_TONE[grape.type].onDark)}>
              {GRAPE_TYPE_LABELS[grape.type].short.toLowerCase()}
            </span>
          </span>
        </button>
      ))}
    </div>
  </div>
);

const HomePageVineyardsSection = () => {
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const titleId = useId();
  const { data: grapes = [] } = useGetGrapesQuery();
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const opened = grapes.find((grape) => grape.slug === openSlug) ?? null;
  const close = () => setOpenSlug(null);

  return (
    <section id={HOME_ANCHORS.vineyards} aria-labelledby={titleId} className="relative scroll-mt-20 overflow-hidden bg-cellar-950">
      <img
        src="/images/backgrounds/vineyard.webp"
        alt=""
        className="absolute inset-0 size-full object-cover object-[40%_50%] lg:object-center"
      />
      {isDesktop && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 animate-breathe mix-blend-screen"
          style={{ backgroundImage: VINEYARD_GLOW }}
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 lg:inset-shadow-top-sm"
        style={{ backgroundImage: isDesktop ? VINEYARD_SHADE : VINEYARD_SHADE_MOBILE }}
      />

      {isDesktop ? (
        <>
          <VineyardsScene grapes={grapes} titleId={titleId} onOpen={setOpenSlug} />
          <GrapeModal grape={opened} onClose={close} />
        </>
      ) : (
        <>
          <VineyardsStrip grapes={grapes} titleId={titleId} onOpen={setOpenSlug} />
          <GrapeSheet grape={opened} onClose={close} />
        </>
      )}
    </section>
  );
};

export default HomePageVineyardsSection;
