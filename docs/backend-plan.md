# План бэкенда

Бэкенд на NestJS для того, что фронт уже умеет: каталог, сорта винограда, газета, отзывы, подписка, сессия. Правила, по которым он пишется, — в [backend-architecture.md](backend-architecture.md). План фронта — [implementation-plan.md](implementation-plan.md).

## 1. Цель и границы

**Входит** — все эндпоинты текущего контракта, с данными в Postgres вместо MSW:

| Эндпоинт | Что отдаёт |
|---|---|
| `GET /wines?category&sort&limit&offset` | Вина для полок и каталога погреба |
| `GET /grapes` | Сорта с плантаций и до трёх вин из каждого |
| `GET /auth/session` | Пока всегда гость (`user: null`) |
| `GET /news/issues/latest` | Свежий выпуск газеты целиком |
| `GET /news/articles/{slug}` | Статья, её выпуск, «Ещё вырезки», вино для стикера |
| `GET /news/archive?month&rubric` | Подшивка: месяцы со счётчиками и первые полосы |
| `POST /newsletter` | Подписка на анонсы (204, повтор — тоже 204) |
| `GET /reviews?limit&offset` | Опубликованные письма гостей |
| `POST /reviews` | Новое письмо — на модерацию (202) |

Плюс всё, без чего это нельзя выкатить: монорепозиторий, общий пакет контракта, каркас приложения, CI, Docker, деплой рядом с фронтом.

**Не входит** — то, чего ещё нет во фронте: полный вход по телефону, бронь, кабинет, услуги, поиск, фильтры с фасетами. Модули для них заложены в карте (§2.2), их делают вместе с соответствующими фазами фронта. Админки тоже пока нет: данные — из сидов, письма модерируются CLI-командой (§4, этап B4).

## 2. Модули

### 2.1 Сейчас

| Модуль | Схема БД | Эндпоинты | Публичный фасад | Зависит от | События |
|---|---|---|---|---|---|
| `catalog` | `catalog` | `GET /wines` | `CatalogApi.getWineSummaries({ ids })`, `findWineIdsBySlugs(slugs)` (для сидов и будущей админки) | — | `catalog.wine-changed.v1` — когда появятся подписчики с копиями данных |
| `grapes` | `grapes` | `GET /grapes` | — | `catalog` (вина сорта) | — |
| `news` | `news` | `GET /news/issues/latest`, `GET /news/articles/{slug}`, `GET /news/archive` | — | `catalog` (вино для стикера «Забронировать») | — |
| `reviews` | `reviews` | `GET /reviews`, `POST /reviews` | — | — | `reviews.letter-received.v1` — с появлением уведомлений сомелье |
| `newsletter` | `newsletter` | `POST /newsletter` | — | — | `newsletter.subscribed.v1` — с появлением рассылки |
| `identity` | `identity` | `GET /auth/session` | `IdentityApi.resolveSession(token)` — для guard'ов кабинета | — | — |

Граф зависимостей: `grapes → catalog`, `news → catalog`. Остальные модули независимы.

### 2.2 Дальше (вместе с фазами фронта)

| Фаза фронта | Модули бэкенда |
|---|---|
| 3 · Каталог | `catalog` растёт: полки, фасеты, карточка вина, поиск (Postgres FTS с русской конфигурацией + `pg_trgm` для подсказок) |
| 4 · Бронь и самовывоз | `boutiques` (бутики, слоты), `reservations` (бронь; читает цены и наличие через `CatalogApi`, публикует `reservations.reserved.v1`) |
| 5 · Газета | В `news` — редакторские сценарии. Афиша выпуска начнёт браться из `tastings` через его фасад |
| 6 · Услуги | `tastings` (события, записи, лист ожидания), `cellarStorage` (ячейки), `requests` (заявки: зал, подарки, сертификаты), `subscriptions` («Набор месяца») |
| 8 · Кабинет | `identity` (телефон + код, сессии), `loyalty` (бонусы, уровни), `favorites`; `notifications` (SMS и email по событиям других модулей) |
| — · Контент | Админка или headless CMS — отдельное решение (§6) |

## 3. Модель данных

Поля — в терминах Prisma (camelCase), в БД — snake_case. У всех таблиц есть `id uuid` (v7), `createdAt` и `updatedAt`, если не сказано иное.

### `catalog`

