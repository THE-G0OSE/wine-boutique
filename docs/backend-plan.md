# План бэкенда

Микросервисы на NestJS для того, что фронт уже умеет: каталог, сорта винограда, газета, отзывы, подписка, сессия. Правила — в [backend-architecture.md](backend-architecture.md), план фронта — [implementation-plan.md](implementation-plan.md).

## 1. Цель и границы

**Входит** — все эндпоинты текущего контракта, с данными в Postgres вместо MSW:

| Эндпоинт | Сервис |
|---|---|
| `GET /wines?category&sort&limit&offset` | `catalog` |
| `GET /grapes` | `catalog` |
| `GET /news/issues/latest`, `GET /news/articles/{slug}`, `GET /news/archive?month&rubric` | `news` |
| `GET /reviews?limit&offset`, `POST /reviews` (202 — на модерацию) | `reviews` |
| `POST /newsletter` (204, повтор — тоже 204) | `newsletter` |
| `GET /auth/session` (пока всегда гость) | `identity` |

Плюс инфраструктура, без которой микросервисы не выкатить: монорепозиторий, пакет контрактов, общий `service-kit`, шлюз, брокер, наблюдаемость, CI, деплой.

**Не входит** — то, чего ещё нет во фронте: вход по телефону, бронь, кабинет, услуги, поиск, фасеты. Сервисы для них — в §2.2, их делают вместе с фазами фронта. Админки пока нет: данные из сидов, письма модерируются CLI-командой.

## 2. Сервисы

### 2.1 Сейчас

| Сервис | База | Публичные пути (Traefik) | Внутренний gRPC | Ходит к | События |
|---|---|---|---|---|---|
| `catalog` | `catalog` | `/api/wines`, `/api/grapes` | `wine.catalog.v1.CatalogService`: `GetWineSummaries(ids)`, `ResolveWineSlugs(slugs)` | — | `catalog.wine-changed.v1` — когда появятся подписчики с копиями |
| `news` | `news` | `/api/news` | — | `catalog` (вино для стикера) | — |
| `reviews` | `reviews` | `/api/reviews` | — | — | `reviews.letter-received.v1` — с уведомлениями сомелье |
| `newsletter` | `newsletter` | `/api/newsletter` | — | — | `newsletter.subscribed.v1` — с рассылкой |
| `identity` | `identity` | `/api/auth` | `wine.identity.v1.IdentityService`: `ResolveSession(token)` (для forward-auth) | — | — |

Вина и сорта винограда — в одном сервисе: это одна предметная область (паспорт вина ссылается на сорта, сорт показывает свои вина), и они меняются вместе. Отдельный сервис для сортов дал бы лишний сетевой вызов на каждый `GET /grapes`.

Граф синхронных вызовов: `news → catalog`, Traefik → `identity` (forward-auth). Больше никто никого не вызывает.

### 2.2 Дальше (вместе с фазами фронта)

| Фаза фронта | Сервисы |
|---|---|
| 3 · Каталог | `catalog` растёт: полки, фасеты, карточка вина, поиск (Postgres FTS с русской конфигурацией + `pg_trgm`) |
| 4 · Бронь | `reservations` (бутики, слоты, бронь; цены и наличие — gRPC к `catalog`; сага с событиями `reservations.*`) |
| 6 · Услуги | `tastings` (события, записи, лист ожидания; афиша газеты будет браться отсюда), `cellar` (ячейки хранения), `requests` (заявки: зал, подарки, сертификаты, «Набор месяца») |
| 8 · Кабинет | `identity` (телефон + код, сессии), `loyalty` (бонусы, уровни, избранное), `notifications` (SMS и email по событиям других сервисов) |
| — · Контент | Админка или headless CMS — отдельное решение (§6) |

## 3. Модель данных

Поля — в терминах Prisma (camelCase), в БД — snake_case. У всех таблиц `id uuid` (v7), `createdAt`, `updatedAt`. В базе каждого сервиса с событиями — `outbox` (издатель) и `inbox` (подписчик).

### `catalog`

- **Wine:** `slug` (уник.), `name`, `categories WineCategory[]`, `region`, `country?`, `grapes String[]` (названия для карточки), `volumeMl Int` (в API — «0,75 л»), `vintage Int?`, `cellaredAt Date?` (в API — `cellarYears`), `priceKopecks Int?` (в API — рубли), `imageUrl`, `popularityRank Int` (сортировка `popular`), `arrivedAt` (сортировка `new`). Индексы: GIN по `categories`, B-tree по полям сортировки; сортировки по цене и году — `NULLS LAST`.
- **GrapeVariety:** `slug`, `name`, `type` (red | white), `origin`, `taste`, `harvest`, `description`, `plantation?`, `imageUrl`, `position`.
- **GrapeVarietyWine:** `varietyId`, `wineId` (внешние ключи — это одна база), `position` (не больше трёх).

