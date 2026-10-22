import { useGetGrapesQuery, type GrapeVariety } from "@/entities/grapeVariety";
import { HOME_ANCHORS } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { MEDIA, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import { stage, stageFont } from "@/shared/lib/stage";
import { useId, useState, type FC } from "react";
import { Eyebrow, Text } from "uikit;/";
import { COMPACT_SCENE, GRAPE_PLACES, GRAPE_PLACES_COMPACT, VINEYARD_GLOW, VINEYARD_SHADE, VINEYARD_SHADE_MOBILE } from "../model/layout";
import GrapeCluster from "./components/grapeCluster/GrapeCluster";
import GrapeModal from "./components/grapeModal/GrapeModal";
import GrapeSheet from "./components/grapeSheet/GrapeSheet";
import { asset } from "@/shared/lib/asset";

interface ISectionProps {
  grapes: GrapeVariety[];
  titleId: string;
  onOpen: (slug: string) => void;
}

/**
 * Лоза с гроздями: качаются, при наведении (на телефоне — касании) гроздь замирает, светится и показывает сорт,
 * по нажатию — карточка сорта. Десктоп — сцена 16:9 по макету 1920, телефон — портретная 390×840
 */
const VineyardsScene: FC<ISectionProps & { compact: boolean }> = ({ grapes, titleId, onOpen, compact }) => {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const unit = compact ? (px: number) => `${(px / COMPACT_SCENE.width) * 100}cqw` : stage;
  const places = compact ? GRAPE_PLACES_COMPACT : GRAPE_PLACES;

  return (
    <div
      // На планшете в портрете сцена не шире 560 px: иначе грозди вырастают вдвое, а секция — на два экрана
      className={cn("@container relative mx-auto w-full", { "aspect-video max-h-[1080px] max-w-[1920px]": !compact, "max-w-140": compact })}
      style={compact ? { aspectRatio: `${COMPACT_SCENE.width} / ${COMPACT_SCENE.height}` } : undefined}
    >
      <header
        className={cn("absolute inset-x-0 flex flex-col", { "items-center gap-4 px-10 text-center": !compact, "gap-2.5 px-5": compact })}
        style={{ top: unit(compact ? 44 : 96) }}
      >
        <Eyebrow tone="muted" direction={compact ? "row" : "column"} size={compact ? "sm" : undefined} className={cn({ "items-center": !compact })}>
          <span style={compact ? undefined : { fontSize: stageFont(24, 18) }}>
            {compact ? "Собственные виноградники" : "Собственные виноградники • Our vineyards"}
          </span>
        </Eyebrow>
        <Text
          as="h2"
          id={titleId}
          FONT="FIRM"
          COLOR="WHITE"
          className={cn({ "text-shadow-2xl": !compact, "text-title leading-15 text-shadow-[8px_10px_4px_rgba(0,0,0,0.4)]": compact })}
          style={compact ? undefined : { maxWidth: stage(1320), fontSize: stageFont(96, 56), lineHeight: 128 / 96 }}
        >
          Выращиваем виноград на собственных плантациях
        </Text>
        <Text
          COLOR="MUTED"
          className={cn("text-shadow-[0_2px_12px_rgba(0,0,0,0.6)]", { "max-w-190": !compact, "text-sm leading-[1.55]": compact })}
          style={compact ? undefined : { fontSize: stageFont(20, 16) }}
        >
          {compact
            ? "Нажмите на гроздь — расскажем о сорте и винах из него."
            : "Наведите на гроздь, чтобы узнать сорт. Нажмите — расскажем, какие вина мы из него делаем."}
        </Text>
      </header>

      {grapes.map((grape, index) => {
        const place = places[grape.slug];
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
            unit={unit}
            compact={compact}
          />
        );
      })}
    </div>
  );
};

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
        src={asset("/images/backgrounds/vineyard.webp")}
        alt=""
        className="absolute inset-0 size-full object-cover object-[40%_50%] lg:object-center"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 animate-breathe mix-blend-screen"
        style={{ backgroundImage: VINEYARD_GLOW }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 lg:inset-shadow-top-sm"
        style={{ backgroundImage: isDesktop ? VINEYARD_SHADE : VINEYARD_SHADE_MOBILE }}
      />

      <VineyardsScene grapes={grapes} titleId={titleId} onOpen={setOpenSlug} compact={!isDesktop} />
      {isDesktop ? <GrapeModal grape={opened} onClose={close} /> : <GrapeSheet grape={opened} onClose={close} />}
    </section>
  );
};

export default HomePageVineyardsSection;
