# Premium Wine Boutique

Сайт винного бутика: редкие вина из частных коллекций, собственные виноградники и погреба, бронь бутылок и самовывоз. Портфолио-проект.

React 19 · Vite 7 · TypeScript · Tailwind CSS v4 · motion · Redux Toolkit + RTK Query · react-router 7 · MSW. Архитектура — Feature-Sliced Design.

- Дизайн: [канвас Wine Boutique](https://claude.ai/artifact/G57VXkJRvN2HVSHm65Q2Ua) (десктоп 1920 и мобильные 390).
- План работ, карта маршрутов, токены и принятые решения: [docs/implementation-plan.md](docs/implementation-plan.md).
- Правила кода: [CLAUDE.md](CLAUDE.md).

## Запуск

Нужны Node ≥ 22.12 и pnpm (версия закреплена в `packageManager`, проще всего — `corepack enable`).

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # проверка типов + сборка в dist/
pnpm lint
pnpm preview      # посмотреть собранный dist/
```

## Данные и API

Бэкенда пока нет. Контракт API описан в [api/openapi.yaml](api/openapi.yaml) — это же ТЗ для будущего бэкенда. Фронтенд ходит в API через RTK Query, а ответы пока отдаёт MSW (Mock Service Worker) прямо в браузере.

- `VITE_API_MOCKS=true` (по умолчанию, см. `.env`) — запросы к `VITE_API_URL` обслуживает MSW.
- После правки контракта: `pnpm api:types` перегенерирует типы в `src/shared/api/schema.ts`.
- Когда бэкенд будет готов: `VITE_API_MOCKS=false` и `VITE_API_URL=<адрес API>`. Сессия — httpOnly-cookie сервера, запросы идут с `credentials: include`.

Локальные переопределения — в `.env.local` (не коммитится).

## Картинки

Только WebP в `public/images`. Новую картинку конвертировать скриптом:

```bash
node scripts/optimize-image.mjs <исходник> public/images/<папка>/<имя>.webp [макс. ширина] [качество]
```

## Docker

Образ: сборка на `node:24-alpine`, раздача статики — `nginx-unprivileged` (без root, порт **8080**). Конфиг nginx — [deploy/nginx](deploy/nginx): SPA-фолбэк на `index.html`, вечный кэш для `/assets/*`, gzip, заголовки безопасности (CSP и др.).

```bash
docker build -t wine-boutique .
docker run --rm -p 8080:8080 wine-boutique   # http://localhost:8080
```

С настоящим API:

```bash
docker build --build-arg VITE_API_MOCKS=false --build-arg VITE_API_URL=https://api.example.ru -t wine-boutique .
```

Если API будет на другом домене, добавьте его в `connect-src` в [deploy/nginx/security-headers.conf](deploy/nginx/security-headers.conf).

## CI

[GitHub Actions](.github/workflows/ci.yml) на каждый push: `pnpm lint`, `pnpm typecheck`, `pnpm build`, затем сборка Docker-образа и смоук-тест контейнера (главная и прямой заход на вложенный путь отдают приложение). Деплоя в Actions нет — его делает хостинг.

## Деплой

Зарубежные платформы для фронтенда (Vercel, Netlify, Cloudflare) из России работают нестабильно, поэтому сайт собирается в переносимый Docker-образ и размещается у российского облачного провайдера.

**По умолчанию — Timeweb Cloud Apps** (автодеплой из GitHub):

1. Создать приложение из репозитория `THE-G0OSE/wine-boutique`, ветка `main`, способ сборки — Dockerfile.
2. Порт приложения — `8080`.
3. При необходимости задать аргументы сборки `VITE_API_URL` / `VITE_API_MOCKS`.
4. Подключить домен и HTTPS в панели провайдера.

**Запасной вариант — Yandex Cloud Serverless Containers:** собрать образ, загрузить в Container Registry и создать ревизию контейнера с портом `8080`.

Регистрация и оплата аккаунта у провайдера — на владельце проекта.

## Лицензии и благодарности

Шрифты Pacifico, Shantell Sans, Noto Sans — SIL Open Font License (через fontsource). Фото рваной бумаги: [Ripped PNGs by Vecteezy](https://www.vecteezy.com/free-png/ripped).
