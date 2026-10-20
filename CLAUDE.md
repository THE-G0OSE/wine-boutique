# Wine Boutique

Сайт винного бутика (портфолио). React 19 + Vite 7 + TS strict, Tailwind v4, motion 12, Redux Toolkit, react-router 7. Интерфейс и общение — на русском.

- План работ, карта маршрутов, токены дизайна, решения: [docs/implementation-plan.md](docs/implementation-plan.md). Перед задачей сверяйся с ним и обновляй его, если решение меняется.
- Дизайн (источник правды по виду и текстам): https://claude.ai/artifact/G57VXkJRvN2HVSHm65Q2Ua — канвас, читать через `Artifact` → `read` с `paths: ["project/<Имя>.dc.html"]`. `LinkMap` — карта сайта, `Foundations` — токены, `M*` — мобильные версии (390 px), остальное — десктоп 1920.

## Репозиторий

Монорепозиторий pnpm: `apps/web` — фронтенд (всё про FSD ниже — относительно `apps/web/src`), `packages/contracts` (`@wine/contracts`) — контракты API, `packages/demo-data` (`@wine/demo-data`) — данные из макетов для моков MSW и будущих сидов, позже `services/*` — бэкенд.

## Команды

```bash
pnpm dev             # фронт
pnpm build           # все пакеты; должен проходить перед каждым коммитом
pnpm lint
pnpm typecheck
pnpm contracts:gen   # после правки packages/contracts/openapi/openapi.yaml — типы и zod-схемы; результат коммитится
node apps/web/scripts/optimize-image.mjs <вход> apps/web/public/images/<путь>.webp [ширина] [качество]  # новые картинки — только WebP
```

На каждый push GitHub Actions (`.github/workflows/ci.yml`) проверяет, что сгенерированное из контракта актуально, гоняет линтер, типы и сборку; из `main` фронт выкладывается на GitHub Pages (`/wine-boutique/`). Бэкенд в CI пока не участвует — будет на VPS.

- Сайт на Pages живёт в подпапке: файлы из `public/` — только через `asset("/images/…")` из `shared/lib/asset` (и в `src`, и в `style`; не `bg-[url(/…)]` в классах), ссылки — через `Link` и `ROUTES` (basename роутера подставится сам).
- CSP — мета-тег из `vite.config.ts` (у Pages нет заголовков). Новый сторонний домен (CDN, API) — добавить туда.

## Архитектура — Feature-Sliced Design

Слои `src/`: `app → pages → widgets → features → entities → shared`. Импорт только вниз; слайсы одного слоя друг друга не импортируют; снаружи слайса — только через его `index.ts`. Исключения: `import type` стора из `app/providers/store` в `shared/lib/hooks`; вход для мок-сервера `<slice>/mocks.ts` (импортирует только `app/providers/mocks`); кросс-импорт сущностей — только через FSD `@x` (`entities/newsIssue/@x/newsArticle.ts`).

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
<slice>/api/mocks.ts        MSW-обработчики (данные — из @wine/demo-data); наружу — через <slice>/mocks.ts
<slice>/model/types.ts      типы (доменные — алиасы на схемы контракта через ApiSchemas из shared/api)
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
- Данные — только через API, контракт сначала: эндпоинт описывается в `packages/contracts/openapi/openapi.yaml` → `pnpm contracts:gen` (типы `paths` для фронта, zod-схемы для сервисов) → RTK Query в слайсе (`baseApi.injectEndpoints`) → MSW-обработчик с данными из `@wine/demo-data`. Бэкенда пока нет; он реализует этот контракт, поэтому компоненты не знают про моки (`VITE_API_MOCKS`).
- Статичный контент вёрстки (слайды hero, истории главной) — константы в `model/mock.ts`, не API.
- Клиентское состояние: корзина, режим вина, 18+ — Redux-слайсы, персист в `localStorage`. Сессия — httpOnly-cookie бэкенда + `GET /auth/session`, токены в `localStorage` не храним. Фильтры, сортировка, поиск, вкладки — в URL. Остальное — локальный state.
- Пути — константы из `shared/config/routes.ts`, не строки.
- Каждый виджет — сразу десктоп (по артборду 1920) и мобильная раскладка (по `M*`-артборду). Брейкпоинт — `lg` (1024). Лёгкие блоки переключаем классами `lg:`, тяжёлые арт-секции — разными компонентами через `useMediaQuery(MEDIA.desktop)`.
- Внутренние страницы: обёртка `relative isolate` + `PageBackground` из `uikit;/` (доски и виньетка), отступ сверху под фиксированную шапку (`pt-22 lg:pt-42`). Новые страницы подключаются в роутер через `lazy`.
- Арт-секции, нарисованные на 1920 в абсолютных координатах: родитель `@container`, координаты — `stage(px)`, кегли — `stageFont(px, min)` из `shared/lib/stage`. Модалки и шторки — только через `Modal`/`Drawer`/`Overlay` из `uikit;/` (портал, фокус, Esc, блокировка скролла).
- Плейсхолдеры дизайна (`[цена] ₽`, `[адрес]`, `[N]`) не выдумываем — оставляем плейсхолдерами в моках/конфиге.
- Подпись «Ripped PNGs by Vecteezy» в футере обязательна (лицензия на рваную бумагу).
- Инфраструктура и инструменты: выбирать актуальные современные решения, но проверять, что они работают для аудитории в России (Vercel, Netlify и Cloudflare там нестабильны).