### `news`

- **Issue:** `number Int?` (уник.), `publishedAt Date` (уник.), `status` (draft | published), `city`, `weather`, `quoteText`, `quoteAuthor`, `nextIssueTeaser`.
- **Article:** `issueId`, `slug` (уник.), `placement` (lead | second_wide | second_column | archive), `rubric`, `kicker`, `title`, `standfirst?`, `byline?`, `readingMinutes?`, `imageSrc?` / `imageAlt?` / `imageCaption?`, `body String[]`, `pullQuoteText?` / `pullQuoteAfterParagraph?`, `relatedWineId uuid?` (id вина в `catalog`, без внешнего ключа), `eventStartsAt?`, `eventSeats?`.
- **Brief**, **Ad**, **AfishaItem** — строки выпуска с `issueId` и `position`.
- Производное не храним: первая полоса подшивки — `lead`-статья, месяцы — `GROUP BY date_trunc('month', published_at)`, соседние выпуски — по дате, «Ещё вырезки» — три свежие статьи, кроме текущей.
- `relatedWine { slug, name }` — `CatalogService.GetWineSummaries` с дедлайном. `catalog` недоступен или вина нет → `relatedWine: null` (контракт это допускает), статья открывается.

### `reviews`

- **Letter:** `authorName`, `city?`, `text`, `status` (pending | published | rejected), `receivedAt`, `publishedAt?` и редакторские поля, которые заполняет модератор: `topic?`, `greeting?`, `postscript?`, `signature?`.
- Опубликовать можно только с темой, обращением и подписью (обязательны в контракте `Review`). `GET` — только `published`, от свежих к старым.

### `newsletter`

- **Subscription:** `email citext` (уник.), `status` (active | unsubscribed), `source`, `consentAt`, `consentVersion`. Повтор — 204 без дубля и без раскрытия, был ли адрес.

### `identity`

- Таблиц пока нет: `GET /auth/session` отвечает «гость». `User`, `Session` (хеш токена, срок, ротация), `PhoneCode` — с фазой 8 фронта.

## 4. Этапы

Каждый этап — отдельный PR с зелёным CI и выполненным «Готово, когда».

### B0 · Монорепозиторий и пакет контрактов

**Сделано 18.10.2026.** Потом фронт переехал на GitHub Pages: Dockerfile и nginx фронта удалены, CI выкладывает статику.

1. Фронт — в `apps/web` (`git mv`, история сохраняется). Корень — только workspace, скрипты и общие dev-зависимости.
2. `packages/contracts` (`@wine/contracts`): `openapi/openapi.yaml`, генерация `openapi-typescript` (типы `paths`) и `@hey-api/openapi-ts` с zod (схемы запросов и ответов). Фронт берёт типы из пакета. Папки `proto/` и `events/` появляются вместе с первым внутренним вызовом и первым событием.
3. `packages/demo-data` (`@wine/demo-data`): фикстуры из `entities/*/api/fixtures.ts`, типизированные контрактом; MSW-обработчики фронта импортируют их оттуда.
4. TypeScript 6.0 во всём репозитории.
5. Dockerfile фронта, CI, README, CLAUDE.md — под новую структуру.

**Готово, когда:** фронт собирается и работает как раньше (MSW, все страницы), Docker-образ фронта проходит смоук-тест, CI зелёный, генерация контрактов не даёт изменений.

### B1 · Платформа и «ходячий скелет»

**Сделано 18.10.2026, проверено в Docker 19.10.2026:** образ identity собирается (371 МБ), `GET /api/auth/session` через Traefik отвечает по контракту (`no-store`, request id шлюза, 404 в формате контракта, пробы здоровья снаружи недоступны); Postgres 18.6 — база и роль на сервис, роль одного сервиса не может подключиться к базе другого; NATS 2.15.1 с JetStream; трейсы identity и `trace_id` в логах доходят до Grafana. `dependency-cruiser` отложен до второго сервиса: пока его работу делает `eslint-plugin-boundaries`, а сервисы не могут импортировать друг друга и без него — они не зависят друг от друга в `package.json`.

