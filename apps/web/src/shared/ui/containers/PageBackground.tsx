import { asset } from "@/shared/lib/asset";

/**
 * Фон внутренних страниц: деревянные доски + затемнение к краям (виньетка на десктопе, градиент на мобильных).
 * Родителю нужен `relative isolate`: фон лежит под контентом страницы.
 */
const PageBackground = () => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-cellar-900">
    <div
      className="absolute inset-0 bg-size-[240px_auto] bg-repeat lg:bg-size-[min(25%,480px)_auto]"
      style={{ backgroundImage: `url(${asset("/images/textures/wood.webp")})` }}
    />
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,12,10,0.55)_0%,rgba(17,12,10,0.85)_100%)] lg:bg-[radial-gradient(ellipse_1100px_1600px_at_50%_40%,rgba(17,12,10,0.25)_0%,rgba(17,12,10,0.8)_100%)]" />
  </div>
);

export default PageBackground;
