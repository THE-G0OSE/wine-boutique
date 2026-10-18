# Premium Wine Boutique

Сайт винного бутика: редкие вина из частных коллекций, собственные виноградники и погреба, бронь бутылок и самовывоз. Портфолио-проект.

React 19 · Vite 7 · TypeScript · Tailwind CSS v4 · motion · Redux Toolkit + RTK Query · react-router 7 · MSW. Архитектура — Feature-Sliced Design.

- Дизайн: [канвас Wine Boutique](https://claude.ai/artifact/G57VXkJRvN2HVSHm65Q2Ua) (десктоп 1920 и мобильные 390).
- План работ, карта маршрутов, токены и принятые решения: [docs/implementation-plan.md](docs/implementation-plan.md).
- Правила кода: [CLAUDE.md](CLAUDE.md). Бэкенд (в планах): [docs/backend-plan.md](docs/backend-plan.md).

Монорепозиторий pnpm:

| Папка | Что |
|---|---|
| `apps/web` | Фронтенд |
| `packages/contracts` | `@wine/contracts` — контракт API (`openapi/openapi.yaml`) и сгенерированные из него типы и zod-схемы |
| `packages/demo-data` | `@wine/demo-data` — данные из макетов: моки MSW, позже сиды бэкенда |

## Запуск

Нужны Node ≥ 22.12 и pnpm (версия закреплена в `packageManager`, проще всего — `corepack enable`).

```bash
pnpm install
pnpm dev          # фронт: http://localhost:5173
pnpm build        # проверка типов + сборка (фронт — в apps/web/dist/)
pnpm lint
pnpm typecheck
pnpm --filter @wine/web preview   # посмотреть собранный фронт
```

## Данные и API

Бэкенда пока нет. Контракт API описан в [packages/contracts/openapi/openapi.yaml](packages/contracts/openapi/openapi.yaml) — это же ТЗ для будущего бэкенда. Фронтенд ходит в API через RTK Query, а ответы пока отдаёт MSW (Mock Service Worker) прямо в браузере.

- `VITE_API_MOCKS=true` (по умолчанию, см. `apps/web/.env`) — запросы к `VITE_API_URL` обслуживает MSW.
- После правки контракта: `pnpm contracts:gen` перегенерирует типы и zod-схемы в `packages/contracts/openapi/generated` (их коммитим, CI проверяет актуальность).
- Данные для моков — в `@wine/demo-data`, их же возьмут сиды бэкенда.
- Когда бэкенд будет готов: `VITE_API_MOCKS=false` и `VITE_API_URL=<адрес API>`. Сессия — httpOnly-cookie сервера, запросы идут с `credentials: include`.

Локальные переопределения — в `apps/web/.env.local` (не коммитится).

## Картинки

Только WebP в `apps/web/public/images`. Новую картинку конвертировать скриптом:

```bash
node apps/web/scripts/optimize-image.mjs <исходник> apps/web/public/images/<папка>/<имя>.webp [макс. ширина] [качество]
```

## Деплой — GitHub Pages

Фронт выкладывается на GitHub Pages из `main` ([ci.yml](.github/workflows/ci.yml), job «Деплой на GitHub Pages»): адрес — `https://the-g0ose.github.io/wine-boutique/`. Данные — моки MSW прямо в браузере, бэкенд не нужен.

- Один раз включить: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
- Сайт живёт в подпапке, поэтому сборка для Pages идёт с `BASE_PATH=/wine-boutique/`: Vite подставляет base в ассеты, роутер — в адреса, картинки из `public/` берутся через `asset()` из `shared/lib`. Локально `BASE_PATH` не задаётся — сайт на `/`.
- У Pages нет SPA-фолбэка: CI копирует `index.html` в `404.html`, и прямой заход на `/wine-boutique/news/archive` открывает приложение (со статусом 404 — ограничение Pages).
- Заголовки Pages настроить нельзя, поэтому CSP и Referrer-Policy — мета-тегами, которые вставляет сборка ([vite.config.ts](apps/web/vite.config.ts)). Если `VITE_API_URL` — адрес на другом домене, он сам попадает в `connect-src`.

Бэкенд в CI пока не участвует: он будет разворачиваться на VPS (см. [docs/backend-plan.md](docs/backend-plan.md)).

## CI

[GitHub Actions](.github/workflows/ci.yml) на каждый push: актуальность сгенерированного из контракта, `pnpm lint`, `pnpm typecheck`, сборка под Pages. На `main` — ещё и выкладка на Pages.

## Лицензии и благодарности

Шрифты Pacifico, Shantell Sans, Noto Sans — SIL Open Font License (через fontsource). Фото рваной бумаги: [Ripped PNGs by Vecteezy](https://www.vecteezy.com/free-png/ripped).
