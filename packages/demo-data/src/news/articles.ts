import type { NewsArticle, NewsClipping } from "../types";

const clippings = {
  yquem: { slug: "chateau-d-yquem-1988-v-pogrebe", rubric: "supply", title: "В погреб прибыла партия Château d’Yquem 1988" },
  harvest: { slug: "nachalsya-sbor-vinograda", rubric: "harvest", title: "На наших плантациях начался сбор винограда" },
  tasting: { slug: "vecher-klassika-starogo-sveta", rubric: "tasting", title: "Вечер «Классика Старого Света»" },
  excursions: { slug: "pogreb-otkryt-dlya-ekskursiy", rubric: "events", title: "Погреб открыт для экскурсий по субботам" },
} satisfies Record<string, NewsClipping>;

/** «Ещё вырезки» — три другие статьи */
export const moreClippings = (slug: string): NewsClipping[] =>
  Object.values(clippings)
    .filter((clipping) => clipping.slug !== slug)
    .slice(0, 3);

/** Статьи с текстом из дизайна (артборды Article и News). Остальные статьи подшивки собирает мок-обработчик */
export const articleFixtures: NewsArticle[] = [
  {
    ...clippings.yquem,
    kicker: "Поставки · Главное",
    title: "В погреб прибыла партия Château d’Yquem 1988",
    standfirst:
      "Легендарный сотерн урожая 1988 года теперь хранится в наших подвалах. Рассказываем, откуда он, почему этот год особенный и как его попробовать до покупки.",
    byline: "Текст: редакция «Вестника»",
    readingMinutes: 3,
    issue: { id: "issue-2026-10-16", number: 23, publishedAt: "2026-10-16" },
    image: {
      src: "/images/news/supply.webp",
      alt: "Двое рабочих несут ящики с вином в сводчатый погреб",
      caption: "Новая партия спускается в погреб. Иллюстрация редакции.",
    },
    body: [
      "Каждый месяц в наш погреб приходят новые поставки, но эта — особенная. Урожай 1988 года в Сотерне любят за редкое равновесие: сладость мёда и абрикоса держится на свежей кислотности, а значит, вино может спокойно лежать ещё десятилетия.",
      "Бутылки прибыли напрямую от частного коллекционера. Перед тем как поставить их на полку, сомелье бутика проверил каждую: уровень вина в горлышке, состояние пробки и капсулы, этикетку и документы о происхождении.",
      "Теперь бутылки лежат в самой глубокой части подвала — там, где круглый год держится +12 °C и почти не бывает света. Партия невелика, поэтому мы открыли бронирование для постоянных гостей.",
      "Забронированную бутылку можно забрать сразу или оставить в личной ячейке нашего погреба — на столько, сколько потребуется. А тем, кто хочет сначала попробовать, мы откроем бутылку на одной из ближайших дегустаций.",
      "Вместе с d’Yquem на полках остаются Sassicaia 2015 и Cristal 2008. Подробности — у сомелье бутика или в разделе «Магазин».",
    ],
    pullQuote: { text: "«Такое вино не торопят: его открывают, когда есть повод и время»", afterParagraph: 2 },
    relatedWine: { slug: "chateau-d-yquem-1988", name: "Château d’Yquem 1988" },
    more: moreClippings(clippings.yquem.slug),
  },
  {
    ...clippings.harvest,
    kicker: "Урожай",
    standfirst: null,
    byline: null,
    readingMinutes: null,
    issue: { id: "issue-2026-10-09", number: 22, publishedAt: "2026-10-09" },
    image: {
      src: "/images/news/harvest.webp",
      alt: "Сборщики с корзинами между рядами лозы на склоне",
      caption: "Сбор идёт вручную, гроздь за гроздью. Иллюстрация редакции.",
    },
    body: [
      "Первыми созрели белые сорта: шардоне и совиньон блан собирают в прохладные утренние часы, чтобы ягоды сохранили свежесть и кислотность.",
      "Красным сортам нужно ещё немного солнца. Каберне совиньон — самый поздний на наших склонах — традиционно убирают последним, ближе к октябрю.",
      "Каждая гроздь проходит ручной отбор прямо в ряду: в корзину попадают только здоровые ягоды. Как пройдёт сезон, «Вестник» расскажет в следующих номерах.",
    ],
    pullQuote: null,
    relatedWine: null,
    more: moreClippings(clippings.harvest.slug),
  },
  {
    ...clippings.tasting,
    kicker: "Дегустации",
    standfirst: null,
    byline: null,
    readingMinutes: null,
    issue: { id: "issue-2026-10-16", number: 23, publishedAt: "2026-10-16" },
    image: {
      src: "/images/news/tasting.webp",
      alt: "Сомелье разливает вино гостям за длинным столом при свечах",
      caption: null,
    },
    body: [
      "Сомелье бутика проведёт гостей от Бордо до Тосканы: шесть вин, круглый стол для дегустаций и истории о каждом шато.",
    ],
    pullQuote: null,
    relatedWine: null,
    more: moreClippings(clippings.tasting.slug),
  },
  {
    ...clippings.excursions,
    kicker: "События",
    standfirst: null,
    byline: null,
    readingMinutes: null,
    issue: { id: "issue-2026-09-25", number: 20, publishedAt: "2026-09-25" },
    image: { src: "/images/news/tasting.webp", alt: "", caption: null },
    body: ["[Текст статьи — его пришлёт редакция]"],
    pullQuote: null,
    relatedWine: null,
    more: moreClippings(clippings.excursions.slug),
  },
];
