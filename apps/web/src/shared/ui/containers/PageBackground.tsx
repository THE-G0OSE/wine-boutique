import type { FC } from "react";
import { asset } from "@/shared/lib/asset";

interface IProps {
  /** boards — доски и виньетка (магазин, газета), cellar — фото погреба над тёмным фоном (страницы услуг) */
  variant?: "boards" | "cellar";
}

/**
 * Фон внутренних страниц. Родителю нужен `relative isolate`: фон лежит под контентом страницы.
 * - boards: деревянные доски + затемнение к краям (виньетка на десктопе, градиент на мобильных);
 * - cellar: подземный погреб сверху (1500 px на десктопе, 900 на мобильных), уходящий в цвет погреба.
 */
const PageBackground: FC<IProps> = ({ variant = "boards" }) =>
  variant === "cellar" ? (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-cellar-950">
      <img
        src={asset("/images/backgrounds/cellar.webp")}
        alt=""
        className="absolute inset-x-0 top-0 h-225 w-full object-cover object-[50%_95%] opacity-75 lg:h-375 lg:object-bottom lg:opacity-80"
      />
      <div className="absolute inset-x-0 top-0 h-225 bg-[linear-gradient(180deg,rgba(17,12,10,0.5)_0%,rgba(17,12,10,0.75)_50%,var(--color-cellar-950)_100%)] lg:h-375 lg:bg-[linear-gradient(180deg,rgba(17,12,10,0.55)_0%,rgba(17,12,10,0.7)_50%,var(--color-cellar-950)_100%)]" />
    </div>
  ) : (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-cellar-900">
      <div
        className="absolute inset-0 bg-size-[240px_auto] bg-repeat lg:bg-size-[min(25%,480px)_auto]"
        style={{ backgroundImage: `url(${asset("/images/textures/wood.webp")})` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,12,10,0.55)_0%,rgba(17,12,10,0.85)_100%)] lg:bg-[radial-gradient(ellipse_1100px_1600px_at_50%_40%,rgba(17,12,10,0.25)_0%,rgba(17,12,10,0.8)_100%)]" />
    </div>
  );

export default PageBackground;