- **Wine:** `slug` (уник.), `name`, `categories WineCategory[]` (вино может стоять на нескольких полках), `region`, `country?`, `grapes String[]` (названия для карточки, как в контракте), `volumeMl Int` (в API — «0,75 л»), `vintage Int?`, `cellaredAt Date?` (в API — `cellarYears`, считается на лету), `priceKopecks Int?` (в API — рубли), `imageUrl`, `popularityRank Int` (сортировка `popular`), `arrivedAt Timestamptz` (сортировка `new`).
- Индексы: GIN по `categories`, B-tree по `priceKopecks`, `vintage`, `arrivedAt`, `popularityRank`.
- Сортировки `price_*` и `vintage_asc` — с `NULLS LAST`, как в моке.

### `grapes`

- **GrapeVariety:** `slug` (уник.), `name`, `type` (red | white), `origin`, `taste`, `harvest`, `description`, `plantation?`, `imageUrl`, `position`.
- **GrapeVarietyWine:** `varietyId` → GrapeVariety, `wineId uuid` (ссылка на `catalog` без внешнего ключа), `position` (не больше трёх на сорт).
- `GET /grapes` = сорта + один вызов `CatalogApi.getWineSummaries({ ids })` на все вина сразу. Вино, которого больше нет в каталоге, молча пропускается.

### `news`

- **Issue:** `number Int?` (уник., `null` — ещё не присвоен), `publishedAt Date` (уник.), `status` (draft | published), `city`, `weather`, `quoteText`, `quoteAuthor`, `nextIssueTeaser`.
- **Article:** `issueId`, `slug` (уник.), `placement` (lead | second_wide | second_column | archive), `rubric`, `kicker`, `title`, `standfirst?`, `byline?`, `readingMinutes?`, `imageSrc?` / `imageAlt?` / `imageCaption?`, `body String[]` (абзацы), `pullQuoteText?` / `pullQuoteAfterParagraph?`, `relatedWineId uuid?` (ссылка на `catalog`), `eventStartsAt?`, `eventSeats?`.
- **Brief**, **Ad**, **AfishaItem** — строки выпуска с `issueId` и `position`, поля как в контракте.
- Производные значения не храним: первая полоса в подшивке — это `lead`-статья выпуска, месяцы со счётчиками — `GROUP BY date_trunc('month', published_at)`, `previousIssueId` / `nextIssueId` — соседи по дате, «Ещё вырезки» — три свежие статьи, кроме текущей.
- `relatedWine { slug, name }` — через `CatalogApi.getWineSummaries`. Если вина нет — `null`, статья не ломается.

### `reviews`

- **Letter:** `authorName`, `city?`, `text` (что прислал гость), `status` (pending | published | rejected), `receivedAt`, `publishedAt?` и редакторские поля, которые заполняет модератор при публикации: `topic?`, `greeting?`, `postscript?`, `signature?`.
- Доменное правило: опубликовать письмо можно только с темой, обращением и подписью — они обязательны в контракте `Review`.
- `GET /reviews` — только `published`, от свежих к старым. `POST /reviews` создаёт `pending`.

### `newsletter`

- **Subscription:** `email citext` (уник.), `status` (active | unsubscribed), `source` (`footer`), `consentAt`, `consentVersion`.
- Повторная подписка того же адреса — 204 без дубля и без раскрытия, был ли адрес в базе.

### `identity`

- Таблиц пока нет: эндпоинт отвечает «гость». В этапе B5 готовится инфраструктура cookie-сессий. Таблицы `User`, `Session` (хеш токена, срок, ротация), `PhoneCode` — вместе с фазой 8 фронта.

### Общее для модулей с событиями

- **OutboxMessage** (в схеме модуля-издателя): `type`, `payload Json`, `occurredAt`, `publishedAt?`.
- **InboxMessage** (в схеме модуля-подписчика): `eventId`, `handler`, `processedAt`.

## 4. Этапы

Каждый этап — отдельный PR с зелёным CI. Этап считается сделанным, когда выполнено «Готово, когда».

### B0 · Монорепозиторий и пакет контракта

1. Перенести фронт в `apps/web` (`git mv`, история сохраняется), корневой `package.json` — только скрипты и общие dev-зависимости, `pnpm-workspace.yaml` — `apps/*`, `packages/*`.
2. `packages/api-contract`: перенести `api/openapi.yaml`; скрипт `api:gen` — `openapi-typescript` (типы `paths` для фронта и openapi-msw) и `@hey-api/openapi-ts` с плагином zod (схемы запросов и ответов для бэка). Фронт импортирует типы из пакета, `src/shared/api/schema.ts` становится реэкспортом.
3. `packages/demo-data`: перенести фикстуры из `entities/*/api/fixtures.ts`, типизированные схемами контракта. MSW-обработчики фронта импортируют их оттуда.
4. Выровнять TypeScript на 6.0 во всём репозитории (фронт сейчас на 5.9).
5. Обновить Dockerfile фронта, CI (пути, фильтры pnpm), README, CLAUDE.md.

