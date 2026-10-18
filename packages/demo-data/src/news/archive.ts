import type { NewsArchiveIssue, NewsRubric } from "../types";

/** Иллюстрация первой полосы по рубрике главного материала (как в артборде Archive) */
const RUBRIC_IMAGE: Record<NewsRubric, string> = {
  supply: "/images/news/supply.webp",
  harvest: "/images/news/harvest.webp",
  tasting: "/images/news/tasting.webp",
  events: "/images/news/tasting.webp",
};

/** Выпуски из артборда Archive: дата, рубрика и заголовок главного материала; от свежего к старому */
const ISSUES: [publishedAt: string, rubric: NewsRubric, title: string, articleSlug: string][] = [
  ["2026-10-16", "supply", "В погреб прибыла партия Château d’Yquem 1988", "chateau-d-yquem-1988-v-pogrebe"],
  ["2026-10-09", "harvest", "На наших плантациях начался сбор", "nachalsya-sbor-vinograda"],
  ["2026-10-02", "tasting", "Вертикаль: пять урожаев одного шато", "vertikal-pyat-urozhaev"],
  ["2026-09-25", "events", "Погреб открыт для экскурсий", "pogreb-otkryt-dlya-ekskursiy"],
  ["2026-09-18", "harvest", "Первый виноград в чанах", "pervyy-vinograd-v-chanakh"],
  ["2026-09-11", "supply", "Шампань: поставка из Реймса", "shampan-iz-reymsa"],
  ["2026-09-04", "tasting", "Слепая дегустация: итоги", "slepaya-degustatsiya-itogi"],
  ["2026-08-28", "tasting", "Белые на террасе", "belye-na-terrase"],
  ["2026-08-21", "harvest", "Лоза перед сбором", "loza-pered-sborom"],
  ["2026-08-14", "events", "Летний вечер в погребе", "letniy-vecher-v-pogrebe"],
  ["2026-08-07", "supply", "Розовые вина Прованса", "rozovye-vina-provansa"],
  ["2026-07-31", "supply", "Новые бутылки из Риохи", "novye-butylki-iz-riokhi"],
  ["2026-07-24", "tasting", "Розе и гриль", "roze-i-gril"],
  ["2026-07-17", "events", "Клуб друзей бутика", "klub-druzey-butika"],
  ["2026-07-10", "harvest", "Июльская жара на склонах", "iyulskaya-zhara-na-sklonakh"],
  ["2026-06-26", "events", "Открытие летней веранды", "otkrytie-letney-verandy"],
  ["2026-06-19", "tasting", "Игристые не из Шампани", "igristye-ne-iz-shampani"],
  ["2026-06-12", "supply", "Портвейны 10–40 лет", "portveyny-10-40-let"],
  ["2026-05-29", "tasting", "Пино нуар вокруг света", "pino-nuar-vokrug-sveta"],
  ["2026-05-22", "harvest", "Цветение лозы", "tsvetenie-lozy"],
  ["2026-05-15", "events", "Первый выпуск «Вестника»", "pervyy-vypusk-vestnika"],
];

/** Номера идут подряд от свежего (№ 23) к первому — как в макете */
export const archiveIssuesFixture: NewsArchiveIssue[] = ISSUES.map(([publishedAt, rubric, title, articleSlug], index) => ({
  id: `issue-${publishedAt}`,
  number: 23 - index,
  publishedAt,
  rubric,
  title,
  image: RUBRIC_IMAGE[rubric],
  articleSlug,
}));

export const rubricImage = (rubric: NewsRubric) => RUBRIC_IMAGE[rubric];
