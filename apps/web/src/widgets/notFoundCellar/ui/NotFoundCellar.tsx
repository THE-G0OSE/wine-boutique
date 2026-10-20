import type { FC } from "react";
import { Link } from "react-router";
import { ROUTES } from "@/shared/config/routes";
import { asset } from "@/shared/lib/asset";
import { cn } from "@/shared/lib/cn";
import { ButtonLink, Eyebrow, Text } from "uikit;/";

const CELLS = ["401", "402", "403", "404", "405", "406", "407", "408", "409"];

/**
 * 404 (макет NotFound): «Эту бутылку уже выпили» — стеллаж из девяти ячеек, где пуста только № 404.
 * Мобильного макета нет: на узких экранах стеллаж уходит под текст и становится ниже.
 */
const NotFoundCellar: FC = () => {
  return (
    <section className="mx-auto grid max-w-480 items-center gap-10 px-5 pb-16 lg:min-h-[calc(100svh-168px)] lg:grid-cols-2 lg:gap-20 lg:px-10 lg:pb-24 2xl:pr-40 2xl:pl-30">
      <div className="flex flex-col gap-3 lg:gap-4.5">
        <Eyebrow size="sm" className="lg:hidden">
          Ошибка 404
        </Eyebrow>
        <Eyebrow className="max-lg:hidden" labelClassName="text-[22px]">
          Ошибка 404
        </Eyebrow>
        <Text as="h1" FONT="FIRM" className="text-title leading-15 text-shadow-lg lg:text-4xl lg:leading-32 lg:text-shadow-2xl">
          Эту бутылку уже выпили
        </Text>
        <Text COLOR="MUTED" className="text-sm leading-[1.55] lg:text-[22px]">
          Ячейка, которую вы ищете, пуста: страницу переложили, переименовали или открыли по особому поводу. Зато на полках есть чем её заменить.
        </Text>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <ButtonLink to={ROUTES.shop} size="xl">
            К полкам
          </ButtonLink>
          <ButtonLink to={ROUTES.home} variant="outline" size="xl" className="border-amber-200/50 bg-cellar-950/60">
            На главную
          </ButtonLink>
          <Link to={ROUTES.faq} className="px-3 text-caption font-semibold text-amber-200 hover:text-paper">
            Вопросы и ответы
          </Link>
        </div>
      </div>
      <div aria-hidden="true" className="relative h-90 overflow-hidden rounded-[10px] bg-rack-800 shadow-[inset_0_0_0_8px_var(--color-rack-600),var(--shadow-panel)] lg:h-190">
        <img src={asset("/images/textures/shelf.webp")} alt="" className="absolute inset-0 size-full object-cover opacity-45 mix-blend-overlay" />
        <div className="absolute inset-4 grid grid-cols-3 grid-rows-3 gap-2.5 lg:inset-7 lg:gap-4.5">
          {CELLS.map((cell) => {
            const empty = cell === "404";
            return (
              <div
                key={cell}
                className={cn("relative overflow-hidden rounded-md border shadow-[inset_0_10px_22px_rgb(0_0_0/0.75)]", {
                  "border-amber-200/70 bg-[radial-gradient(ellipse_at_50%_80%,rgb(232_184_120/0.35),rgb(21_14_10/0.95)_70%)]": empty,
                  "border-cellar-700 bg-cellar-950": !empty,
                })}
              >
                <span
                  className={cn(
                    "absolute top-2 left-1/2 -translate-x-1/2 rounded-[3px] whitespace-nowrap bg-linear-to-b from-amber-200 to-amber-500 px-2 py-0.5 font-system font-semibold text-note-ink shadow-tag lg:top-3.5 lg:px-3 lg:py-1",
                    { "text-xs shadow-cell-glow lg:text-md": empty, "text-[10px] lg:text-micro": !empty }
                  )}
                >
                  № {cell}
                </span>
                {empty ? (
                  <span className="absolute top-[58%] left-1/2 -translate-1/2 -rotate-4 bg-paper px-2.5 py-1.5 text-center font-hand text-sm leading-[1.05] whitespace-nowrap text-label-ink shadow-tag lg:px-4.5 lg:py-3.5 lg:text-[26px]">
                    выпита
                    <br />
                    16.10.2026
                  </span>
                ) : (
                  <span className="absolute inset-x-[14%] bottom-3 h-8 bg-[radial-gradient(circle_at_50%_50%,var(--color-cellar-950)_0_40%,var(--color-rack-neck)_41%_46%,transparent_47%)] bg-size-[33.3%_100%] bg-repeat-x lg:bottom-4.5 lg:h-13.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default NotFoundCellar;
