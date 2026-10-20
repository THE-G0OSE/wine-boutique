# Wine Boutique — план реализации

> Составлен 17.10.2026 по коду ветки `main` (коммит `c368ea6`) и дизайну
> [Wine Boutique — Главная](https://claude.ai/artifact/G57VXkJRvN2HVSHm65Q2Ua) (14 страниц канваса, ~85 артбордов).
> Краткие правила архитектуры для каждой правки — в [CLAUDE.md](../CLAUDE.md).
> Открытые вопросы закрыты 17.10.2026 — итог в §6.

---

## 1. Что есть сейчас

### 1.1 Стек

| Слой | Технология |
|---|---|
| Сборка | Vite 7 + `@vitejs/plugin-react-swc`, pnpm 10, TS 5.8 (`strict`, `noUnused*`, `verbatimModuleSyntax`) |
| UI | React 19, Tailwind CSS v4 (`@tailwindcss/vite`, токены через `@theme`) |
| Анимации | `motion` 12 (`motion/react`) |
| Состояние | Redux Toolkit 2 + react-redux 9 |
| Роутинг | react-router 7 (`BrowserRouter` + `Routes`) |
| Формы / иконки | react-hook-form 7 (пока не используется), react-icons 5 |
| CI/CD | GitHub Actions → `pnpm build` → FTP (`dist/`) на каждый push в `main` |

### 1.2 Архитектура — Feature-Sliced Design

```
src/
  app/        providers (router, store), model/styles (Tailwind-токены), ui (App, main)
  pages/      home
  widgets/    homePageHeroSectionCarousel, homePageScrollHeroSection, layouts/mainLayout(+header)
  entities/   heroPageImages, heroPageScrollCards
  shared/     ui (Text, Flex), lib/hooks, model (appSlice — тема red/white)
```

Слоя `features` ещё нет. Алиасы: `@/*` → `src/*`, `uikit;/` → `src/shared/ui`.

**Устройство слайса** (сложилось в коде, держимся его):

```
<slice>/
  index.ts              публичный API: export * from './model'; export * from './ui'
  api/                  (новое, см. §4.2) эндпоинты RTK Query + MSW-обработчики и фикстуры
  model/
    types.ts            типы
    mock.ts | *Mock.ts  моковые данные
    animations.ts       motion-варианты (Variants, Transition)
    lib/hooks/*.ts      хуки слайса (+ index.ts)
    index.ts
  ui/
    Component.tsx       default export
    components/<sub>/   вложенные части виджета со своими model/ui
    index.ts            import X from './X'; export { X }
```

### 1.3 Что уже сделано

- **Hero-карусель** (`widgets/homePageHeroSectionCarousel`): 9 слайдов, активный разворачивается в фон, остальные — карточки справа; автопрокрутка с прогрессом, стрелки, счётчик `01–09`; при смене слайда диспатчится `setTheme('red' | 'white')` — от него красится прогресс-бар.
- **Секция историй со скроллом** (`widgets/homePageScrollHeroSection`): 600vh, внутри «прилипает» экран на деревянном фоне, 5 карточек на рваной бумаге въезжают по диапазонам скролла, сверху прогресс-бар из 5 сегментов, лёгкий «параллакс» от скорости скролла.
- **Шапка** — заглушка из четырёх надписей без ссылок.
- **Маршруты** `/store`, `/news`, `/reviews` — пустые.

### 1.4 Технический долг (исправить в Фазе 0)

| # | Где | Проблема |
|---|---|---|
| 1 | [text.css:1](../src/app/model/styles/text.css), [colors.css:1](../src/app/model/styles/colors.css) | `@import "tailwindcss"` в каждом файле → preflight и утилиты попадают в бандл несколько раз. Импорт должен быть один — в `styles.css`. |
| 2 | [shadows.css](../src/app/model/styles/shadows.css) | Классы объявлены вне `@theme`; `.shadow-xl` перекрывает встроенную утилиту Tailwind. Перенести в `@theme` (`--shadow-*`, `--inset-shadow-*`, `--text-shadow-*`). |
| 3 | [Flex.tsx:17](../src/shared/ui/containers/Flex.tsx) | `${end && "justify-end"}` пишет в `className` строки `false`. Нужен `cn()` (clsx + tailwind-merge). |
| 4 | [RouterProvider.tsx:8](../src/app/providers/router/ui/RouterProvider.tsx) | `routes.map` без `key`; `MainLayout` оборачивает каждый маршрут отдельно → при переходе шапка перемонтируется. |
| 5 | [useCarousel.ts:20-63](../src/widgets/homePageHeroSectionCarousel/model/lib/hooks/useCarousel.ts) | `setInterval` с `[]` замыкает первые `isDisable`/`nextHandler`; `onChange` вызывается внутри функции-апдейтера `setState` (побочный эффект → двойной вызов в StrictMode — видимо, поэтому StrictMode закомментирован в [main.tsx](../src/app/ui/main.tsx)). Переписать на `useReducer` + refs, вернуть `StrictMode`. |
| 6 | [useScrollHeroSection.ts:15-18](../src/widgets/homePageScrollHeroSection/model/lib/hooks/useScrollHeroSection.ts) | Переключение `fixed`/`absolute` через стейт: начальное значение инвертировано, `fixed` никогда не снимается в конце секции (накроет всё, что будет ниже). Заменить на `position: sticky` внутри высокого контейнера. |
| 7 | [cardsMock.ts:6](../src/entities/heroPageScrollCards/model/cardsMock.ts), [ProgressBarItem.tsx:12](../src/widgets/homePageScrollHeroSection/ui/components/progressBar/ui/ProgressBarItem.tsx) | `scrollFrom/scrollTo` — абсолютные пиксели страницы (1000…6000). Как только над секцией появится что-то другое или изменится высота окна — всё поедет. Перейти на `useScroll({ target, offset })` и доли `0…1` от прогресса секции. |
| 8 | [ScrollCard.tsx:28-31](../src/entities/heroPageScrollCards/ui/ScrollCard.tsx) | `useEffect` без массива зависимостей — переподписка на каждый рендер. Вместо ручной подписки — `useTransform(y, v => -v + offset)`. |
| 9 | [ScrollHeroSectionProgressBar.tsx:16](../src/widgets/homePageScrollHeroSection/ui/components/progressBar/ui/ScrollHeroSectionProgressBar.tsx) | `map` без `key`; каждый сегмент заново вызывает `useScroll()`. Передавать один `MotionValue` прогресса сверху. |
| 10 | [MainLayout.tsx](../src/widgets/layouts/mainLayout/ui/MainLayout.tsx) | `overflow-x-hidden overflow-y-scroll` на обёртке делает её скролл-контейнером → `position: sticky` у потомков (шапка, секция историй) работать не будет. Заменить на `overflow-x-clip`, скроллится `window`. |
| 11 | [useWindowSize.ts:11](../src/shared/lib/hooks/useWindowSize.ts) | `console.log` и устаревшее замыкание; `useWindowScroll` не используется. |
| 12 | [appSlice.ts:1](../src/shared/model/appSlice.ts), [useAppDispatch.ts:1](../src/shared/lib/hooks/useAppDispatch.ts) | `shared` импортирует из `app`. Импорты уже `import type` (стираются при сборке) — фиксируем как единственное допустимое исключение из правила FSD; сам `appSlice` (доменная тема red/white) переезжает в `entities/wineMode` (см. §4). |
| 13 | [package.json](../package.json) | `path` (лишний npm-пакет, в Node есть встроенный), `@types/node` в `dependencies`; `@types/react-router` — типы v5, а v7 поставляет свои → возможны конфликты. Удалить/перенести в `devDependencies`. |
| 14 | [index.html](../index.html) | `lang="en"`, заголовок «Vite + React + TS», нет favicon. |
| 15 | `public/images` | 21 МБ PNG (кадры hero по 0,7–3,4 МБ). Конвертировать в WebP/AVIF (ожидаемо ~2 МБ), отдавать `<picture>` + `loading="lazy"` + размеры. |
| 16 | `src/assets/fonts` | TTF по 1,2–1,5 МБ (Shantell Sans). Нужны woff2 с сабсетом latin+cyrillic, `font-display: swap`. `--font-system: Noto Sans` объявлен, но `@font-face` для него нет. |
| 17 | [deploy.yml](../.github/workflows/deploy.yml) | Деплой по FTP на сервер, которого нет (проект пока нигде не хостится); сборка гоняется дважды; Node 20. Заменяем на CI-проверки + Docker-образ (§4.8). |

---

## 2. Что в дизайне

### 2.1 Страницы канваса

| Страница канваса | Артборды | Что это |
|---|---|---|
| Главная | Home = Hero + Wood + Main + Cellar + Footer; Hover / Modal / ModalWhite — состояния Main | Главная целиком |
| Карта ссылок | LinkMap | **Карта сайта** — куда ведёт каждая кнопка. Источник правды для маршрутов |
| Шапка и корзина | Header, HeaderStates, CartDrawer, CartEmpty | Компонент шапки, прозрачная → тёмная, корзина-шторка |
| Каталог, фильтры, поиск | Category, Search, SearchEmpty, Filters, FilterOpen, PriceOpen, SortOpen, SearchBox, SearchSuggest | Полка, поиск, компоненты фильтров и поиска |
| Магазин | Shop | Полки-карусели по категориям |
| Покупка и бронь | Product, Reserve, Success, AgeGate | Карточка вина, бронирование, квитанция, 18+ |
| Новости | News, Article, Archive | Газета «Винный Вѣстникъ», статья-вырезка, подшивка |
| Отзывы | Reviews | Письма гостей + форма |
| Услуги | Tastings, CellarStorage, Hall, Gifts, Monthly, Certificates | Календарь дегустаций, ячейка в погребе, аренда зала, корп. подарки, набор месяца, сертификаты |
| Инфо и 404 | Pickup, Storage, Faq, Privacy, NotFound | Самовывоз, справочник хранения, FAQ-доска, политика, 404 |
| Личный кабинет | Auth (+Code/Reg/Done), Account (+Orders/Cell/Fav/Bonus/Profile) | Вход по телефону, кабинет с 6 вкладками |
| Мобильные версии | M\* (27 шт.), MHeader, MFooter, MMenu, MCart | 390 px для каждой страницы |
| Основы | Foundations | Токены: цвета, типографика, тени, «режим вина» |

Как читать дизайн из Claude Code: `Artifact` → `read` с `paths: ["project/<Имя>.dc.html"]`. Разметка + `<script type="text/x-dc">` с данными и логикой состояний. Картинки — `/_blob/<id>`, выгружаются тем же `read` с `path: "<id>"`.

### 2.2 Дизайн-токены (Foundations)

**Цвета.** Шкалы от 800 (темнее) к 200 (светлее).

| Шкала | 800 | 650 | 500 | 350 | 200 | Есть в коде |
|---|---|---|---|---|---|---|
| primary (красное вино, бренд) | `#420505` | `#720909` | `#8F0C0C` | `#B81212` | `#EF2525` | да |
| secondary (белое вино) | `#3F3F08` | `#6D6D0E` | `#9A9A14` | `#B8B81B` | `#E5E52F` | да |
| amber (акцент тёмной темы) | `#4B3011` | `#70481A` | `#9E6524` | `#D28C3C` | `#E8B878` | **нет** |
| neutral | `#000000` | `#424242` | `#8A8A8A` | `#D0D0D0` | `#FFFFFF` | **нет** |
| cellar (фоны): 950 `#110C0A` · 900 `#1B1411` · 800 `#2A201B` · 700 `#3D2F28` | | | | | | **нет** |
| paper `#F4EFE8` · error `#FD2F20` · success `#13E101` | | | | | | paper — **нет** |

Семантика: тёмная тема (почти весь сайт) — `bg/page` cellar-950, `bg/surface` cellar-900, `bg/elevated` cellar-800, `border` cellar-700, текст neutral-200 / 350 / 500, акцент amber-350 (кнопки), amber-200 (ссылки, цены, активный пункт). Светлая (модалки-«бумага», вырезки) — paper / neutral-200 / neutral-350, текст neutral-800 / 650, акцент primary-500.

**Режим вина** (только главная): `--color-wine-accent` (red → primary-200, white → secondary-200) и `--color-wine-accent-strong` (primary-500 / secondary-500). Меняется вместе со слайдом hero.

**Шрифты.**

| Токен | Шрифт | Где |
|---|---|---|
| `font-firm` | Pacifico 400 | Логотип, все крупные заголовки, цифры-акценты |
| `font-regular` | Shantell Sans 400/600/700 + italic | Основной текст |
| `font-system` | Noto Sans 400/600 | Цены, числа, бейджи, uppercase-подписи `dt` |
| **новый** `font-paper` | Old Standard TT 400/700 + italic | Газета, справочник, политика, чертёж зала, карта самовывоза |
| **новый** `font-paper-display` | Oranienbaum 400 | Шапка газеты «Винный Вѣстникъ», заголовки вырезок |

**Кегли.** Есть: 96 (`4xl`/FIRM), 42 (H1), 36 (H2), 30 (H3), 24 (H4), 20 (P), 16 (SYSTEM), 12 (SMALL). В дизайне повторяются ещё: **72, 64, 56, 44** (дисплейные: модалка сорта, крупные цифры, h2 внутренних страниц, заголовки карточек) и **18, 14** (подписи). Добавить их токенами, остальные единичные значения (13, 15, 17, 19, 22, 26, 28, 34) округлять до ближайшего токена.

**Тени.** `shadow/top` и `shadow/top-sm` (inset сверху), `shadow/xl`, **новая** `shadow/card-bottom` = `inset 0 -61px 37px rgba(0,0,0,.73)`, `text-shadow/2xl`, `text-shadow/xl`.

**Прочее.** Радиусы: `999px` (пилюли и круглые кнопки), 10 (карточки hero), 14–16 (карточки), 22–28 (крупные панели), 6 (бирки бутылок). Контентная ширина на 1920 — 1680 (поля по 120). Анимации-кейфреймы: `wbSway` (качание грозди), `wbBreathe` (дыхание света), `wbFlicker` (мерцание лампы), `wbDust` (пылинки), `wbRise` (появление модалки). Во всех артбордах `prefers-reduced-motion: reduce` отключает анимации.

### 2.3 Повторяющиеся паттерны → `shared/ui`

| Паттерн | Описание в дизайне |
|---|---|
| `Eyebrow` | Черта 40×3 (amber-350 или цвет вина) + подпись 22–24 px neutral-350 над заголовком. Есть на каждой странице |
| `PageIntro` | Eyebrow + h1 Pacifico 96/128 с `text-shadow/2xl` + лид 20–21 px, max-w ~760 |
| `Button` | primary (amber-350, чёрный текст, h 56–60, pill), secondary (обводка cellar-700), ghost-link (amber-200, подчёркивание) |
| `IconButton` | Круг 44 px (поиск, аккаунт, закрыть), 52 px (закрыть модалку), 100 px (стрелки hero) |
| `Chip` / `Pill` | h 44, pill, обводка cellar-700; активный — обводка amber-350 + фон amber 18–20 %, текст amber-200. Табы, рубрики, фильтры, типы дегустаций |
| `Checkbox`, `Radio`, `Switch` | Квадрат 24–28 px с обводкой amber-350, отмечено — заливка + «✓»; радио-кружок с точкой; переключатель в профиле |
| `QtyStepper` | `− n +` из трёх сегментов (корзина, карточка, гости) |
| `Input`, `Textarea`, `Select`, `Field` | Тёмные (bg cellar-950, обводка cellar-700, фокус amber), подпись над полем |
| `GlassPanel` | `rgba(17,12,10,.78)` + обводка amber 22 % + `backdrop-blur` + большая тень |
| `PaperSurface` | Бумага paper / текстура газеты, тёмный текст |
| `Modal`, `Drawer` (справа 560 px), `BottomSheet` (моб.), `Popover` (выпадашки фильтров) | С оверлеем `rgba(8,6,5,.6)` + blur |
| `Breadcrumbs`, `Price` (`Noto Sans 600`, amber-200), `Tag` | — |
| `PageBackground` | Деревянная текстура на всю страницу + радиальная виньетка (используется на ~40 артбордах) |

Доменные UI (не в shared, а в `entities/wine/ui`): **`BottleCard`** — бутылка на полке + бирка, повёрнутая на ±0,8°, по ховеру бутылка поднимается на 16 px и светлеет; **`Shelf`** — ряд из 7 бутылок на доске.

### 2.4 Глобальное поведение

- **Шапка.** Наверху — прозрачная, 96 px, градиент сверху; после 80 px прокрутки — тёмная `rgba(17,12,10,.92)` + blur, липкая, 80 px. Логотип Pacifico 30; на главной поверх hero логотип скрыт до перехода в тёмное состояние (в hero и так огромный «Premium Wine Boutique»). Навигация: Главная, Новости, Магазин, Дегустации, Погреб, Отзывы; активный пункт — amber-200 + подчёркивание 2 px. Справа: поиск (→ магазин), аккаунт (гость → вход; авторизован → кружок с инициалами на градиенте amber) и кнопка «Корзина» со счётчиком.
- **Корзина-шторка.** Справа 560 px: позиции с количеством `− n +`, «Убрать», плашка «Бронируем бутылки на 3 дня…», «Итого», «Забронировать» → бронирование, «Продолжить выбор» → магазин. Пустое состояние — «Здесь пока пусто». Доставки нет — только бронь и самовывоз.
- **18+.** Модалка при первом входе поверх размытого hero: «Да, мне есть 18» (запоминаем на устройстве) / «Нет» → «Извините» + «Я ошибся, вернуться».
- **Футер.** Логотип + слоган; подписка на закрытый канал (→ «Вы подписаны ✓»); 5 колонок ссылок (Навигация, Наш дом, Подарки, Покупателям, Контакты); плашка 18+ и предупреждение Минздрава; копирайт, **атрибуция Vecteezy за рваную бумагу (обязательна по лицензии)**, ссылка на политику.
- **Мобильная шапка** 64 px: логотип 17 px, аккаунт, корзина со счётчиком, бургер → полноэкранное меню (ссылки Pacifico 30 с номерами `01–06`, доп. ссылки, контакты, 18+). Корзина на мобиле — нижняя шторка.
- **Кнопки-действия без перехода** (из LinkMap): «+» на полках → счётчик корзины; фильтры и сортировка → выпадающие списки; стрелки hero → смена слайда и акцента; «Записаться» на дегустацию → форма → билет; заявки (ячейка, зал, подарки, набор, сертификат) → подтверждение «✓»; подписка → «Вы подписаны»; «В календарь» → скачивание `.ics`.

### 2.5 Расхождения дизайна и текущего кода

| Место | Код | Дизайн | Предложение |
|---|---|---|---|
| Hero | 9 слайдов; активный разворачивается в фон и несёт свой заголовок; прогресс — таймер автопрокрутки | Фон и h1 «Premium Wine Boutique» статичны, меняется подпись «Красное/Белое вино» над ним; 8 карточек 254×343 в ряд с шагом 275,67; прогресс = позиция `(k+1)/8`; номер `01–08` | **Решено:** механика кода (разворот карточки в фон), геометрия, шрифты и цвета — по дизайну. Прогресс-бар: заливка по позиции + тонкая полоска таймера внутри |
| Истории | Скролл-анимация: липкий экран, карточки въезжают по очереди | Статичная секция 2820 px, 5 историй друг под другом | **Решено:** скролл-анимация; типографика по дизайну (заголовки neutral-350 вместо белого, тексты 24 px с `text-shadow/xl`) и тени |
| Шапка | Заглушка | Полноценный компонент (§2.4) | Сделать заново как `widgets/header` |
| Маршрут магазина | `/store` | «Магазин» | Переименовать в `/shop` |

---

## 3. Карта маршрутов

Из LinkMap. Хедер на всех страницах, футер на всех, кроме полноэкранных состояний.

| Маршрут | Страница (`pages/…`) | Артборды | Активный пункт шапки |
|---|---|---|---|
| `/` | `home` | Home (Hero, Wood, Main, Cellar), MHome | Главная |
| `/shop` | `shop` | Shop, MShop | Магазин |
| `/shop/:shelf` (`red`, `white`, `sparkling`, `aged`) | `category` | Category, MCategory | Магазин |
| `/search?q=` | `search` | Search, SearchEmpty, MSearch | Магазин |
| `/wine/:slug` | `product` | Product, MProduct | Магазин |
| `/reserve` | `reserve` | Reserve, MReserve | Магазин |
| `/reserve/:id` | `reserveSuccess` | Success, MSuccess | Магазин |
| `/pickup` | `pickup` | Pickup, MPickup | Магазин |
| `/news` | `news` | News, MNews | Новости |
| `/news/archive` | `newsArchive` | Archive, MArchive | Новости |
| `/news/:slug` | `article` | Article, MArticle | Новости |
| `/reviews` | `reviews` | Reviews, MReviews | Отзывы |
| `/tastings` | `tastings` | Tastings, MTastings | Дегустации |
| `/cellar` | `cellarStorage` | CellarStorage, MCellarStorage | Погреб |
| `/hall` | `hall` | Hall, MHall | Дегустации |
| `/gifts` | `gifts` | Gifts, MGifts | Магазин |
| `/monthly` | `monthly` | Monthly, MMonthly | Магазин |
| `/certificates` | `certificates` | Certificates, MCertificates | Магазин |
| `/storage` | `storage` | Storage, MStorage | — |
| `/faq` | `faq` | Faq, MFaq | — |
| `/privacy` | `privacy` | Privacy, MPrivacy | — |
| `/auth` | `auth` (шаги phone → code → reg → done — внутреннее состояние) | Auth\*, MAuth | — |
| `/account/:tab?` (`orders`, `cell`, `favorites`, `bonus`, `profile`) | `account` | Account\*, MAccount | — |
| `*` | `notFound` | NotFound, MNotFound | — |

Пути — константы в `shared/config/routes.ts` (`ROUTES.product(slug)` и т. п.), строки в компонентах не хардкодим.

---

## 4. Целевая архитектура

### 4.1 Слои и слайсы

```
src/
  app/
    providers/
      router/       createBrowserRouter: layout-маршрут (MainLayout + <Outlet/>), lazy-страницы, errorElement → NotFound, <ScrollRestoration/>
      store/        rootReducer + baseApi.reducer/middleware, listener-middleware для localStorage
      mocks/        сборка MSW-обработчиков всех сущностей и старт воркера, если VITE_API_MOCKS=true
    layouts/        MainLayout: Header + <Outlet/> + Footer + CartDrawer + AgeGate + ScrollRestoration.
                    Лежит в app, а не в widgets: собирает несколько виджетов, а виджеты друг друга не импортируют
    model/styles/   styles.css (единственный @import "tailwindcss"), tokens: colors, text, shadows, animations, base
    ui/             App (StoreProvider → MotionConfig reducedMotion="user" → RouterProvider), main (StrictMode, старт MSW)

  pages/            по слайсу на маршрут из §3; страница только компонует виджеты и задаёт <title>

  widgets/
    header (+ мобильное меню), footer, cartDrawer, ageGate
    homePageHeroSectionCarousel, homePageScrollHeroSection, homePageVineyardsSection, homePageCellarSection
    shopShelves, catalogShelf (+ пагинация), searchResults
    productShowcase, productTaste, productRelated
    reserveForm, reserveSummary, reservationReceipt, pickupRoute
    newspaper, articleClipping, newsArchive, reviewLetters, reviewForm
    tastingsCalendar, cellarWall, hallPlan, giftBuilder, monthlyCrate, certificateBuilder
    storageGuide, faqBoard, privacyDocument, notFoundCellar
    authCard, accountHeader, accountTabs (+ по виджету на вкладку)

  features/
    cart/addToCart, cart/changeQty, cart/removeFromCart
    catalog/filterWines, catalog/sortWines, catalog/searchWines (SearchBox + подсказки)
    favorites/toggleFavorite
    age/confirmAge
    auth/byPhone (телефон → код → регистрация)
    reservation/createReservation
    tastings/bookTasting (запись и лист ожидания — одна форма)
    requests/cellarCell, requests/hall, requests/gift, requests/monthly, certificates/buy
    newsletter/subscribe, reviews/writeLetter

  entities/
    wine            api (список с фильтрами, фасеты, карточка, подсказки поиска), BottleCard, Shelf, Price
    grapeVariety    api (сорта для «Виноградников»)
    cart            slice: items { wineId, qty }, isOpen; селекторы count/total — только клиент
    session         api: GET /auth/session (кто вошёл), logout; хук useSession
    wineMode        бывший shared/model/appSlice: 'red' | 'white'
    reservation, tasting, cellarCell, newsIssue, article, letter, certificate, monthlyCrate, boutique, faqItem
    heroPageImages, heroPageScrollCards   (существующие; позже можно переименовать в heroSlide / homeStory)

  shared/
    ui/       Text, Flex, Button, IconButton, Chip, Checkbox, Radio, Switch, QtyStepper, Input, Textarea, Select, Field,
              Modal, Drawer, BottomSheet, Popover, Eyebrow, PageIntro, GlassPanel, PaperSurface, Breadcrumbs, Tag,
              Container, PageBackground, Picture (WebP + фолбэк), icons
    lib/      cn, hooks (useMotionChange, useMediaQuery, useLocalStorage, useLockBodyScroll, useScrollThreshold),
              ru (plural: бутылка/бутылки/бутылок, formatPrice, formatDate), ics (генерация .ics), stage (см. §4.5)
    config/   routes, breakpoints, contacts (адрес, телефон, часы — сейчас плейсхолдеры), env (VITE_API_URL, VITE_API_MOCKS)
    api/      baseApi (createApi + fetchBaseQuery, credentials: 'include', tagTypes), schema.ts (типы, сгенерированные из openapi.yaml),
              lib (ошибки, пагинация)

packages/contracts  контракт API (openapi/openapi.yaml — источник правды для фронта и бэкенда); с 18.10.2026 фронт — в apps/web
```

**Правила импортов:** `app → pages → widgets → features → entities → shared`, только вниз; слайсы одного слоя друг друга не импортируют; снаружи — только через `index.ts` слайса. Исключение: `import type { RootState, AppDispatch }` из `app/providers/store` в `shared/lib/hooks` (типы стираются при сборке). Если сущности нужна другая сущность (вино в корзине) — через ID и селекторы, а не через импорт UI.

### 4.2 Состояние

| Что | Где | Персист |
|---|---|---|
| Серверные данные: вина, новости, дегустации, кабинет… | кэш RTK Query (`baseApi`) | — |
| Сессия (кто вошёл) | RTK Query `GET /auth/session`; сама сессия — httpOnly-cookie, которую ставит бэкенд | cookie |
| Избранное | API `/me/favorites` (только для вошедших) | сервер |
| Корзина (позиции, открыта ли шторка) | `entities/cart` slice — до брони живёт только на клиенте | `localStorage` |
| Подтверждение 18+ | `features/age` (slice или `useLocalStorage`) | `localStorage` |
| Режим вина (red/white) | `entities/wineMode` slice → `data-wine` на `<html>` | — |
| Фильтры, сортировка, страница, запрос поиска | URL `searchParams` (делятся ссылкой, переживают F5) → аргументы запроса RTK Query | URL |
| Вкладка кабинета | URL `/account/:tab` | URL |
| Ховеры, открытые выпадашки, шаги форм | локальный state компонента | — |

Персист клиентских слайсов — одной `createListenerMiddleware` в `app/providers/store`, без `redux-persist`.

#### 4.2.1 API с первого дня (контракт сначала)

Бэкенда пока нет, но он будет и подстроится под фронт. Поэтому фронт сразу работает через настоящий HTTP-слой, а ответы пока отдаёт мок-сервер в браузере:

1. **Контракт** — `packages/contracts/openapi/openapi.yaml` (OpenAPI 3.1). Каждая фаза дописывает в него свои эндпоинты. Это и есть ТЗ для бэкенда.
2. **Типы** — `openapi-typescript` генерирует `packages/contracts/openapi/generated/schema.ts` (`pnpm contracts:gen`), фронт импортирует их из `@wine/contracts/openapi`; доменные типы сущностей — алиасы на схемы (`type Wine = components['schemas']['Wine']`), руками не дублируем.
3. **Клиент** — RTK Query: один `baseApi` в `shared/api` (`fetchBaseQuery({ baseUrl: VITE_API_URL, credentials: 'include' })`), эндпоинты — в `entities/<x>/api/*Api.ts` и `features/<x>/api/` через `baseApi.injectEndpoints`, теги для инвалидации. Компоненты используют только сгенерированные хуки (`useGetWinesQuery`) через публичный API слайса.
4. **Моки** — MSW (Mock Service Worker) перехватывает запросы на уровне сети: обработчики лежат рядом с эндпоинтами (`entities/<x>/api/mocks.ts`), данные берут из пакета `@wine/demo-data` (его же используют сиды бэкенда), типизированы той же схемой (`openapi-msw`), наружу отдаются отдельным публичным входом слайса `<x>/mocks.ts` (не через `index.ts`, чтобы MSW не попал в основной бандл) и собираются в `app/providers/mocks`. Если мокам одной сущности нужно что-то из другой (подписи рубрик) — кросс-импорт через FSD `@x` (`entities/newsIssue/@x/newsArticle.ts`). Включаются флагом `VITE_API_MOCKS=true` — в разработке и в портфолио-деплое, пока нет бэкенда. Когда бэкенд появится, флаг выключается, а компоненты, хуки и типы не меняются.
5. **Статичный контент** главной (слайды hero, истории) остаётся константами в `model/mock.ts`, как сейчас, — это вёрстка, а не данные.

Плейсхолдеры дизайна (`[цена] ₽`, `[N]`, `[адрес]`, `[имя сомелье]`) — значения в фикстурах MSW, не выдумываем; контакты бутика — в `shared/config/contacts.ts`.

**Черновик контракта** (уточняется по фазам):

| Область | Эндпоинты |
|---|---|
| Каталог | `GET /shelves` (полки магазина с превью), `GET /wines` (`shelf, q, country[], grape[], priceMin, priceMax, age[], volume[], sort, page`), `GET /wines/facets` (счётчики для фильтров), `GET /wines/{slug}`, `GET /search/suggest?q=` (вина, сорта, регионы), `GET /grapes` |
| Бронь | `GET /boutiques`, `GET /boutiques/{id}/slots`, `POST /reservations`, `GET /reservations/{id}` |
| Газета и письма | `GET /news/issues/latest`, `GET /news/issues?month=&rubric=`, `GET /articles/{slug}`, `GET /reviews?limit=&offset=`, `POST /reviews` (202 — на модерацию) |
| Услуги | `GET /tastings?month=`, `POST /tastings/{id}/bookings`, `POST /tastings/{id}/waitlist`, `GET /cellar/cells`, `POST /requests/cell`, `POST /requests/hall`, `POST /requests/gift`, `GET /monthly` (текущий + архив), `POST /monthly/subscriptions`, `POST /certificates`, `POST /newsletter` |
| Вход | `POST /auth/otp` (телефон → SMS), `POST /auth/otp/verify` (код → `registered` / `new`), `POST /auth/register`, `GET /auth/session`, `POST /auth/logout` |
| Кабинет | `GET/PATCH /me`, `GET /me/reservations` (+ `POST …/{id}/extend`, `DELETE …/{id}`), `GET /me/orders`, `GET /me/cell` (+ `POST /me/cell/prepare`), `GET/PUT/DELETE /me/favorites/{wineId}`, `GET /me/tastings`, `GET /me/bonus`, `GET/POST /me/certificates`, `PATCH /me/notifications`, `DELETE /me` |

Модель вина (из паспорта на карточке): `slug, name, producer, appellation, vintage, country, region, grapes[], type (red | white | sparkling | sweet | rose | fortified), shelf, bottle (red | white | sweet | spark | burg | flute | black | prosecco | port | tokaji — картинка + высота), volume, abv, aging, potential, cellarYears, price, badges[], profile { body, tannins, acidity, sweetness: 1–5 }, notes { aroma, taste, finish }, food[], serve { temp, decant, glass }, sommelierNote, relatedSlugs[], inStock`.

### 4.3 Стили

- Только токены `@theme`; хексы в компонентах — нет (исключение — разовые градиенты/тени конкретного декора, и они живут в `model/` слайса или в CSS-переменной).
- `cn()` для склейки классов; условные классы — объектом, не `&&`.
- `Text`: добавить проп `as` (`h1…h6`, `p`, `span`, `label`, `dt`/`dd`) — сейчас всё рендерится в `<p>`, заголовки не семантичны; расширить `SIZE` новыми кеглями и `COLOR` (`MUTED` = neutral-350, `ACCENT` = amber-200, `INK` = neutral-800). Стиль пропсов `FONT/SIZE/STYLE/COLOR` сохраняем.
- Режим вина: в `@theme` `--color-wine-accent` / `--color-wine-accent-strong` по умолчанию «белые», переопределение в `[data-wine="red"]` → утилиты `bg-wine-accent`, `text-wine-accent` без условных классов. `ProgressBar` перестаёт читать тему из Redux напрямую.
- Шрифты — `@font-face` с woff2 в `src/assets/fonts`, preload для Pacifico и Shantell Sans 400.

### 4.4 Анимации

- `motion`: варианты — в `model/animations.ts` слайса (как сейчас). Общие переходы (spring 70/100, `ease: [.2, .7, .2, 1]`) — в `shared/lib/motion.ts`.
- Скролл-эффекты — от прогресса секции: `useScroll({ target: ref, offset: ['start start', 'end end'] })`, а не от абсолютного `scrollY`.
- Декоративные бесконечные анимации (качание гроздей, мерцание, пыль) — CSS-кейфреймы из дизайна через `@theme --animate-*`, не через JS.
- `<MotionConfig reducedMotion="user">` + CSS `@media (prefers-reduced-motion)` для кейфреймов.

### 4.5 Адаптивность

Дизайн есть для 1920 и 390. Брейкпоинты Tailwind по умолчанию: `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536 + свой `3xl` 1920.

- **Страницы с обычной вёрсткой** (магазин, формы, кабинет, услуги): mobile-first, `Container` с `max-w-[1680px]` и полями `px-4 md:px-10 xl:px-[120px]`, сетки на `grid`. Мобильная раскладка — из M-артбордов.
- **Арт-секции на абсолютном позиционировании** (Hero, Истории, Виноградники, таймлайн погреба, полки): на `≥ lg` — «сцена» `--stage: min(100cqw, 1920px)` внутри родителя с классом `@container`; координаты из дизайна переводим хелпером `stage(866)` → `calc(866 / 1920 * var(--stage))`, кегли — `stageFont(96, 56)` (`clamp`). Так макет 1920 точно воспроизводится и пропорционально сжимается до 1024. Где геометрию анимирует motion (слайды hero), размер секции меряется `useElementSize`, и координаты считаются в пикселях. Блоки с фиксированными кеглями (панель каталога погреба) — обычной flex-вёрсткой, чтобы не наезжали на текст на 1024–1440.
- **Десктоп ↔ мобильная раскладка**: в тяжёлых арт-секциях — разными компонентами через `useMediaQuery(MEDIA.desktop)` (SSR нет, прыжка при гидратации не будет, а в DOM нет второй копии секции); в лёгких (шапка, футер, корзина) — классами `lg:`.
- Каждый виджет сдаётся сразу в двух раскладках — отдельной «мобильной фазы» нет.

### 4.6 Ассеты

Уже в проекте и совпадают с дизайном: `1.png` (фон hero), `2–9.png` (карточки hero), `wine1–5.png` (бутылки историй), `ripped-paper.png`, `wooden-back.jpg` (фон ~40 страниц).

Выгрузить из дизайна (`/_blob/<id>` → `public/images/…`, затем WebP/AVIF):

| Что | blob id | Куда |
|---|---|---|
| Фон виноградника | `231c148a6caf63800491e6b86ed2c9ca` | `home/vineyard-bg` |
| Грозди: каберне, шардоне, мерло, совиньон блан, пино нуар, рислинг | `c82c9134…`, `ce5f8bac…`, `ca8edbad…`, `37dbb4ce…`, `8358a481…`, `69d4d74d…` (+ запасная белая `21bc186f…`) | `grapes/*.png` |
| Подземный погреб (фон секции и страниц услуг) | `6b875750e8f2abbc0b53e2cc7664dcb4` | `backgrounds/cellar` |
| 10 бутылок-вырезок | red `44e9a32f…`, white `753571af…`, sweet `f16ce63c…`, spark `d39d456f…`, burg `f03302be…`, flute `04c92b41…`, black `8a0d9639…`, prosecco `728feb32…`, port `24837c20…`, tokaji `8332f4c2…` | `bottles/*.png` |
| Доска полки | `676405bb571d4e669cd0bcb355f68951` | `textures/shelf` |
| Газетная бумага | `13945a333f5d6c39a3922362dbbbcee9` | `textures/paper` |
| Иллюстрации газеты: поставка, урожай, дегустация | `65cea5af…`, `232858fe…`, `87249cfb…` | `news/*` |
| Марка/печать для писем | `47bda841172bb5396e1a9b6470a68cc0` | `reviews/stamp` |

Иконки — `react-icons` в одном наборе со штриховым стилем дизайна (`lu` — Lucide). Эмодзи из дизайна (🥩 🦌 🧀 🍄 на карточке, 🎂 💼 💍 в аренде зала) заменить иконками.

### 4.7 Качество

- `<title>` и `<meta name="description">` — прямо в компоненте страницы (React 19 поднимает их в `<head>`).
- Доступность: в дизайне уже расставлены `aria-*`, `role`, `aria-live`, `aria-pressed`, `aria-expanded` — переносим как есть. Фокус в модалках/шторках заперт, `Esc` закрывает, после закрытия фокус возвращается.
- Код-сплиттинг по маршрутам (`lazy`), `loading="lazy"` для всего ниже первого экрана.
- Тесты (опционально, Фаза 10): Vitest + Testing Library — редьюсеры корзины, `plural`, фильтрация каталога, хуки карусели.

### 4.8 Сборка и деплой

Проект пока нигде не хостится. Аудитория сайта — в России, а популярные зарубежные платформы для фронтенда там работают нестабильно: Vercel частично недоступен (особенно с мобильного интернета), Netlify заблокирован, сайты за Cloudflare с июня 2025 года режутся российскими провайдерами до первых 16 КБ ([Хабр](https://habr.com/ru/companies/amvera/articles/1028136/), [Threads](https://www.threads.com/@mangust59/post/DUqL_bwk8sX/vercel-%D1%87%D0%B0%D1%81%D1%82%D0%B8%D1%87%D0%BD%D0%BE-%D0%B7%D0%B0%D0%B1%D0%BB%D0%BE%D0%BA%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD-%D0%B2-%D1%80%D1%84-netlify-%D0%BF%D0%BE%D0%BB%D0%BD%D0%BE%D1%81%D1%82%D1%8C%D1%8E-%D0%B7%D0%B0%D0%B4%D0%B5%D0%BF%D0%BB%D0%BE%D0%B8%D1%82%D1%8C-%D0%BC%D0%BE%D0%B6%D0%BD%D0%BE-%D0%B0-%D0%B4%D0%B0%D0%BB%D1%8C%D1%88%D0%B5-%D1%87%D1%82), [Cloudflare](https://blog.cloudflare.com/russian-internet-users-are-unable-to-access-the-open-internet/), [BleepingComputer](https://www.bleepingcomputer.com/news/technology/russias-throttling-of-cloudflare-makes-sites-inaccessible/)). Поэтому деплой — переносимый контейнер, который запускается у любого провайдера:

- **GitHub Pages** (решение от 18.10.2026, заменило Docker-образ с nginx и российскую облачную платформу): фронт — статикой на `the-g0ose.github.io/wine-boutique/`, выкладка из `main` job'ом в `ci.yml`. Сборка с `BASE_PATH=/wine-boutique/`, SPA-фолбэк — копия `index.html` в `404.html`, CSP и Referrer-Policy — мета-тегами из `vite.config.ts`. Данные — MSW.
- **GitHub Actions** (`ci.yml`) на каждый push: актуальность контрактов, `pnpm lint`, `pnpm typecheck`, сборка под Pages; на `main` — деплой. Бэкенд в CI не участвует, он будет на VPS.
- Переменные окружения сборки: `VITE_API_URL`, `VITE_API_MOCKS`, `BASE_PATH` (base Vite; на Pages — `/wine-boutique/`).

---

## 5. Этапы

Каждый этап — отдельный PR, desktop + mobile сразу, `pnpm build` и `pnpm lint` без ошибок. Данные этапа: сначала эндпоинты в `api/openapi.yaml` → `pnpm api:types` → RTK Query в сущности → MSW-обработчики с фикстурами из дизайна.

### Фаза 0 · Фундамент
1. Исправить техдолг 1–4, 10–14 из §1.4; вернуть `StrictMode`.
2. Токены: amber, neutral, cellar, paper, wine-accent; кегли 72/64/56/44/18/14; тени в `@theme`; кейфреймы; шрифты Noto Sans, Old Standard TT, Oranienbaum (woff2).
3. `shared/lib`: `cn`, `plural`, `formatPrice`, `useMediaQuery`, `useLocalStorage`, `useLockBodyScroll`, `useScrollThreshold`, `stage()`.
4. `shared/ui`: расширить `Text` (`as`, новые SIZE/COLOR), почистить `Flex`; добавить Button, IconButton, Chip, Checkbox, Radio, Switch, QtyStepper, Input/Textarea/Select/Field, Modal, Drawer, BottomSheet, Popover, Eyebrow, PageIntro, GlassPanel, PaperSurface, Breadcrumbs, Container, PageBackground, Picture.
5. Оптимизировать картинки (WebP/AVIF), выгрузить новые ассеты из §4.6.
6. API-фундамент (§4.2.1): `api/openapi.yaml` с общими схемами (ошибка, пагинация), `openapi-typescript` + скрипт `api:types`, `shared/api/baseApi`, `shared/config/env`, MSW + `openapi-msw`, `app/providers/mocks` со стартом по `VITE_API_MOCKS`.

**Готово, когда:** главная выглядит как раньше, но на новых токенах; в бандле один preflight; Lighthouse не ругается на вес картинок; MSW стартует и отвечает на пробный эндпоинт.

### Фаза 1 · Каркас приложения
1. `createBrowserRouter` с layout-маршрутом, все маршруты из §3 (страницы — заглушки с `PageIntro`), lazy-загрузка, `ScrollRestoration`, 404.
2. `entities/cart` и `entities/wineMode` (слайсы, персист корзины), `entities/session` (`GET /auth/session` через MSW — пока всегда гость).
3. `widgets/header` (прозрачная → тёмная после 80 px, активный пункт по маршруту, аккаунт, корзина), `widgets/mobileMenu`.
4. `widgets/cartDrawer` (+ мобильная шторка), `features/cart/*`.
5. `widgets/footer` + `features/newsletter/subscribe`.
6. `widgets/ageGate` + `features/age/confirmAge`.
7. `widgets/notFoundCellar` (404 — стена ячеек, № 404 пустая).
8. Деплой (§4.8): `Dockerfile` + `nginx.conf` со SPA-фолбэком, `.dockerignore`; CI-проверки вместо FTP-деплоя; инструкция по подключению хостинга в README.

**Готово, когда:** по всем ссылкам шапки и футера есть переход, F5 на любом маршруте работает в Docker-контейнере, счётчик корзины живёт между страницами и после перезагрузки.

### Фаза 2 · Главная
1. Hero: геометрия, шрифты, подпись вида вина, прогресс по позиции, счётчик `01–08`; починить `useCarousel` (5); мобильный hero (MHome).
2. Истории: sticky вместо fixed, прогресс от секции (6–9), типографика по дизайну; мобильная версия — карточки в столбик.
3. `entities/grapeVariety` + `widgets/homePageVineyardsSection`: 6 качающихся гроздей, тултип по ховеру/фокусу, модалка сорта на «бумаге» с паспортом и тремя винами; мобильная — горизонтальная лента + нижняя шторка.
4. `widgets/homePageCellarSection`: спуск с таймлайном лет (2026 → 1988), мерцание и пылинки, «Каталог погреба» с табами и «+» в корзину, ссылка на полку; мобильная — список-«слои».
5. Режим вина через `data-wine`.

### Фаза 3 · Каталог
1. `entities/wine`: контракт каталога (`/shelves`, `/wines`, `/wines/facets`, `/wines/{slug}`, `/search/suggest`), RTK Query, MSW-фикстуры (~40 вин из артбордов Shop/Category/Search) с фильтрацией и сортировкой на стороне мока, `BottleCard`, `Shelf`, `Price`.
2. `widgets/shopShelves` (`/shop`): 4 полки-карусели по 7 видимых, листание по 3.
3. `features/catalog/filterWines` (Страна, Сорт, Цена, Выдержка, Объём — поповеры с чекбоксами и счётчиками, чипы выбранных, «Сбросить всё») + `sortWines` (5 вариантов) — всё в URL.
4. `widgets/catalogShelf` (`/shop/:shelf`): крошки, табы полок, сетка 7 в ряд, пагинация.
5. `features/catalog/searchWines`: SearchBox с подсказками (вина / сорта / регионы, «Все результаты») + страница `/search` с пустым состоянием.
6. `pages/product`: витрина под лампой, этикетка-паспорт, количество, «В корзину» (→ «Добавлено ✓»), «Забронировать», профиль вкуса (шкалы из 5 точек), «К столу», подача, «С этим вином берут».

### Фаза 4 · Бронь и самовывоз
1. `pages/reserve`: react-hook-form — контакты, выбор бутика (радио-карточки), день (7 дней) и время (12:00–21:00), комментарий, две обязательные галочки; сводка справа, кнопка неактивна без галочек.
2. `pages/reserveSuccess`: квитанция-чек со штампом «ЗАБРОНИРОВАНО», шаги, «В календарь» (`.ics` из `shared/lib/ics`), очистка корзины.
3. `pages/pickup`: карта пути из 4 остановок с подсказкой, правила брони, адреса бутиков.

### Фаза 5 · Газета и письма
1. `pages/news`: газетный лист — шапка «Винный Вѣстникъ», рубрики, главная статья с буквицей и иллюстрацией, колонка «Коротко», вторая полоса, объявления, афиша-таблица, навигация по выпускам.
2. `pages/article`: вырезка на столе + иллюстрация, CTA «Забронировать» / «Попробовать на дегустации», ещё вырезки.
3. `pages/newsArchive`: стопки по месяцам (вкладки), фильтр рубрик, первые полосы выпусков.
4. `pages/reviews`: письма + конверты с маркой (раздвигаются по ховеру), «Показать ещё», форма «Напишите нам письмо».

### Фаза 6 · Услуги
1. `tastings`: легенда типов (фильтр), календарь месяца с метками, панель дня с карточками событий и местами 12, запись (форма → «Вы записаны!»), лист ожидания, форматы.
2. `cellarStorage`: факты, стена из 32 ячеек (свободна / занята / выбрана), карточка ячейки со сроком, шаги, заявка.
3. `hall`: 3 рассадки на «чертеже» (банкет / фуршет / лекция), что входит, форма, поводы.
4. `gifts`: конструктор ящика (упаковка, 1–3 бутылки, дополнения, текст бирки, тираж) с живым превью, заявка.
5. `monthly`: ящик со стенсилом, тарифы, подписка, архив прошлых ящиков.
6. `certificates`: живой сертификат-«ценная бумага» (номинал, кому, от кого, пожелание, формат), оформление.

### Фаза 7 · Инфо
`storage` (справочник: термометр по типам вин, положение бутылки, условия, шкала выдержки), `faq` (пробковая доска с записками и темами), `privacy` (документ с печатью и оглавлением-якорями).

### Фаза 8 · Личный кабинет
1. `features/auth/byPhone`: телефон с маской → код из 4 цифр (экранная клавиатура, ошибка, таймер) → регистрация (дата рождения с проверкой 18+, согласия) → «Карта готова!». В MSW: код `1988` — новый гость, `2015` — существующий; сессия — cookie на стороне мока.
2. `pages/account`: карта гостя, уровень и прогресс, статистика; вкладки Обзор, Брони и заказы (QR, продление, отмена, история), Моя ячейка (схема + опись), Избранное и дегустации, Бонусы и сертификаты (уровни, история, добавить сертификат), Профиль (форма, вкусы, уведомления-переключатели, сессии, удаление).
3. Охрана маршрута `/account` → редирект на `/auth`.

### Фаза 9 · Полировка
Сквозная проверка мобильных раскладок на 360–430 и планшетах 768–1024; a11y-аудит (клавиатура, фокус, контраст), Lighthouse ≥ 90, мета-теги, favicon, OG-картинка.

### Фаза 10 · (опционально) Тесты и подключение бэкенда
Vitest + Testing Library (MSW-обработчики переиспользуются в тестах). Когда бэкенд реализует `api/openapi.yaml`: `VITE_API_MOCKS=false`, `VITE_API_URL` на сервер, сверка контракта.

Бэкенд (микросервисы на NestJS, PostgreSQL + Prisma) — отдельный план: [backend-plan.md](backend-plan.md), правила — [backend-architecture.md](backend-architecture.md). Его этап B0 переносит фронт в `apps/web`, а контракт и фикстуры MSW — в общие пакеты `packages/contracts` и `packages/demo-data`.

---

## 6. Принятые решения (17.10.2026)

| # | Вопрос | Решение |
|---|---|---|
| 1 | Hero | Механика из кода (активная карточка разворачивается в фон); геометрия, типографика, цвета, счётчик и прогресс-бар — по дизайну (§2.5) |
| 2 | Секция историй | Скролл-анимация, починенная (sticky, прогресс секции) и с типографикой из дизайна |
| 3 | Арт-секции на 1024–1919 | Пропорциональная «сцена» `stage()` + `clamp()` для кеглей; ниже 1024 — мобильная раскладка (§4.5) |
| 4 | Маршрут магазина | `/shop` вместо `/store` |
| 5 | Хостинг | Пока нет. Docker-образ с nginx и SPA-фолбэком, российская облачная платформа, GitHub Actions — только проверки (§4.8) | **18.10.2026:** фронт — на GitHub Pages из CI, бэкенд — на арендованном VPS.
| 6 | Алиас `uikit;/` | Оставляем как есть: `shared/ui` импортируется через `uikit;/` |
| 7 | Вход, кабинет и данные | Бэкенд будет позже и подстроится под фронт: контракт в `api/openapi.yaml`, RTK Query, MSW вместо сервера до его появления (§4.2.1) |
| 8 | Бэкенд (18.10.2026) | Микросервисы на NestJS 12 (Fastify), gRPC + NATS JetStream, Traefik, PostgreSQL 18 (база на сервис) + Prisma 7; контракты — пакет `@wine/contracts` — [backend-plan.md](backend-plan.md), [backend-architecture.md](backend-architecture.md) |

Принцип для инфраструктуры и инструментов: выбирать актуальные современные решения, которые при этом работают для аудитории в России.

---

## 7. Статус

**Сделано (ветка `feat/home-page`, 17.10.2026) — главная страница целиком:**

- Фаза 0 в объёме главной: токены (amber, neutral, cellar, paper, режим вина, кегли, тени, кейфреймы), шрифты через fontsource (woff2 по алфавитам вместо 3 МБ TTF), картинки WebP (hero 21 МБ → 0,9 МБ), ui-кит (Text с `as`, Eyebrow, Button/ButtonLink/IconButton, Chip, QtyStepper, TextField, Overlay/Modal/Drawer), `cn`, `stage`, `plural`, хуки; API-слой (`api/openapi.yaml`, `pnpm api:types`, `baseApi`, MSW + openapi-msw); техдолг 1–14 из §1.4.
- Фаза 1 частично: layout-маршрут, шапка (прозрачная → тёмная, мобильное меню), корзина-шторка (справа / снизу) с персистом, футер с подпиской, модалка 18+. Остальные маршруты пока показывают только шапку и футер.
- Фаза 1, п. 8: FTP-деплой заменён на CI (`ci.yml`) и Docker-образ с nginx (`Dockerfile`, `deploy/nginx`), инструкция по хостингу — в README. Хостинг ещё не подключён.
- Фаза 2 полностью: hero, истории (sticky), виноградники с модалкой/шторкой сорта, погреб с каталогом.

- Фаза 5, п. 1: страница новостей `/news` — газета «Винный Вѣстникъ» (десктоп и мобильная), данные из `GET /news/issues/latest`, рубрика в URL (`?rubric=`), страница грузится отдельным чанком.
- Фаза 5, п. 2–3: статья `/news/:slug` (вырезка, фото, стикеры «Забронировать» / «Попробовать на дегустации», «Ещё вырезки»; `GET /news/articles/{slug}`, 404 — пустая вырезка) и подшивка `/news/archive` (стопки по месяцам — вкладки со стрелками, фильтр рубрик на десктопе, первые полосы выпусков; `GET /news/archive?month=&rubric=`, месяц и рубрика в URL). Тексты статей, кроме Château d’Yquem 1988, — заглушки до прихода от редакции.
- Фаза 5, п. 4: отзывы `/reviews` — письма гостей рядом с конвертами (расходятся при наведении), на мобильных конверты-аккордеон; «Показать ещё письма» — RTK Query `infiniteQuery` по `GET /reviews`; форма «Напишите нам письмо» (`features/reviews/writeLetter`, `POST /reviews`). Тексты писем, имена, города и даты — плейсхолдеры дизайна. Фаза 5 закрыта.
- Фаза 6, п. 1 (20.10.2026) — дегустации `/tastings`, сразу на фронте и в сервисе tastings:
  - легенда типов — она же фильтр (скрытые типы в URL `?hide=`), календарь месяца с бирками дегустаций (на мобильных — точка цвета первой), листание на текущий и два следующих месяца (`?month=`), выбранный день — `?day=`;
  - панель дня: карточки с местами квадратиками (на мобильных — билеты), «Записаться» → форма (имя, телефон, гостей 1–6, согласие) → приглашение «Вы записаны!» с «В календарь» (`.ics`); мест нет — лист ожидания через ту же форму; прошедшие — «Дегустация уже прошла»;
  - форматы и плашка «Своя компания — своя дегустация» → зал; фон страниц услуг — `PageBackground variant="cellar"`.
  - Афиша макета (октябрь 2026) в `@wine/demo-data` раскладывается на любой месяц правилом «n-я пятница, n-е воскресенье…»: октябрь совпадает с макетом. Цена и ведущий — плейсхолдеры дизайна.
- Фаза 4 (20.10.2026) — бронь и самовывоз, сразу на фронте и в сервисе reservations:
  - `/reserve` — контакты (маска телефона +7), бутик (радио-карточки), день из семи и время по часам бутика (закрытые дни — недоступны), пожелания, две обязательные галочки; сводка справа липкая; пустая корзина — ссылка к полкам; `?boutique=` выбирает бутик заранее (ссылка «Забронировать сюда»);
  - `/reserve/:id` — квитанция-чек со штампом, шаги, «В календарь» (`.ics` из `shared/lib/ics`), принятая бронь очищает корзину;
  - `/pickup` — старая карта с четырьмя остановками (записка с текущим шагом), правила брони, бутики из API.
  - «Забронировать» на карточке вина кладёт бутылку в корзину и ведёт к брони. Слоты, «держим до» и номер — эталон `@wine/demo-data` (моки) и тот же код в сервисе.
- Фаза 3 (20.10.2026) — каталог целиком, сразу на фронте и в сервисе catalog:
  - `/shop` — четыре полки-карусели (стрелки листают по три бутылки, на мобильных — лента пальцем), фильтры сужают все полки, «Вся полка →» открывает полку с теми же фильтрами;
  - `/shop/:shelf` — крошки, табы полок, фильтры (Страна, Сорт, Цена, Выдержка, Объём — панели с чекбоксами и счётчиками, выбранные — чипами, «Сбросить всё») и сортировка, вина на досках по 7 в ряд (на узких экранах — сколько встанет), страницы по 21; на мобильных — по 2 в ряд, шторка фильтров и «Показать ещё»;
  - `/search?q=` — поиск с подсказками (вина, сорта, регионы, «Все результаты», клавиатура ↑↓ Enter Esc), результаты с фильтрами, пустое состояние; на мобильных поле поиска на полках — ссылка на страницу поиска;
  - `/wine/:slug` — витрина под лампой, этикетка-паспорт, количество, «В корзину» (→ «Добавлено ✓»), «Забронировать» (кладёт в корзину и ведёт к брони), профиль вкуса, «К столу», «С этим вином берут»; на мобильных — липкая панель с ценой и кнопками.
  - Фильтры, сортировка, поиск и страница — в URL (`useCatalogParams` в `entities/wine`). Данные — 53 вина из макетов (Shop, Category, Search, Product) в `@wine/demo-data`; там же эталон запросов каталога (`listWines`, `wineFacets`, `listShelves`, `wineDetails`, `searchSuggestions`): по нему отвечают моки MSW, с ним сверяются тесты сервиса. Подробная карточка в макетах одна — Sassicaia 2015, у остальных вин профиль вкуса и подача не описаны (секции показывают это), цены, крепость и заметки — плейсхолдеры дизайна.

**Сознательные отступления от макета:**

- Фон hero затемнён (`brightness(0.72)`) — без этого белый заголовок не читается на светлых кадрах.
- Янтарная шкала глубины в погребе заполняется по мере прокрутки (в макете — статична).
- На мобильной главной годы погреба взяты из десктопного макета (2026 → 1988, с винами), а не из MHome (2016 → 1986): так совпадают с каталогом.
- Нижняя часть погреба (текст + панель каталога) свёрстана flex-строкой, а не по координатам.
- Название газеты — 100px вместо 124px (в колонку между плашками шириной 764px 124px в строку не помещается); на мобильных кегль ужимается под ширину листа.
- Рубрики газеты на десктопе не скрывают, а приглушают материалы других рубрик — иначе ломается вёрстка полосы; на мобильных фильтруют ленту, как в MNews.
- Первые полосы в подшивке на 1024–1600 ужимают кегли вместе с карточкой (`cqw`), а не по `stage()`: сетка в 4 колонки, ширина карточки зависит от экрана.
- На мобильной подшивке фильтра рубрик нет (как в MArchive), поэтому ссылка с `?rubric=` там показывает весь месяц.
- Штемпель темы на мобильном конверте поднят над строкой адреса: в макете длинная тема («бронь и самовывоз») наезжает на «Premium Wine Boutique». Шрифт штемпеля — системный моноширинный: в Courier Prime из макета нет кириллицы.
- После отправки письма форма показывает подтверждение «Спасибо! Сомелье прочтёт письмо…» — в макете меняется только текст кнопки.
- Бронь: в мобильной форме нет поля почты и пожеланий (как в MReserve). Слотов «по часу до закрытия» больше, чем в мобильном макете (там восемь). Часовой пояс бутиков — московский, пока город в адресе — плейсхолдер. На странице брони текст «Пришлём SMS» — SMS пока не отправляются (уведомлений ещё нет).
- Каталог: шкала цены в фильтре — два поля «от/до» без ползунка (цен у вин пока нет, ползунку не на что опереться). Пустое состояние и «Сбросить фильтры» при пустой полке — в макетах их нет. В мобильной шторке фильтров видно по 8 вариантов в группе и «Ещё N» — сортов в погребе почти три десятка. Подсказки поиска показывают до четырёх сортов и регионов (в макете — по два). Регион вина — по названию («Риоха Гран Резерва» — Риоха), а не страна, как на бирке в макете.

- Дегустации: в форме записи есть галочка согласия на обработку данных (в макете её нет — без неё запись по 152-ФЗ не принять). Лист ожидания спрашивает имя и телефон той же формой (в макете кнопка сразу меняет текст — но звонить без контактов некуда). На мобильных есть стрелки месяцев и легенда-фильтр лентой (в MTastings только текущий месяц и нет фильтра). После записи панель показывает приглашение вместо афиши дня и на мобильных (в MTastings меняется только текст кнопки).

**Открытые вопросы по контенту:**

- Слайд 7 hero («Корпоративные подборки») обещает «Доставка в день заказа по Москве…», а концепция дизайна — «мы не доставляем алкоголь, только бронь и самовывоз».