**Готово, когда:** фронт собирается и работает как раньше (MSW, все страницы), Docker-образ фронта проходит смоук-тест, CI зелёный, `pnpm api:gen` не даёт изменений.

### B1 · Каркас API

1. `apps/api`: NestJS 12 (ESM) на Fastify, `platform/`: конфиг (zod), логи (pino, request id, маскирование ПДн), фильтр ошибок в формате контракта, глобальные `StandardSchemaValidationPipe` (тело — 422, query и path — 400) и `StandardSchemaSerializerInterceptor`, helmet, throttler, cookies, health, корректное завершение.
2. Инфраструктура данных: базовый класс Prisma-клиента модуля (адаптер pg, пул из конфига), скрипты `db:generate`, `db:migrate`, `db:migrate:deploy`, `db:seed`, которые проходят по всем модулям.
3. Проверки архитектуры: `eslint-plugin-boundaries` (правила §4.3 архитектуры), `dependency-cruiser` (без циклов, граф модулей артефактом CI), тест покрытия контракта (сначала всё «не реализовано» и помечено как ожидаемое).
4. Тестовый стенд: фабрика приложения для e2e, Testcontainers с `postgres:18-alpine`, миграции и сиды перед набором тестов.
5. `deploy/docker-compose.yml` для разработки (Postgres 18 + API), `apps/api/Dockerfile`, `.env.example`.
6. CI: job `api` — lint, typecheck, unit, интеграционные и e2e-тесты, сборка образа и смоук `/api/health/ready` с Postgres в service-контейнере. Job `contract` — `api:gen` + `git diff`, `oasdiff breaking` против `main`.
7. Scalar с документацией по `openapi.yaml` на `/api/docs` — только вне продакшена.

**Готово, когда:** `docker compose up` поднимает API и БД, `/api/health/ready` отвечает 200, пробный пустой модуль проходит правила границ, а намеренно добавленный глубокий импорт роняет линтер.

### B2 · Каталог и виноградники

1. Модуль `catalog`: модель, миграция, сид из демо-данных, `GET /wines` (фильтр, сортировки с `NULLS LAST`, пагинация), фасад `CatalogApi`.
2. Модуль `grapes`: модель, миграция, сид (вина — через `CatalogApi.findWineIdsBySlugs`), `GET /grapes` с пакетным дочитыванием вин.
3. Интеграционные тесты репозиториев, e2e-тесты с проверкой ответов по схемам контракта.

**Готово, когда:** фронт с `VITE_API_MOCKS=false` показывает полки, каталог погреба и виноградники так же, как на моках.

### B3 · Газета

1. Модуль `news`: модель, миграции, сид всех выпусков и статей из демо-данных.
2. `GET /news/issues/latest`, `GET /news/articles/{slug}` (404 в формате контракта), `GET /news/archive` (месяц по умолчанию — свежий, фильтр рубрики, счётчики без учёта фильтра).
3. Вино для стикера — через `CatalogApi`.

**Готово, когда:** газета, статьи (включая 404) и подшивка на реальном API совпадают с моками, e2e покрывают фильтры подшивки.

### B4 · Формы: письма и подписка

1. Модуль `reviews`: `GET /reviews` (опубликованные), `POST /reviews` (pending, 202, ошибки 422 по контракту), доменное правило публикации, CLI-команды модерации `reviews:list-pending`, `reviews:publish`, `reviews:reject` (до появления админки).
2. Модуль `newsletter`: `POST /newsletter` — идемпотентная подписка, 204.
3. Ограничение частоты на обе формы, маскирование ПДн в логах, согласия (если решим вопрос в §6).

**Готово, когда:** письмо с сайта попадает в БД как pending, после `reviews:publish` появляется в ленте; повторная подписка не создаёт дубль; частые запросы получают 429.

### B5 · Сессия

1. Модуль `identity`: `GET /auth/session` → гость.
2. В `platform/http`: cookie `__Host-` сессии, проверка `Origin` для мутирующих запросов, guard «нужен вход» — готовые к фазе 8.

**Готово, когда:** контракт полностью реализован (тест покрытия без исключений), архитектурные проверки зелёные.

### B6 · Интеграция и выкатка

