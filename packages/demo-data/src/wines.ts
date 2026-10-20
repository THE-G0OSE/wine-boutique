import type { BottleShape, ShelfFixture, WineFixture, WineSummary } from "./types.js";

/**
 * Вина из макетов магазина (Shop, Category, Search, Product). Названия, регионы, сорта и силуэты бутылок — из дизайна;
 * цены, крепость, выдержка и заметки сомелье — плейсхолдеры дизайна, их даст заказчик. Подробная карточка
 * в макете одна — Sassicaia 2015, у остальных вин профиль вкуса и подача пока не описаны (null).
 */

const image = (bottle: BottleShape) => `/images/bottles/${bottle}.webp`;

type Category = WineSummary["categories"][number];

interface WineSeed {
  slug: string;
  name: string;
  region: string;
  country: string | null;
  grapes: string[];
  categories: Category[];
  bottle: BottleShape;
  vintage?: number;
  cellarYears?: number;
}

const TYPE_LABEL: Record<Category, string> = { red: "Красное", white: "Белое", sparkling: "Игристое", sweet: "Сладкое" };

const yearsWord = (n: number) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "год";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "года";
  return "лет";
};

/** Бирки над бутылкой: тип вина и сколько лет в погребе — из данных вина, без выдумки */
const badgesOf = ({ categories, cellarYears }: WineSeed) => {
  const [first, ...rest] = categories.map((category) => TYPE_LABEL[category]);
  const type = [first, ...rest.map((label) => label.toLowerCase())].join(" ");
  return cellarYears === undefined ? [type] : [type, `${cellarYears} ${yearsWord(cellarYears)} в погребе`];
};

const wine = (seed: WineSeed, details: Partial<WineFixture> = {}): WineFixture => ({
  id: seed.slug,
  slug: seed.slug,
  name: seed.name,
  categories: seed.categories,
  region: seed.region,
  country: seed.country,
  grapes: seed.grapes,
  volume: "0,75 л",
  vintage: seed.vintage ?? null,
  cellarYears: seed.cellarYears ?? null,
  price: null,
  image: image(seed.bottle),
  bottle: seed.bottle,
  producer: null,
  appellation: null,
  abv: "[%] об.",
  aging: "[выдержка]",
  potential: "до [год]",
  badges: badgesOf(seed),
  profile: null,
  notes: { aroma: "[аромат]", taste: "[вкус]", finish: "[послевкусие]" },
  food: [],
  serve: null,
  sommelierNote: "[Пара предложений сомелье об этом урожае: каким был сезон, когда вино раскроется и как его лучше открыть.]",
  relatedSlugs: [],
  ...details,
});

/** Позиция-плейсхолдер из макета: «[Название вина]», «[регион · сорт]» */
const placeholder = (slug: string, categories: Category[], bottle: BottleShape): WineFixture =>
  wine({ slug, name: "[Название вина]", region: "[регион]", country: null, grapes: ["[сорт]"], categories, bottle });

const scale = (level: number, word: string) => ({ level, word });