1. Turborepo: задачи `build`, `lint`, `typecheck`, `test`, `contracts:gen` с кэшем; в CI — только затронутое.
2. `packages/service-kit`: конфиг (zod), логи (pino, request id от шлюза, без cookie и тел запросов), OpenTelemetry, фильтр ошибок в формате контракта, глобальные Standard Schema пайп (тело — 422, query и path — 400) и сериализатор, health-пробы, корректное завершение, база для Prisma-клиента.
3. Первый сервис — `identity` с `GET /api/auth/session` → гость: проходит весь путь Traefik → сервис и задаёт шаблон для остальных.
4. `deploy/compose`: Postgres 18 (база и роль на сервис), NATS с JetStream, Traefik (маршруты `/api/*`), OTel Collector + Grafana-стек (профиль `observability`, чтобы не поднимать всегда).
5. Проверки архитектуры: `eslint-plugin-boundaries` (сервисы не импортируют друг друга, слои внутри), `dependency-cruiser`, тест покрытия `operationId` (нереализованные помечены как ожидаемые).
6. CI для бэкенда пока не пишем (решение 18.10.2026): `pnpm turbo run lint typecheck test` локально. Job `contracts` уже есть в общем CI — он проверяет актуальность сгенерированного из контракта.

**Готово, когда:** `docker compose up` поднимает всё, `GET /api/auth/session` через Traefik отвечает по контракту, трейс запроса виден в Grafana, глубокий импорт из чужого сервиса роняет линтер.

### B2 · `catalog`

1. Модели, миграции, сиды (вина и сорта), `GET /wines` (фильтр, сортировки с `NULLS LAST`, пагинация), `GET /grapes`.
2. `proto/wine/catalog/v1/catalog.proto`: `GetWineSummaries`, `ResolveWineSlugs`; gRPC-сервер в сервисе; `buf lint` и `buf breaking` в CI.
3. Интеграционные и компонентные тесты, ответы — по схемам контракта.

**Готово, когда:** фронт с `VITE_API_MOCKS=false` показывает полки, каталог погреба и виноградники так же, как на моках.

### B3 · `news`

1. Модели, миграции, сиды выпусков и статей (вина — через `ResolveWineSlugs`).
2. `GET /news/issues/latest`, `GET /news/articles/{slug}` (404 по контракту), `GET /news/archive` (месяц по умолчанию — свежий, рубрика, счётчики без учёта фильтра).
3. gRPC-клиент `catalog` за портом, дедлайн, деградация до `relatedWine: null`; тест с выключенным `catalog`.

**Готово, когда:** газета, статьи и подшивка на реальном API совпадают с моками, а при остановленном `catalog` статьи открываются без стикера вина.

### B4 · `reviews` и `newsletter`

1. `reviews`: `GET` (опубликованные), `POST` (pending, 202, 422 по контракту), доменное правило публикации, CLI модерации `reviews:list-pending | publish | reject`.
2. `newsletter`: идемпотентная подписка, 204.
3. Лимиты частоты на шлюзе для обеих форм, маскирование ПДн, согласия (если решим вопрос в §6).
4. Outbox, inbox и публикация в JetStream в `service-kit` — вместе с первым событием, у которого есть подписчик (например, уведомление сомелье о новом письме). Без подписчика события не заводим.

**Готово, когда:** письмо попадает в БД как pending и после `reviews:publish` появляется в ленте; повторная подписка не создаёт дубль; частые запросы получают 429 от шлюза.

### B5 · Край: сессия и защита

1. Traefik: forward-auth к `identity` для защищённых путей (пока их нет — проверка на тестовом маршруте), вырезание внутренних заголовков снаружи, проверка `Origin` для мутирующих запросов.
2. В `identity` — инфраструктура cookie `__Host-` сессии, готовая к фазе 8.

**Готово, когда:** контракт реализован полностью (тест покрытия без исключений), запрос с поддельным заголовком пользователя снаружи не доходит до сервиса.

### B6 · Интеграция и выкатка

1. Разработка: Vite `server.proxy` `/api` → Traefik из `deploy/compose`; MSW остаётся для работы без бэкенда, для тестов фронта и для демо на GitHub Pages.
2. Фронт на GitHub Pages ходит в API на VPS: сборка с `VITE_API_MOCKS=false` и `VITE_API_URL=https://api.<домен>` (CSP-мета подхватит origin сам), CORS-allowlist на Traefik, свой домен для Pages — чтобы cookie были «своими» (см. архитектуру §7).
3. VPS: Docker Compose (Traefik с TLS, сервисы, NATS, PostgreSQL 18 с бэкапами WAL-G, наблюдаемость), миграции — одноразовый контейнер перед сервисом, сиды — однократно. Выкатка — скриптом по SSH (`compose pull && up -d`), автоматизация в CI — позже.
4. README: локальный запуск и деплой.

