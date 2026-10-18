import type { CSSProperties } from "react";
import { stage } from "@/shared/lib/stage";

/** Затемнения и свет погреба из макета (артборд Cellar, координаты 1920) */
export const CELLAR_SHADES: CSSProperties[] = [
  {
    top: 0,
    height: stage(1590),
    backgroundImage:
      "linear-gradient(0deg, rgba(17,12,10,0) 0%, rgba(17,12,10,0.35) 38%, rgba(17,12,10,0) 52%, rgba(17,12,10,0.3) 66%, rgba(17,12,10,0.74) 100%)",
  },
  {
    top: stage(1500),
    bottom: 0,
    backgroundImage:
      "linear-gradient(90deg, rgba(17,12,10,0.82) 0%, rgba(17,12,10,0.55) 34%, rgba(17,12,10,0.1) 50%, rgba(17,12,10,0.35) 62%, rgba(17,12,10,0.7) 100%)",
    maskImage: "linear-gradient(180deg, transparent 0%, #000 18%)",
  },
  {
    bottom: 0,
    height: stage(180),
    backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%)",
  },
];

export const LAMP_GLOW: CSSProperties = {
  top: stage(1700),
  height: stage(880),
  backgroundImage: "radial-gradient(ellipse 560px 440px at 50% 62%, rgba(255,178,80,0.42) 0%, rgba(255,178,80,0) 70%)",
};

export const CELLAR_SHADE_MOBILE =
  "linear-gradient(180deg, rgba(17,12,10,0.9) 0%, rgba(17,12,10,0.45) 25%, rgba(17,12,10,0.55) 60%, #110C0A 100%)";

/**
 * Пылинки в луче лампы: 26 частиц в области x 740–1180, y 1960–2480 макета.
 * Генератор с фиксированным зерном — картинка одинаковая при каждом рендере (как в дизайне).
 */
export const createDust = (count = 26) => {
  let seed = 11;
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  return Array.from({ length: count }, (_, index) => {
    const size = 2 + random() * 2.5;
    return {
      id: index,
      style: {
        left: stage(Math.round(740 + random() * 440)),
        top: stage(Math.round(1960 + random() * 520)),
        width: size,
        height: size,
        animationDuration: `${(7 + random() * 7).toFixed(1)}s`,
        animationDelay: `${(-random() * 12).toFixed(1)}s`,
      } satisfies CSSProperties,
    };
  });
};