export const wineFixtures = {
  // Вина, которые уже были на главной и в газете, — с прежними slug
  yquem: wine({
    slug: "chateau-d-yquem-1988",
    name: "Château d’Yquem 1988",
    region: "Сотерн",
    country: "Франция",
    grapes: ["семильон", "совиньон блан"],
    categories: ["white", "sweet"],
    bottle: "sweet",
    vintage: 1988,
    cellarYears: 38,
  }),
  cristal: wine({
    slug: "cristal-2008",
    name: "Cristal 2008",
    region: "Шампань",
    country: "Франция",
    grapes: ["пино нуар", "шардоне"],
    categories: ["sparkling"],
    bottle: "sparkling",
    vintage: 2008,
    cellarYears: 18,
  }),
  sassicaia: wine(
    {
      slug: "sassicaia-2015",
      name: "Sassicaia 2015",
      region: "Тоскана",
      country: "Италия",
      grapes: ["каберне совиньон", "каберне фран"],
      categories: ["red"],
      bottle: "red",
      vintage: 2015,
      cellarYears: 11,
    },
    {
      // Карточка из макета Product
      producer: "Tenuta San Guido",
      appellation: "Bolgheri Sassicaia DOC",
      aging: "[мес.] в барриках",
      badges: ["Красное сухое", "Bolgheri DOC", "11 лет в погребе"],
      profile: {
        body: scale(4, "полнотелое"),
        tannins: scale(4, "плотные"),
        acidity: scale(3, "средняя"),
        sweetness: scale(1, "сухое"),
      },
      notes: { aroma: "[чёрная смородина, кедр, табак]", taste: "[тёмные ягоды, специи, графит]", finish: "[долгое, с нотами какао]" },
      food: [
        { icon: "🥩", text: "Стейк на углях" },
        { icon: "🦌", text: "Дичь и утка" },
        { icon: "🧀", text: "Выдержанные сыры" },
        { icon: "🍄", text: "Блюда с грибами" },
      ],
      serve: { temperature: "16–18 °C", decanting: "1 час", glass: "Бордо" },
      relatedSlugs: ["barolo", "rioja-gran-reserva", "bourgogne-pinot-noir", "chateauneuf-du-pape", "chianti-classico", "porto-tawny-20"],
    }
  ),
  red1: placeholder("placeholder-red-1", ["red"], "red"),
  white1: placeholder("placeholder-white-1", ["white"], "white"),
  red2: placeholder("placeholder-red-2", ["red"], "red"),
  red3: placeholder("placeholder-red-3", ["red"], "red"),
  white2: placeholder("placeholder-white-2", ["white"], "white"),
  sweet1: placeholder("placeholder-sweet-1", ["white", "sweet"], "sweet"),

  // Красные
  barolo: wine({ slug: "barolo", name: "Бароло", region: "Пьемонт", country: "Италия", grapes: ["неббиоло"], categories: ["red"], bottle: "black" }),
  bourgognePinotNoir: wine({ slug: "bourgogne-pinot-noir", name: "Бургундия Пино Нуар", region: "Бургундия", country: "Франция", grapes: ["пино нуар"], categories: ["red"], bottle: "burgundy" }),
  riojaGranReserva: wine({ slug: "rioja-gran-reserva", name: "Риоха Гран Резерва", region: "Риоха", country: "Испания", grapes: ["темпранильо"], categories: ["red"], bottle: "red" }),
  chateauneuf: wine({ slug: "chateauneuf-du-pape", name: "Шатонёф-дю-Пап", region: "Рона", country: "Франция", grapes: ["гренаш", "сира"], categories: ["red"], bottle: "black" }),
  chianti: wine({ slug: "chianti-classico", name: "Кьянти Классико", region: "Тоскана", country: "Италия", grapes: ["санджовезе"], categories: ["red"], bottle: "burgundy" }),
  bordeauxSuperieur: wine({ slug: "bordeaux-superieur", name: "Бордо Сюперьёр", region: "Бордо", country: "Франция", grapes: ["мерло", "каберне"], categories: ["red"], bottle: "red" }),
  malbec: wine({ slug: "malbec-mendoza", name: "Мальбек", region: "Мендоса", country: "Аргентина", grapes: ["мальбек"], categories: ["red"], bottle: "red" }),
  baroloRiserva: wine({ slug: "barolo-riserva", name: "Бароло Ризерва", region: "Пьемонт", country: "Италия", grapes: ["неббиоло"], categories: ["red"], bottle: "black" }),
  brunello: wine({ slug: "brunello-di-montalcino", name: "Брунелло ди Монтальчино", region: "Тоскана", country: "Италия", grapes: ["санджовезе"], categories: ["red"], bottle: "burgundy" }),
  amarone: wine({ slug: "amarone", name: "Амароне", region: "Венето", country: "Италия", grapes: ["корвина"], categories: ["red"], bottle: "black" }),
  priorat: wine({ slug: "priorat", name: "Приорат", region: "Каталония", country: "Испания", grapes: ["гарнача"], categories: ["red"], bottle: "red" }),
  coteRotie: wine({ slug: "cote-rotie", name: "Кот-Роти", region: "Рона", country: "Франция", grapes: ["сира"], categories: ["red"], bottle: "black" }),
  pomerol: wine({ slug: "pomerol", name: "Помероль", region: "Бордо", country: "Франция", grapes: ["мерло"], categories: ["red"], bottle: "red" }),
  gevreyChambertin: wine({ slug: "gevrey-chambertin", name: "Жевре-Шамбертен", region: "Бургундия", country: "Франция", grapes: ["пино нуар"], categories: ["red"], bottle: "burgundy" }),
  riberaDelDuero: wine({ slug: "ribera-del-duero", name: "Рибера дель Дуэро", region: "Рибера дель Дуэро", country: "Испания", grapes: ["темпранильо"], categories: ["red"], bottle: "red" }),
  barbaresco: wine({ slug: "barbaresco", name: "Барбареско", region: "Пьемонт", country: "Италия", grapes: ["неббиоло"], categories: ["red"], bottle: "black" }),
  zinfandel: wine({ slug: "zinfandel", name: "Зинфандель", region: "Калифорния", country: "США", grapes: ["зинфандель"], categories: ["red"], bottle: "red" }),
  pinotNoirMarlborough: wine({ slug: "pinot-noir-marlborough", name: "Пино Нуар Мальборо", region: "Мальборо", country: "Новая Зеландия", grapes: ["пино нуар"], categories: ["red"], bottle: "burgundy" }),
  spatburgunder: wine({ slug: "spatburgunder", name: "Шпетбургундер", region: "Баден", country: "Германия", grapes: ["пино нуар"], categories: ["red"], bottle: "burgundy" }),
  pinotNoirOregon: wine({ slug: "pinot-noir-oregon", name: "Пино Нуар Орегон", region: "Орегон", country: "США", grapes: ["пино нуар"], categories: ["red"], bottle: "burgundy" }),

  // Белые
  chablis: wine({ slug: "chablis-premier-cru", name: "Шабли Премьер Крю", region: "Бургундия", country: "Франция", grapes: ["шардоне"], categories: ["white"], bottle: "white" }),
  moselRiesling: wine({ slug: "mosel-riesling", name: "Мозель Рислинг", region: "Мозель", country: "Германия", grapes: ["рислинг"], categories: ["white"], bottle: "flute" }),
  sancerre: wine({ slug: "sancerre", name: "Сансер", region: "Долина Луары", country: "Франция", grapes: ["совиньон блан"], categories: ["white"], bottle: "white" }),
  gewurztraminer: wine({ slug: "gewurztraminer", name: "Гевюрцтраминер", region: "Эльзас", country: "Франция", grapes: ["гевюрцтраминер"], categories: ["white"], bottle: "flute" }),
  meursault: wine({ slug: "meursault", name: "Мерсо", region: "Бургундия", country: "Франция", grapes: ["шардоне"], categories: ["white"], bottle: "white" }),
  gruner: wine({ slug: "gruner-veltliner", name: "Грюнер Вельтлинер", region: "Вахау", country: "Австрия", grapes: ["грюнер вельтлинер"], categories: ["white"], bottle: "flute" }),
  sauvignonBlanc: wine({ slug: "sauvignon-blanc-marlborough", name: "Совиньон блан", region: "Мальборо", country: "Новая Зеландия", grapes: ["совиньон блан"], categories: ["white"], bottle: "white" }),
  gavi: wine({ slug: "gavi-di-gavi", name: "Гави ди Гави", region: "Пьемонт", country: "Италия", grapes: ["кортезе"], categories: ["white"], bottle: "white" }),
  pinotGris: wine({ slug: "pinot-gris", name: "Пино Гри", region: "Эльзас", country: "Франция", grapes: ["пино гри"], categories: ["white"], bottle: "flute" }),

  // Игристые и сладкие
  prosecco: wine({ slug: "prosecco-superiore", name: "Просекко Супериоре", region: "Венето", country: "Италия", grapes: ["глера"], categories: ["sparkling"], bottle: "prosecco" }),
  tokajiAszu: wine({ slug: "tokaji-aszu", name: "Токай Асу", region: "Токай", country: "Венгрия", grapes: ["фурминт"], categories: ["white", "sweet"], bottle: "tokaji" }),
  franciacorta: wine({ slug: "franciacorta", name: "Франчакорта", region: "Ломбардия", country: "Италия", grapes: ["шардоне", "пино нуар"], categories: ["sparkling"], bottle: "sparkling" }),
  cava: wine({ slug: "cava-brut-nature", name: "Кава Брют Натюр", region: "Каталония", country: "Испания", grapes: ["макабео", "парельяда"], categories: ["sparkling"], bottle: "prosecco" }),
  sauternes: wine({ slug: "sauternes", name: "Сотерн", region: "Бордо", country: "Франция", grapes: ["семильон"], categories: ["white", "sweet"], bottle: "sweet" }),
  icewine: wine({ slug: "eiswein", name: "Ледяное вино", region: "Германия", country: "Германия", grapes: ["рислинг"], categories: ["white", "sweet"], bottle: "tokaji" }),
  blancDeNoirs: wine({ slug: "champagne-blanc-de-noirs", name: "Шампань Блан де Нуар", region: "Шампань", country: "Франция", grapes: ["пино нуар"], categories: ["sparkling"], bottle: "sparkling" }),
  sparkling1: placeholder("placeholder-sparkling-1", ["sparkling"], "prosecco"),

  // Коллекция: 10+ лет
  portoTawny: wine({ slug: "porto-tawny-20", name: "Портвейн Тони 20 лет", region: "Дору", country: "Португалия", grapes: ["турига насьонал"], categories: ["red", "sweet"], bottle: "port" }),
  portoVintage: wine({ slug: "porto-vintage", name: "Портвейн Винтаж", region: "Дору", country: "Португалия", grapes: ["купаж"], categories: ["red", "sweet"], bottle: "port" }),
  tokajiEssencia: wine({ slug: "tokaji-essencia", name: "Токай Эссенция", region: "Токай", country: "Венгрия", grapes: ["фурминт"], categories: ["white", "sweet"], bottle: "tokaji" }),
  madeira: wine({ slug: "madeira-sercial", name: "Мадейра", region: "Мадейра", country: "Португалия", grapes: ["серсиал"], categories: ["white"], bottle: "port" }),
  bordeauxVintage: wine({ slug: "bordeaux-vintage", name: "Бордо урожая [год]", region: "Бордо", country: "Франция", grapes: ["каберне совиньон"], categories: ["red"], bottle: "red" }),
  aged1: placeholder("placeholder-aged-1", ["red", "sweet"], "port"),
  aged2: placeholder("placeholder-aged-2", ["red"], "black"),
} satisfies Record<string, WineFixture>;