**Готово, когда:** сайт на Pages работает на реальном API с VPS, трейсы и логи видны в Grafana, откат сервиса — сменой тега образа.

**Потом:** Managed Kubernetes и Helm — когда сервисов станет больше или понадобится масштабирование.

## 5. Принятые решения

| Вопрос | Решение | Отвергнуто и почему |
|---|---|---|
| Архитектура | Микросервисы по ограниченным контекстам (18.10.2026, решение владельца; первоначально был модульный монолит) | Сервис на каждую таблицу — распределённый монолит с сетевыми вызовами вместо функций |
| Контракты | Один пакет `@wine/contracts`: OpenAPI, proto, события | Контракты внутри сервисов — потребители импортировали бы код соседа |
| Внутренние вызовы | gRPC + protobuf, Buf | REST внутри — нет строгой схемы и проверки совместимости из коробки |
| Брокер | NATS JetStream | Kafka — тяжёл для такой нагрузки; RabbitMQ — тоже подходит, но NATS проще в эксплуатации и нативно в Nest 12 |
| Вход | Traefik 3 как шлюз | Свой BFF на Nest — лишний сетевой шаг и код, композиции через край у нас нет |
| Валидация HTTP | Zod из OpenAPI + Standard Schema в Nest 12 | class-validator — второе описание тех же структур руками |
| Данные | База и роль на сервис, Prisma внутри сервиса | Общая база — скрытая связность через таблицы |
| Версия Prisma | 7.10 (точная) | 8 — RC; переход после GA и первого патча |
| TypeScript | 6.0 | 7 — Nest CLI и typescript-eslint ещё не поддерживают |
| Надёжность событий | Outbox + inbox | Публикация после коммита — события теряются при падении |
| Сессии | Серверные, httpOnly-cookie, проверка на шлюзе | JWT — сложно отзывать |
| Окружение | Docker Compose на VPS, фронт — GitHub Pages | Сразу Kubernetes — дорого и сложно для пяти небольших сервисов; облачная платформа (PaaS) — дороже VPS при пяти сервисах и брокере |
| Монорепозиторий | pnpm + Turborepo | Репозиторий на сервис — контракты и общие пакеты пришлось бы публиковать и синхронизировать |

## 6. Открытые вопросы

1. **Согласие на обработку ПДн (152-ФЗ).** Формы письма и подписки собирают имя, город и email без галочки согласия и ссылки на политику; для письма нужно ещё согласие на публикацию. Нужно добавить во фронт и в контракт. Без этого форму письма в проде не включаем.
2. **Кто наполняет контент.** Своя админка (отдельный сервис или фронт поверх API сервисов) или headless CMS. Пока — сиды и CLI модерации.
3. **VPS.** Ты арендуешь VPS у российского провайдера (Timeweb, Selectel, Yandex Cloud). Для Compose со всеми сервисами, NATS, Postgres и Grafana-стеком на старте — от 4 vCPU и 8 ГБ RAM, SSD от 80 ГБ; плюс S3-хранилище для бэкапов.
4. **Домен.** Нужен и для HTTPS API, и чтобы сессия работала: фронт на `*.github.io` и API на другом домене — разные сайты, браузеры режут такие cookie. Решение — свой домен: Pages на `example.ru` (custom domain), API на `api.example.ru`.
5. **Почта и SMS** — с уведомлениями и входом: Yandex Cloud Postbox или Unisender Go; SMS.ru или МТС Exolve.

## 7. Риски

- **Цена микросервисов при маленькой нагрузке:** пять сервисов, брокер, шлюз и наблюдаемость требуют больше ресурсов и времени на поддержку, чем монолит. Снижаем общим `service-kit`, шаблоном сервиса и Compose на одной ВМ на старте.
- **Сетевые отказы:** каждый межсервисный вызов может не пройти. Правило §6 архитектуры (один шаг синхронно, остальное — события) и тесты с выключенным соседом.
- **Prisma 8 выходит в октябре 2026:** ветка 7 поддерживается 18 месяцев после его выхода, Prisma — только в `infrastructure/` сервисов.
