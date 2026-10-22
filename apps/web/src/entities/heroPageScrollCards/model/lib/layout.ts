import type { ScrollCard, ScrollSide } from "../types";

/** Примерная высота абзаца истории (3 строки по 32px) — для центрирования группы по вертикали */
const BODY_HEIGHT = 100;

/**
 * Переводит координаты истории из длинного макета Wood в координаты относительно
 * вертикального центра группы — чтобы показывать каждую историю по центру липкого экрана.
 */
export const centerStoryLayout = ({ layout }: ScrollCard) => {
  const { title, body, paper, bottle } = layout;
  const top = Math.min(title[1], body[1], paper[1], bottle[1]);
  const bottom = Math.max(body[1] + BODY_HEIGHT, paper[1] + paper[3], bottle[1] + bottle[3]);
  const center = (top + bottom) / 2;

  return {
    title: { x: title[0], dy: title[1] - center, width: title[2] },
    body: { x: body[0], dy: body[1] - center, width: body[2] },
    paper: { x: paper[0], dy: paper[1] - center, width: paper[2], height: paper[3] },
    bottle: { x: bottle[0], dy: bottle[1] - center, width: bottle[2], height: bottle[3] },
  };
};

/** Ширина «макета» телефона: координаты ниже — в px экрана 390, на других ширинах масштабируются */
export const COMPACT_WIDTH = 390;

/**
 * Та же история на телефоне (портрет): заголовок сверху, рваная бумага с бутылкой поперёк экрана
 * и уходит за край со своей стороны (как на десктопе), абзац — под ней. Высота группы ~490 px —
 * помещается между шапкой и низом экрана даже на 375×667. dy — от центра экрана
 */
export const compactStoryLayout = (side: ScrollSide) => {
  const paperRight = side === "right";
  return {
    title: { x: 20, dy: -250, width: 350 },
    paper: { x: paperRight ? 136 : -146, dy: -76, width: 400, height: 200 },
    bottle: { x: paperRight ? 120 : 20, dy: -160, width: 250, height: 232 },
    body: { x: paperRight ? 20 : 120, dy: 150, width: 250 },
  };
};
