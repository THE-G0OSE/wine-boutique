# Wine Boutique

Сайт винного бутика (портфолио). React 19 + Vite 7 + TS strict, Tailwind v4, motion 12, Redux Toolkit, react-router 7. Интерфейс и общение — на русском.

- План работ, карта маршрутов, токены дизайна, решения: [docs/implementation-plan.md](docs/implementation-plan.md). Перед задачей сверяйся с ним и обновляй его, если решение меняется.
- Дизайн (источник правды по виду и текстам): https://claude.ai/artifact/G57VXkJRvN2HVSHm65Q2Ua — канвас, читать через `Artifact` → `read` с `paths: ["project/<Имя>.dc.html"]`. `LinkMap` — карта сайта, `Foundations` — токены, `M*` — мобильные версии (390 px), остальное — десктоп 1920.

## Команды

```bash
pnpm dev
pnpm build      # tsc -b && vite build — должен проходить перед каждым коммитом
pnpm lint
pnpm api:types  # после правки api/openapi.yaml — перегенерировать src/shared/api/schema.ts
node scripts/optimize-image.mjs <вход> public/images/<путь>.webp [ширина] [качество]  # новые картинки — только WebP
```

На каждый push GitHub Actions (`.github/workflows/ci.yml`) гоняет линтер, типы, сборку и сборку Docker-образа со смоук-тестом. Деплоя в Actions нет: хостинг (российская облачная платформа) сам собирает `Dockerfile`; nginx-конфиг — `deploy/nginx/`, порт 8080. Новый сторонний домен (API, CDN) — добавить в CSP в `deploy/nginx/security-headers.conf`.

## Архитектура — Feature-Sliced Design

Слои `src/`: `app → pages → widgets → features → entities → shared`. Импорт только вниз; слайсы одного слоя друг друга не импортируют; снаружи слайса — только через его `index.ts`. Исключения: `import type` стора из `app/providers/store` в `shared/lib/hooks`; вход для мок-сервера `<slice>/mocks.ts` (импортирует только `app/providers/mocks`); кросс-импорт сущностей — только через FSD `@x` (`entities/wine/@x/grapeVariety.ts`).

- `app` — провайдеры (router, store, mocks), стили-токены и `layouts/MainLayout` (каркас страниц собирает виджеты, поэтому живёт здесь, а не в widgets).
- `pages` — компонуют виджеты под маршрут, задают `<title>`; без логики.
- `widgets` — самостоятельные блоки страницы (шапка, hero, полка, календарь).
- `features` — действия пользователя (в корзину, фильтр, вход, заявка).
- `entities` — бизнес-сущности: типы, моки, slice, доменный UI (BottleCard, Price).
- `shared` — ui-кит без домена, `lib` (хуки, `cn`, `plural`), `config` (routes, contacts), `api`.

Структура слайса (держимся существующей):

```
<slice>/index.ts            export * from './model'; export * from './ui'
<slice>/api/*Api.ts         эндпоинты RTK Query (baseApi.injectEndpoints)
<slice>/api/mocks.ts        MSW-обработчики (фикстуры — api/fixtures.ts); наружу — через <slice>/mocks.ts
<slice>/model/types.ts      типы (доменные — алиасы на схемы из shared/api/schema.ts)
<slice>/model/mock.ts       моковые данные
<slice>/model/animations.ts motion Variants / Transition
<slice>/model/lib/hooks/    хуки слайса
<slice>/ui/Name.tsx         export default; ui/index.ts: import Name from './Name'; export { Name }
<slice>/ui/components/<x>/  вложенные части виджета со своими model/ui
```

Имена слайсов — camelCase (`homePageHeroSectionCarousel`, `cellarStorage`). Компоненты — `FC<IProps>`, интерфейс пропсов `IProps`. Алиасы: `@/*` → `src/*`; `shared/ui` импортируется через `uikit;/` (`import { Text, Flex } from "uikit;/"`) — так принято, не переименовываем.

## Правила

- Стили — только утилиты Tailwind и токены из `src/app/model/styles` (`@theme`). Новый цвет/кегль/тень — сначала токен, потом использование. Хексы в компонентах не пишем.
- `@import "tailwindcss"` — один раз, в `styles.css`.
- Классы склеиваем через `cn()`; условные — объектом, не `cond && "class"`.
- В `cn()` `leading-*` ставим после `text-*`: tailwind-merge считает, что размер шрифта задаёт и интерлиньяж, и выкидывает стоящий перед ним `leading-*`.
- Текст — через `Text` из `shared/ui` (пропсы `FONT/SIZE/STYLE/COLOR`, `as` для семантики тега).
- Анимации — `motion/react`, варианты в `model/animations.ts`. Скролл-эффекты считаются от прогресса секции (`useScroll({ target })`), не от абсолютного `scrollY`. Бесконечный декор — CSS-кейфреймы из токенов. Уважать `prefers-reduced-motion`.
- Не вешать `overflow: hidden/scroll` на предков элементов со `position: sticky` (используй `overflow-x-clip`).
- Данные — только через API, контракт сначала: эндпоинт описывается в `api/openapi.yaml` → `pnpm api:types` генерирует `src/shared/api/schema.ts` → RTK Query в слайсе (`baseApi.injectEndpoints`) → MSW-обработчик с фикстурами из дизайна. Бэкенда пока нет; он реализует этот контракт, поэтому компоненты не знают про моки (`VITE_API_MOCKS`).
- Статичный контент вёрстки (слайды hero, истории главной) — константы в `model/mock.ts`, не API.
- Клиентское состояние: корзина, режим вина, 18+ — Redux-слайсы, персист в `localStorage`. Сессия — httpOnly-cookie бэкенда + `GET /auth/session`, токены в `localStorage` не храним. Фильтры, сортировка, поиск, вкладки — в URL. Остальное — локальный state.
- Пути — константы из `shared/config/routes.ts`, не строки.
- Каждый виджет — сразу десктоп (по артборду 1920) и мобильная раскладка (по `M*`-артборду). Брейкпоинт — `lg` (1024). Лёгкие блоки переключаем классами `lg:`, тяжёлые арт-секции — разными компонентами через `useMediaQuery(MEDIA.desktop)`.
- Внутренние страницы: обёртка `relative isolate` + `PageBackground` из `uikit;/` (доски и виньетка), отступ сверху под фиксированную шапку (`pt-22 lg:pt-42`). Новые страницы подключаются в роутер через `lazy`.
- Арт-секции, нарисованные на 1920 в абсолютных координатах: родитель `@container`, координаты — `stage(px)`, кегли — `stageFont(px, min)` из `shared/lib/stage`. Модалки и шторки — только через `Modal`/`Drawer`/`Overlay` из `uikit;/` (портал, фокус, Esc, блокировка скролла).
- Плейсхолдеры дизайна (`[цена] ₽`, `[адрес]`, `[N]`) не выдумываем — оставляем плейсхолдерами в моках/конфиге.
- Подпись «Ripped PNGs by Vecteezy» в футере обязательна (лицензия на рваную бумагу).
- Инфраструктура и инструменты: выбирать актуальные современные решения, но проверять, что они работают для аудитории в России (Vercel, Netlify и Cloudflare там нестабильны).
