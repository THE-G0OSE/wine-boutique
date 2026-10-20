/** Пути приложения (карта — docs/implementation-plan.md §3). Строки путей в компонентах не пишем */
export const ROUTES = {
  home: "/",
  news: "/news",
  newsArchive: "/news/archive",
  article: (slug: string) => `/news/${slug}`,
  shop: "/shop",
  shelf: (shelf: string) => `/shop/${shelf}`,
  wine: (slug: string) => `/wine/${slug}`,
  search: "/search",
  reserve: "/reserve",
  reservation: (id: string) => `/reserve/${id}`,
  pickup: "/pickup",
  reviews: "/reviews",
  tastings: "/tastings",
  cellar: "/cellar",
  hall: "/hall",
  gifts: "/gifts",
  monthly: "/monthly",
  certificates: "/certificates",
  storage: "/storage",
  faq: "/faq",
  privacy: "/privacy",
  auth: "/auth",
  account: "/account",
} as const;

/** Якоря секций главной */
export const HOME_ANCHORS = {
  vineyards: "vineyards",
  cellar: "cellar",
} as const;

/** Якоря страницы отзывов */
export const REVIEWS_ANCHORS = {
  write: "write",
} as const;
