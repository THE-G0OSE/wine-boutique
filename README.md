# Premium Wine Boutique

Сайт винного бутика: редкие вина из частных коллекций, собственные виноградники и погреба, бронь бутылок и самовывоз. Портфолио-проект.

React 19 · Vite 7 · TypeScript · Tailwind CSS v4 · motion · Redux Toolkit + RTK Query · react-router 7 · MSW. Архитектура — Feature-Sliced Design.

- Дизайн: [канвас Wine Boutique](https://claude.ai/artifact/G57VXkJRvN2HVSHm65Q2Ua) (десктоп 1920 и мобильные 390).
- План работ, карта маршрутов, токены и принятые решения: [docs/implementation-plan.md](docs/implementation-plan.md).
- Правила кода: [CLAUDE.md](CLAUDE.md). Бэкенд: [план](docs/backend-plan.md) и [архитектура](docs/backend-architecture.md).

Монорепозиторий pnpm:

| Папка | Что |
|---|---|
| `apps/web` | Фронтенд |
| `packages/contracts` | `@wine/contracts` — контракт API (`openapi/openapi.yaml`) и сгенерированные из него типы и zod-схемы |
| `packages/demo-data` | `@wine/demo-data` — данные из макетов: моки MSW, позже сиды бэкенда |
| `packages/service-kit` | `@wine/service-kit` — общая техника сервисов: конфиг, логи, ошибки и валидация по контракту, health, запуск |
| `services/*` | Микросервисы бэкенда: `catalog`, `news`, `reviews`, `newsletter`, `identity`, `reservations`, `tastings`, `cellar` |
| `tests/e2e` | Сквозные тесты через шлюз |
| `deploy` | Compose (разработка и VPS), маршруты Traefik, скрипт выкатки |

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

Контракт API описан в [packages/contracts/openapi/openapi.yaml](packages/contracts/openapi/openapi.yaml) — его реализуют сервисы бэкенда. Фронтенд ходит в API через RTK Query; без бэкенда ответы отдаёт MSW (Mock Service Worker) прямо в браузере.

- `VITE_API_MOCKS=true` (по умолчанию, см. `apps/web/.env`) — запросы к `VITE_API_URL` обслуживает MSW.
- После правки контракта: `pnpm contracts:gen` перегенерирует типы и zod-схемы в `packages/contracts/openapi/generated` (их коммитим, CI проверяет актуальность).
- Данные для моков — в `@wine/demo-data`, их же возьмут сиды бэкенда.
- С бэкендом: `VITE_API_MOCKS=false` (локально `/api` проксируется в Traefik, см. ниже). Сессия — httpOnly-cookie сервера, запросы идут с `credentials: include`.

Локальные переопределения — в `apps/web/.env.local` (не коммитится).

## Картинки

Только WebP в `apps/web/public/images`. Новую картинку конвертировать скриптом:

```bash
node apps/web/scripts/optimize-image.mjs <исходник> apps/web/public/images/<папка>/<имя>.webp [макс. ширина] [качество]
```

## Деплой — GitHub Pages

Фронт выкладывается на GitHub Pages из `main` ([ci.yml](.github/workflows/ci.yml), job «Деплой на GitHub Pages»): адрес — `https://the-g0ose.github.io/wine-boutique/`. Пока в репозитории не задана переменная `API_URL`, данные — моки MSW прямо в браузере.

- Один раз включить: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
- Сайт живёт в подпапке, поэтому сборка для Pages идёт с `BASE_PATH=/wine-boutique/`: Vite подставляет base в ассеты, роутер — в адреса, картинки из `public/` берутся через `asset()` из `shared/lib`. Локально `BASE_PATH` не задаётся — сайт на `/`.
- У Pages нет SPA-фолбэка: CI копирует `index.html` в `404.html`, и прямой заход на `/wine-boutique/news/archive` открывает приложение (со статусом 404 — ограничение Pages).
- Заголовки Pages настроить нельзя, поэтому CSP и Referrer-Policy — мета-тегами, которые вставляет сборка ([vite.config.ts](apps/web/vite.config.ts)). Если `VITE_API_URL` — адрес на другом домене, он сам попадает в `connect-src`.

Фронт на настоящем API — переменные репозитория (**Settings → Secrets and variables → Actions → Variables**): `API_URL=https://api.<домен>/api`, и при своём домене у Pages — `PAGES_BASE_PATH=/`. Свой домен нужен для входа: фронт на `*.github.io` и API на другом сайте — браузеры режут такие cookie.

## Бэкенд

Микросервисы на NestJS 12 в `services/*`, общая техника — `packages/service-kit`, шлюз — Traefik, база — PostgreSQL 18 (своя у каждого сервиса), события — NATS JetStream. Нужен запущенный Docker.

```bash
pnpm test                       # тесты всех пакетов и сервисов (сервисы — на настоящем Postgres в Testcontainers)
pnpm backend:up                 # Postgres, NATS, Traefik и сервисы; API — http://localhost:18080/api
pnpm test:e2e                   # сквозные тесты через шлюз (нужен backend:up)
pnpm backend:up:observability   # то же + Grafana с трейсами и метриками на http://localhost:3001
pnpm backend:down
```

Фронт на настоящем API: `VITE_API_MOCKS=false` в `apps/web/.env.local`, затем `pnpm dev` — запросы `/api` проксируются в Traefik.

Команды в контейнерах (из `deploy/compose`):

```bash
docker compose exec reviews node dist/cli.js list                                   # письма на модерации
docker compose exec reviews node dist/cli.js publish <id> --topic tasting --greeting "Дорогая команда!" --signature "Анна"
docker compose exec identity node dist/cli.js session:issue --name "Анна Кузнецова"  # сессия для разработки
```

## Выкатка бэкенда на VPS

Docker Compose на VPS у российского провайдера (от 4 vCPU, 8 ГБ RAM): Traefik с TLS от Let's Encrypt, сервисы, Postgres, NATS. Конфигурация — [compose.yaml](deploy/compose/compose.yaml) + [compose.prod.yaml](deploy/compose/compose.prod.yaml).

Один раз на VPS:

1. Docker Engine с плагином Compose; зеркало Docker Hub провайдера в `/etc/docker/daemon.json` (`registry-mirrors`) — Docker Hub из России нестабилен.
2. DNS: A-запись `api.<домен>` на IP VPS; открыть порты 80 и 443.
3. `git clone https://github.com/THE-G0OSE/wine-boutique.git /opt/wine-boutique/app`
4. `/opt/wine-boutique/.env` по образцу [deploy/vps/.env.example](deploy/vps/.env.example), `chmod 600`. Первая выкатка — с `SEED=true` (демо-данные), потом `false`.

Выкатка и откат — с машины разработчика по SSH:

```bash
deploy/vps/deploy.sh <ssh-хост>                 # origin/main
deploy/vps/deploy.sh <ssh-хост> <тег-или-хеш>   # откат: образы этого коммита уже собраны
deploy/vps/deploy.sh <ssh-хост> origin/main --observability   # + Grafana: ssh -L 3001:127.0.0.1:3001 <ssh-хост>
```

Образы собираются на VPS с тегом коммита, миграции выполняются одноразовыми контейнерами перед стартом сервисов. Бэкапы базы (WAL-G в S3 провайдера) — следующий шаг, когда будет хранилище.

## CI

[GitHub Actions](.github/workflows/ci.yml) на каждый push: актуальность сгенерированного из контракта, `pnpm lint`, `pnpm typecheck`, сборка под Pages. На `main` — ещё и выкладка на Pages. Бэкенд в CI пока не участвует: `pnpm test` и `pnpm test:e2e` — локально перед пушем.

## Лицензии и благодарности

Шрифты Pacifico, Shantell Sans, Noto Sans — SIL Open Font License (через fontsource). Фото рваной бумаги: [Ripped PNGs by Vecteezy](https://www.vecteezy.com/free-png/ripped).