## Бэкенд (планируется)

Микросервисы на NestJS 12 (Fastify, ESM) + PostgreSQL 18 + Prisma 7, gRPC внутри, NATS JetStream для событий, Traefik на входе. Правила — [docs/backend-architecture.md](docs/backend-architecture.md), этапы и модель данных — [docs/backend-plan.md](docs/backend-plan.md). Перед любой работой с бэкендом читать оба файла. Главное:

- Сервис = ограниченный контекст со своей базой. Сервисы не импортируют друг друга и не ходят в чужие базы.
- Все контракты — в `packages/contracts` (`@wine/contracts`): OpenAPI публичного API, proto внутренних gRPC, схемы событий (CloudEvents). Изменения — только обратно совместимые, проверяются в CI.
- Синхронно — один шаг пакетного gRPC-вызова с дедлайном и деградацией; всё остальное — события через outbox/inbox.
- Каждый HTTP-обработчик объявляет схему входа (`@Body({ schema })`, `@Query({ schema })`) и выхода (`@ContractResponse(schema)` из `@wine/service-kit`, не голый `@SerializeOptions` — он ломается на массивах) из `@wine/contracts/openapi/zod`. Владелец каждой операции — в `OPERATION_OWNERS` (`@wine/contracts/openapi/ownership`); тест сервиса проверяет, что все его операции реализованы.
- Шаблон сервиса — `services/identity`, сервиса с базой — `services/catalog` (Prisma 7.10, миграции `pnpm --filter @wine/catalog db:migrate`, сид из `@wine/demo-data`, тесты на Testcontainers — миграции через `migrateDatabase` из `@wine/service-kit/testing`, gRPC). Внутренние API — proto в `packages/contracts/proto` (`pnpm contracts:gen` генерирует и их; `proto:lint`, `proto:breaking`). Postgres из Compose — на порту хоста 55432. Команды: `pnpm test` (все тесты), `pnpm test:e2e` (сквозные через шлюз, нужен `backend:up`), `pnpm backend:up` / `backend:down` (Compose: Traefik на :18080, Postgres, NATS), `pnpm backend:up:observability` (+ Grafana на :3001). Модерация писем — `docker compose exec reviews node dist/cli.js list | publish | reject`, сессия для разработки — `docker compose exec identity node dist/cli.js session:issue --name "Имя"`, код входа по телефону — в `docker compose logs identity` (SMS-провайдера нет), ячейка гостю — `docker compose exec cellar node dist/cli.js lease:assign --user <id> --cell 204 --until 2027-10-16 --demo`, оплата сертификата — `docker compose exec requests node dist/cli.js certificate:pay WB-2026-000001` (всё — из `deploy/compose`). Кабинет — пути `/api/me/*` с `require-session`; формы, чьи записи видны в кабинете, — через `optional-session`. Защищённый путь — middleware `require-session` в `deploy/traefik/dynamic.yml`, пользователь в сервисе — `@CurrentUser()`.
- Версии Prisma фиксировать точно: npm-тег `latest` у `prisma` указывает на 8.0 RC.
