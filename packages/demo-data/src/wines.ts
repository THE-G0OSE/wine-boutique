import type { WineSummary } from "./types";

/** Бутылки из дизайна. Вина-плейсхолдеры («[Название вина]») — как в макете, данные даст заказчик */
const bottle = {
  red: "/images/bottles/red.webp",
  white: "/images/bottles/white.webp",
  sweet: "/images/bottles/sweet.webp",
  sparkling: "/images/bottles/sparkling.webp",
};

const placeholder = (id: string, categories: WineSummary["categories"], image: string): WineSummary => ({
  id,
  slug: id,
  name: "[Название вина]",
  categories,
  region: "[регион]",
  country: null,
  grapes: ["[сорт]"],
  volume: "0,75 л",
  vintage: null,
  cellarYears: null,
  price: null,
  image,
});

export const wineFixtures = {
  yquem: {
    id: "chateau-d-yquem-1988",
    slug: "chateau-d-yquem-1988",
    name: "Château d’Yquem 1988",
    categories: ["white", "sweet"],
    region: "Сотерн",
    country: "Франция",
    grapes: ["семильон", "совиньон блан"],
    volume: "0,75 л",
    vintage: 1988,
    cellarYears: 38,
    price: null,
    image: bottle.sweet,
  },
  cristal: {
    id: "cristal-2008",
    slug: "cristal-2008",
    name: "Cristal 2008",
    categories: ["sparkling"],
    region: "Шампань",
    country: "Франция",
    grapes: ["пино нуар", "шардоне"],
    volume: "0,75 л",
    vintage: 2008,
    cellarYears: 18,
    price: null,
    image: bottle.sparkling,
  },
  sassicaia: {
    id: "sassicaia-2015",
    slug: "sassicaia-2015",
    name: "Sassicaia 2015",
    categories: ["red"],
    region: "Тоскана",
    country: "Италия",
    grapes: ["каберне совиньон", "каберне фран"],
    volume: "0,75 л",
    vintage: 2015,
    cellarYears: 11,
    price: null,
    image: bottle.red,
  },
  red1: placeholder("placeholder-red-1", ["red"], bottle.red),
  white1: placeholder("placeholder-white-1", ["white"], bottle.white),
  red2: placeholder("placeholder-red-2", ["red"], bottle.red),
  red3: placeholder("placeholder-red-3", ["red"], bottle.red),
  white2: placeholder("placeholder-white-2", ["white"], bottle.white),
  sweet1: placeholder("placeholder-sweet-1", ["white", "sweet"], bottle.sweet),
} satisfies Record<string, WineSummary>;

export const wineFixtureList: WineSummary[] = Object.values(wineFixtures);