1. Разработка: в Vite — `server.proxy` `/api` → `localhost:3000`. `pnpm dev` в корне запускает фронт и API, `VITE_API_MOCKS=false` — через `.env.local`. MSW остаётся для работы без бэкенда и для тестов фронта.
2. nginx фронта: `location /api/` проксирует на `API_UPSTREAM` (шаблон nginx + переменная окружения), заголовки `X-Request-Id` и `X-Forwarded-*`.
3. Прод: второе приложение (API) у того же провайдера, управляемый PostgreSQL 18 с бэкапами, миграции шагом релиза, сиды — один раз при первом запуске. Фронт собирается с `VITE_API_MOCKS=false`.
4. README: локальный запуск и деплой обеих частей.

**Готово, когда:** прод-сайт работает на реальном API, F5 на любом маршруте и все формы работают, откат на предыдущую версию — одной кнопкой у провайдера.

## 5. Принятые решения

| Вопрос | Решение | Отвергнуто и почему |
|---|---|---|
| Где живёт бэкенд | Монорепозиторий pnpm: `apps/web`, `apps/api`, `packages/*` | Отдельный репозиторий — контракт и демо-данные пришлось бы синхронизировать вручную |
| HTTP-адаптер | Fastify | Express — медленнее, преимуществ для API без серверного рендера нет |
| Валидация | Zod-схемы, сгенерированные из контракта, через встроенный в Nest 12 Standard Schema | class-validator — второе описание тех же структур руками, рассинхрон с контрактом неизбежен |
| Документация API | Scalar по готовому `openapi.yaml` | `@nestjs/swagger` — генерация контракта из кода, обратное направлению «контракт сначала» |
| Данные модулей | Схема Postgres и Prisma-клиент на модуль | Одна схема Prisma с `@@schema` — один клиент видит все таблицы, изоляция держится только на дисциплине |
| Версия Prisma | 7.10 (стабильная), точная версия | 8 — RC; переход после GA и первого патча, по официальному гайду, изменения закрыты репозиториями модулей |
| TypeScript | 6.0 | 7 — Nest CLI и typescript-eslint его ещё не поддерживают |
| Межмодульные события | Outbox в Postgres + шина в процессе | Брокер сейчас — лишний сервис для одного процесса. `EventEmitter` без outbox — события теряются при падении между коммитом и отправкой |
| Сессии | Серверные, токен в httpOnly-cookie, в БД — хеш | JWT — сложно отзывать, а сервису с одним доменом не нужен |
| Фоновые задачи | Пока не нужны. Понадобятся (рассылки, напоминания о брони) — очередь на Postgres (pg-boss), без Redis | Redis/BullMQ — ещё один сервис в инфраструктуре ради малой нагрузки |
| Деньги | Целые копейки | `numeric`/float — ошибки округления и лишние преобразования |

## 6. Открытые вопросы

1. **Согласие на обработку ПДн (152-ФЗ).** Формы письма и подписки собирают имя, город и email без галочки согласия и ссылки на политику. Нужно добавить их во фронт и в контракт (`consent: true` и версия текста). Отдельно — согласие на публикацию письма: на странице написано «публикуем с разрешения автора». Без этого форму письма лучше не включать в проде.
2. **Кто наполняет контент.** Варианты: своя админка (модуль `backoffice` поверх фасадов модулей) или headless CMS. Пока данные — из сидов, письма модерируются CLI-командой.
3. **Хостинг.** По умолчанию — Timeweb Cloud: приложения из Dockerfile + управляемый PostgreSQL. Запасной вариант — Yandex Cloud (Serverless Containers + Managed PostgreSQL). Нужен аккаунт и оплата с твоей стороны, перед B6 — проверить, какие версии Postgres доступны у выбранного провайдера.
4. **Домен** — нужен для cookie `__Host-` и HTTPS в проде.
5. **Почта и SMS** — понадобятся с уведомлениями и входом: Yandex Cloud Postbox или Unisender Go, SMS — SMS.ru или МТС Exolve.

## 7. Риски

- **Prisma 8 выходит в октябре 2026.** Ветка 7 поддерживается 18 месяцев после выхода 8, так что спешить не нужно. Prisma используется только в `infrastructure/` модулей, поэтому переход локален.
- **Несколько Prisma-клиентов** — больше соединений и шагов генерации. Компенсируем пулом на модуль, общим скриптом и PgBouncer, если упрёмся в лимит.
- **Перенос фронта в `apps/web`** затрагивает Dockerfile, CI и настройки хостинга. Делается одним этапом B0, до первой строки бэкенда.