/** Все вина; порядок — популярность (сортировка popular вне полок) */
export const wineFixtureList: WineFixture[] = Object.values(wineFixtures);

const w = wineFixtures;
const slugs = (...wines: WineFixture[]) => wines.map((item) => item.slug);
const FILTER_HINT = "Отфильтруйте по стране, сорту или выдержке.";

/** Полки магазина (макеты Shop и Category): порядок бутылок — как на полке */
export const shelfFixtures: ShelfFixture[] = [
  {
    id: "red",
    title: "Красные",
    note: "от Бордо до Мендосы",
    description: `От лёгкого пино нуар до мощных тосканских купажей. ${FILTER_HINT}`,
    slugs: slugs(
      w.sassicaia, w.barolo, w.bourgognePinotNoir, w.riojaGranReserva, w.chateauneuf, w.chianti, w.bordeauxSuperieur,
      w.malbec, w.baroloRiserva, w.brunello, w.amarone, w.priorat, w.coteRotie, w.pomerol, w.gevreyChambertin,
      w.riberaDelDuero, w.barbaresco, w.zinfandel, w.pinotNoirMarlborough, w.spatburgunder, w.pinotNoirOregon,
      w.red1, w.red2, w.red3
    ),
  },
  {
    id: "white",
    title: "Белые",
    note: "свежие, минеральные, выдержанные в дубе",
    description: `Свежие, минеральные, выдержанные в дубе. ${FILTER_HINT}`,
    slugs: slugs(w.chablis, w.moselRiesling, w.sancerre, w.gewurztraminer, w.meursault, w.gruner, w.sauvignonBlanc, w.gavi, w.pinotGris, w.white1, w.white2),
  },
  {
    id: "sparkling",
    title: "Игристые и сладкие",
    note: "для праздника и десерта",
    description: `Для праздника и десерта. ${FILTER_HINT}`,
    slugs: slugs(w.cristal, w.prosecco, w.yquem, w.tokajiAszu, w.franciacorta, w.cava, w.sauternes, w.icewine, w.blancDeNoirs, w.sweet1, w.sparkling1),
  },
  {
    id: "aged",
    title: "Коллекция: 10+ лет",
    note: "вина, которые уже дождались своего часа",
    description: `Вина, которые уже дождались своего часа. ${FILTER_HINT}`,
    slugs: slugs(w.yquem, w.cristal, w.portoTawny, w.baroloRiserva, w.portoVintage, w.tokajiEssencia, w.madeira, w.bordeauxVintage, w.aged1, w.aged2),
  },
];
