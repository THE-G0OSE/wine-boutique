import type { FC } from "react";
import { Link } from "react-router";
import { TASTING_KINDS } from "@/entities/tasting";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { ButtonLink, Text } from "uikit;/";
import { TASTING_FORMATS } from "../model/mock";

/** Форматы дегустаций и приглашение в частный зал: на десктопе — сетка из четырёх, на мобильных — лента */
const TastingFormats: FC = () => {
  return (
    <section aria-labelledby="tasting-formats" className="mx-auto mt-7.5 max-w-480 lg:mt-24 lg:px-10 2xl:px-30">
      <Text as="h2" id="tasting-formats" FONT="FIRM" className="mx-5 text-[32px] leading-11.5 lg:mx-0 lg:text-display-sm lg:leading-19">
        Форматы
      </Text>
      <ul className="m-0 mt-3 flex list-none gap-3 overflow-x-auto px-5 [scrollbar-width:none] lg:mt-7 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-0">
        {TASTING_FORMATS.map((format) => (
          <li
            key={format.kind}
            className={cn(
              "flex w-55 shrink-0 flex-col gap-1.5 rounded-[20px] border border-t-4 border-cellar-700 bg-cellar-950/82 p-4.5",
              "lg:w-auto lg:gap-3 lg:rounded-3xl lg:bg-cellar-950/80 lg:p-7.5",
              TASTING_KINDS[format.kind].edge
            )}
          >
            <Text as="h3" FONT="FIRM" className="text-[22px] leading-8 lg:text-xl lg:leading-10.5">
              {format.title}
            </Text>
            <Text COLOR="MUTED" className="text-micro leading-[1.5] lg:text-[17px] lg:leading-[1.55]">
              <span className="lg:hidden">{format.text.mobile}</span>
              <span className="hidden lg:inline">{format.text.desktop}</span>
            </Text>
            <span className="mt-auto hidden text-[15px] text-amber-200 lg:block">{format.meta}</span>
          </li>
        ))}
      </ul>

      <div className="mx-4 mt-6.5 mb-10 lg:mx-0 lg:mt-10 lg:mb-24">
        {/* Мобильные: вся плашка — ссылка; десктоп: текст и кнопка «Арендовать зал» */}
        <Link
          to={ROUTES.hall}
          className="flex flex-col gap-1 rounded-[20px] border border-cellar-700 bg-[linear-gradient(90deg,rgba(143,12,12,0.4),rgba(17,12,10,0.85))] p-5 text-white no-underline lg:hidden"
        >
          <Text as="span" FONT="FIRM" className="text-[22px] leading-8">
            Своя компания — своя дегустация
          </Text>
          <span className="text-micro text-amber-200">Арендовать зал →</span>
        </Link>
        <div className="hidden items-center justify-between gap-10 rounded-3xl border border-cellar-700 bg-[linear-gradient(90deg,rgba(143,12,12,0.35),rgba(17,12,10,0.8))] px-12 py-10 lg:flex">
          <div className="flex flex-col gap-1.5">
            <Text as="span" FONT="FIRM" className="text-2xl leading-13">
              Своя компания — своя дегустация
            </Text>
            <Text COLOR="MUTED" className="text-caption">
              Закроем погреб под вас: день рождения, команда, предложение руки и сердца.
            </Text>
          </div>
          <ButtonLink to={ROUTES.hall} size="xl" className="shrink-0">
            Арендовать зал
          </ButtonLink>
        </div>
      </div>
    </section>
  );
};

export default TastingFormats;
