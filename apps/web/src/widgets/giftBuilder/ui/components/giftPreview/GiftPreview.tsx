import type { FC } from "react";
import { GIFT_DEFAULT_ENGRAVING, GIFT_EXTRAS, GIFT_PACKS, type GiftBox } from "@/entities/giftBox";
import { asset } from "@/shared/lib/asset";
import { cn } from "@/shared/lib/cn";

interface IProps {
  gift: GiftBox;
  variant: "desktop" | "mobile";
}

/** Ширина сцены превью в макете: Gifts — 1032 px (колонка слева от панели), MGifts — 358 */
const FIGURE = { desktop: 1032, mobile: 358 };

/** Бутылки в ящике — как в макете: красное, белое, игристое */
const BOTTLES = ["/images/bottles/red.webp", "/images/bottles/white.webp", "/images/bottles/sparkling.webp"];

/** Упаковка: фото-фактура (Kling) поверх цвета из токенов — цвет виден, пока картинка грузится */
const PACK = {
  wooden: { box: "bg-rack-600", texture: "/images/gifts/oak.webp" },
  tube: { box: "bg-tube-950", texture: "/images/gifts/tube.webp" },
  kraft: { box: "bg-kraft", texture: "/images/gifts/kraft.webp" },
};

/**
 * Живое превью подарка сверху: ящик раздвигается под число бутылок и дополнения, упаковка меняет цвет,
 * на бирке — текст гравировки. Размеры — из макета в долях ширины сцены (`cqw`), поэтому превью сжимается целиком.
 */
const GiftPreview: FC<IProps> = ({ gift, variant }) => {
  const isDesktop = variant === "desktop";
  const px = (value: number) => `${(value / FIGURE[variant]) * 100}cqw`;
  const glasses = gift.extras.includes("glasses");
  const chocolate = gift.extras.includes("chocolate");
  const width = isDesktop ? Math.min(260 + gift.bottles * 150 + (glasses ? 270 : 0) + (chocolate ? 140 : 0), 960) : 130 + gift.bottles * 70;
  const engraving = gift.engraving.trim() || GIFT_DEFAULT_ENGRAVING;
  const caption = [
    GIFT_PACKS[gift.pack].title,
    `бутылок: ${gift.bottles}`,
    ...(glasses ? ["бокалы"] : []),
    ...(chocolate ? ["шоколад"] : []),
  ].join(" · ");

  return (
    <div className="@container">
    <figure
      aria-label={`Превью подарка: ${caption}${gift.extras.includes("logo") ? `, ${GIFT_EXTRAS.logo.short.toLowerCase()}` : ""}, бирка «${engraving}»`}
      className="relative m-0 flex items-center justify-center"
      style={{ height: px(isDesktop ? 820 : 360) }}
    >
      <div aria-hidden="true" className="absolute inset-x-[4%] inset-y-[8%] rounded-[50%] bg-[radial-gradient(ellipse,rgb(232_184_120/0.25),transparent_65%)]" />
      <div
        className={cn("relative overflow-hidden shadow-panel transition-[width] duration-400 ease-[cubic-bezier(.2,.7,.2,1)]", PACK[gift.pack].box)}
        style={{ width: px(width), height: px(isDesktop ? 520 : 280), borderRadius: px(isDesktop ? 14 : 10) }}
      >
        <img src={asset(PACK[gift.pack].texture)} alt="" className="absolute inset-0 size-full object-cover" />
        <div
          className="absolute flex items-center justify-center overflow-hidden rounded-lg inset-shadow-cell"
          style={{ inset: px(isDesktop ? 22 : 12), gap: px(isDesktop ? 22 : 10), padding: `0 ${px(isDesktop ? 30 : 12)}` }}
        >
          {/* Стружка на дне ящика; к краям темнее — глубина */}
          <img src={asset("/images/gifts/shavings.webp")} alt="" className="absolute inset-0 size-full object-cover brightness-90" />
          <div aria-hidden="true" className="absolute inset-0 shadow-[inset_0_0_40px_rgb(0_0_0/0.55)]" />
          {BOTTLES.slice(0, gift.bottles).map((src) => (
            <img key={src} src={asset(src)} alt="" className="relative w-auto drop-shadow-bottle" style={{ height: px(isDesktop ? 430 : 220) }} />
          ))}
          {/* Бокалы — фото на чёрном, переведённое в прозрачность (яркость → альфа); тень обводит стекло на светлой стружке */}
          {isDesktop && glasses ? (
            <img src={asset("/images/gifts/glasses.webp")} alt="" className="relative w-auto shrink-0 drop-shadow-[0_0_1.5px_rgb(0_0_0/0.85)]" style={{ height: px(330) }} />
          ) : null}
          {isDesktop && chocolate ? (
            <img src={asset("/images/gifts/chocolate.webp")} alt="" className="relative w-auto shrink-0 rounded-sm shadow-tag" style={{ height: px(200) }} />
          ) : null}
        </div>
        {/* Лента */}
        <span
          aria-hidden="true"
          className="absolute -inset-y-1.5 left-[16%] -translate-x-1/2 bg-linear-to-r from-primary-650 via-primary-350 to-primary-650 shadow-tag"
          style={{ width: px(isDesktop ? 34 : 20) }}
        />
      </div>

      {/* Бирка с гравировкой */}
      <div
        aria-hidden="true"
        className="absolute box-border bg-paper font-paper text-label-ink shadow-ticket [clip-path:polygon(14%_0,100%_0,100%_100%,14%_100%,0_50%)]"
        style={
          isDesktop
            ? { right: px(20), bottom: px(70), width: px(300), padding: `${px(22)} ${px(24)} ${px(20)} ${px(40)}`, transform: "rotate(-8deg)" }
            : { right: px(6), bottom: px(4), width: px(190), padding: `${px(12)} ${px(12)} ${px(12)} ${px(30)}`, transform: "rotate(-6deg)" }
        }
      >
        <span className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full bg-cellar-900" style={{ left: px(isDesktop ? 22 : 14) }} />
        {isDesktop ? <div className="text-[13px] tracking-[0.2em] text-primary-500 uppercase">гравировка</div> : null}
        <div className={cn("italic", { "mt-1.5 text-lg leading-[1.25]": isDesktop, "text-sm leading-[1.25]": !isDesktop })}>{engraving}</div>
        {isDesktop ? <div className="mt-2.5 text-micro text-paper-ink">[логотип компании]</div> : null}
      </div>
      {isDesktop ? <figcaption className="absolute bottom-0 left-0 text-sm text-neutral-350">{caption}</figcaption> : null}
    </figure>
    </div>
  );
};

export default GiftPreview;
