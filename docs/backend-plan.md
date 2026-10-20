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
| `GET /auth/session` (по cookie сессии; входа ещё нет — сессии для разработки выдаёт CLI) | `identity` |

Плюс инфраструктура, без которой микросервисы не выкатить: монорепозиторий, пакет контрактов, общий `service-kit`, шлюз, брокер, наблюдаемость, CI, деплой.

**Не входит** — то, чего ещё нет во фронте: вход по телефону, бронь, кабинет, услуги, поиск, фасеты. Сервисы для них — в §2.2, их делают вместе с фазами фронта. Админки пока нет: данные из сидов, письма модерируются CLI-командой.

## 2. Сервисы

### 2.1 Сейчас

| Сервис | База | Публичные пути (Traefik) | Внутренний gRPC | Ходит к | События |
|---|---|---|---|---|---|
| `catalog` | `catalog` | `/api/shelves`, `/api/wines`, `/api/search`, `/api/grapes` | `wine.catalog.v1.CatalogService`: `GetWineSummaries(ids)`, `ResolveWineSlugs(slugs)` | — | `catalog.wine-changed.v1` — когда появятся подписчики с копиями |
| `news` | `news` | `/api/news` | — | `catalog` (вино для стикера) | — |
| `reviews` | `reviews` | `/api/reviews` | — | — | `reviews.letter-received.v1` — с уведомлениями сомелье |
| `newsletter` | `newsletter` | `/api/newsletter` | — | — | `newsletter.subscribed.v1` — с рассылкой |
| `reservations` | `reservations` | `/api/boutiques`, `/api/reservations` | — | `catalog` (вина и цены для брони) | `reservations.created.v1` — с уведомлениями (SMS) |
| `cellar` | `cellar` | `/api/cellar` | — | — | `cellar.cell-requested.v1` — с уведомлениями управляющему |
| `requests` | `requests` | `/api/requests`, `/api/monthly`, `/api/certificates` | — | — | `requests.*.v1` — с уведомлениями менеджеру; оплата сертификатов — с платёжным сервисом |
| `tastings` | `tastings` | `/api/tastings` | — | — | `tastings.booked.v1`, `tastings.seat-released.v1` — с уведомлениями (SMS-напоминание, лист ожидания) |
| `identity` | `identity` | `/api/auth`, `/api/me` | — (шлюзу — HTTP `/internal/forward-auth` и `/internal/forward-auth-optional`: Traefik forwardAuth умеет только HTTP) | — | `identity.user-registered.v1`, `identity.user-deleted.v1` — с событиями |
| `loyalty` | `loyalty` | `/api/me/loyalty`, `/api/me/favorites` | — | `catalog` (карточки избранных вин) | подписка на покупки бутика — с сервисом заказов |

Вина и сорта винограда — в одном сервисе: это одна предметная область (паспорт вина ссылается на сорта, сорт показывает свои вина), и они меняются вместе. Отдельный сервис для сортов дал бы лишний сетевой вызов на каждый `GET /grapes`.

Граф синхронных вызовов: `news → catalog`, `reservations → catalog`, Traefik → `identity` (forward-auth). Больше никто никого не вызывает.

### 2.2 Дальше (вместе с фазами фронта)

| Фаза фронта | Сервисы |
|---|---|
| 3 · Каталог | **Сделано 20.10.2026:** `catalog` растёт — полки, фасеты, карточка вина, поиск подстрокой по `pg_trgm` (морфология русского FTS для названий вин и сортов не нужна: ищут «пино», «Бург») |
| 4 · Бронь | **Сделано 20.10.2026:** `reservations` — бутики, слоты, бронь со снимком вин и цен (один gRPC-вызов `catalog`, не ответил — 503, бронь не создаётся), квитанция. Наличия в каталоге пока нет; сага и события `reservations.*` — с уведомлениями и списанием остатков |
| 6 · Услуги | **`tastings` сделан 20.10.2026:** афиша месяца, запись с атомарным занятием мест, лист ожидания (афиша газеты будет браться отсюда). **`cellar` сделан 20.10.2026:** стена ячеек и заявки на ячейку (заявка ячейку не занимает — занятость по договору меняет управляющий). **`requests` сделан 20.10.2026:** заявки на зал и подарки, набор месяца (ящики и подписки), сертификаты в статусе «ждёт оплаты». Фаза 6 закрыта |
| 8 · Кабинет | **Сделано 20.10.2026:** `identity` — вход по телефону и коду, карта гостя, профиль, устройства; `loyalty` — бонусы, уровни, избранное (новый сервис); «мои» данные в `reservations`, `tastings`, `cellar`, `requests` по `X-User-Id` шлюза. Дальше — `notifications` (SMS и почта по событиям: код входа, напоминания) и события между сервисами (удаление кабинета, покупки → бонусы и уровень) |
| — · Контент | Админка или headless CMS — отдельное решение (§6) |

## 3. Модель данных

Поля — в терминах Prisma (camelCase), в БД — snake_case. У всех таблиц `id uuid` (v7), `createdAt`, `updatedAt`. В базе каждого сервиса с событиями — `outbox` (издатель) и `inbox` (подписчик).

### `catalog`

- **Wine:** `slug` (уник.), `name`, `categories WineCategory[]`, `region`, `country?`, `grapes String[]` (названия для карточки), `volumeMl Int` (в API — «0,75 л»), `vintage Int?`, `cellaredAt Date?` (в API — `cellarYears`), `priceKopecks Int?` (в API — рубли), `imageUrl`, `popularityRank Int` (сортировка `popular`), `arrivedAt` (сортировка `new`). Индексы: GIN по `categories`, B-tree по полям сортировки; сортировки по цене и году — `NULLS LAST`.
- **GrapeVariety:** `slug`, `name`, `type` (red | white), `origin`, `taste`, `harvest`, `description`, `plantation?`, `imageUrl`, `position`.
- **GrapeVarietyWine:** `varietyId`, `wineId` (внешние ключи — это одна база), `position` (не больше трёх).
- Карточка вина (фаза 3) — в той же таблице `wines`: `bottle` (силуэт на полке), `producer?`, `appellation?`, `abv`, `aging`, `potential`, `badges[]`, `profile Json?`, `notes Json`, `food Json`, `serve Json?`, `sommelierNote`; `searchText` — название, сорта, регион, страна, винодельня в нижнем регистре и с «е» вместо «ё», GIN-индекс `gin_trgm_ops` (поиск — каждое слово подстрокой).
- **Shelf:** `id` (red | white | sparkling | aged), `title`, `note`, `description`, `position`. **ShelfWine:** `shelfId`, `wineId`, `position` — порядок на полке (сортировка popular на полке). **WineRelation:** `wineId`, `relatedId`, `position` — «С этим вином берут» по выбору сомелье; пусто — соседи по полке.
- Фасеты считаются в сервисе по выборке «полка + тип + поиск» (одна выборка узких колонок, остальные фильтры — в памяти по правилу «все, кроме своей группы»): каталог бутика — сотни вин. Если вырастет до десятков тысяч — `unnest` и `GROUPING SETS` в SQL.
- Правила выдачи совпадают с эталоном `@wine/demo-data` (моки фронта): тест сверяет 200 сочетаний полок, сортировок и фильтров, фасеты, полки, все карточки и подсказки.

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

### `reservations`

- **Boutique:** `id` (slug), `name`, `address`, `hours` (для людей), `phone`, `timezone` (IANA), `schedule Json` — `[{ weekday 1–7, opens, closes }]`, дня нет — закрыто; `position`.
- **Reservation:** `id` — uuid v4 (ссылка на квитанцию — по нему, телефон и почта в ответ не попадают), `number` — последовательность (`WB-000123`), `status` (active | completed | cancelled | expired), `boutiqueId`, `pickupAt`, `holdUntil`, `customerName`, `phone`, `email?`, `comment?`, `consentAt` и `consentVersion` (152-ФЗ). **ReservationItem:** снимок вина — `wineId` (без внешнего ключа, база catalog — чужая), `slug`, `name`, `imageUrl`, `qty`, `priceKopecks?`.
- Правила (совпадают с эталоном `@wine/demo-data`, тест сверяет): слоты на семь дней по часам бутика, по часу, последний — за час до закрытия, сегодняшние — не раньше чем через час; держим до закрытия на третий день, считая день самовывоза. Одно вино в нескольких строках складывается (до 12 бутылок).

### `tastings`

- **Tasting:** `id` — дата и время начала по часам погреба (`2026-10-17-1900`: читаемый, стабильный, сид обновляет по нему), `kind` (vertical | blind | dinner | masterclass), `title`, `description`, `startsAt`, `durationMinutes`, `wines`, `capacity`, `seatsTaken` (CHECK `0 ≤ seats_taken ≤ capacity`), `priceKopecks?`, `host`.
- **Booking:** uuid v4, `tastingId`, `customerName`, `phone`, `guests` (1–6), `consentAt`/`consentVersion`. Места занимает условный `UPDATE … SET seats_taken = seats_taken + n WHERE seats_taken + n <= capacity AND starts_at > now()` в одной транзакции с записью: одновременные записи не продают лишнего (тест — восемь параллельных на три места).
- **WaitlistEntry:** уник. `(tastingId, phone)` — повтор обновляет имя и гостей. В лист — только когда мест нет (иначе 409 `seats_available`).
- Афиша и статусы совпадают с эталоном `@wine/demo-data` (тест сверяет месяцы афиши): месяц — по часам погреба, `past` — началась, `full` — мест нет. Сид — текущий месяц и два следующих; повторный не сбрасывает занятые места. Отмена записи и освобождение мест — с кабинетом (фаза 8).

### `cellar`

- **Cell:** `number` — номер на табличке (`101` … `408`, ключ), `row`, `position` (уник. пара), `tier` (small | medium | large), `capacity` (12 / 24 / 48), `status` (free | busy — по договору хранения, меняет управляющий), `priceKopecks?`.
- **CellRequest:** uuid v4, `cellNumber`, `term` (3m | 1y | 3y — в Prisma `m3`/`y1`/`y3`: идентификатор не может начинаться с цифры, в базе — как в API через `@map`), `status` (new | contacted | closed), `customerName`, `phone`, `email?`, `bottles?`, `consentAt`/`consentVersion`. Только на свободную ячейку (иначе 409 `cell_busy`).
- Стена совпадает с эталоном `@wine/demo-data` (тест сверяет). Сид создаёт ячейки с занятостью из макета и не трогает занятость существующих. Опись бутылок и «Моя ячейка» — с кабинетом (фаза 8).

### `requests`

- **ServiceRequest:** заявки, по которым перезванивает менеджер: `kind` (hall | gift), `number` — последовательность (`R-000123`), `status` (new | contacted | closed), `phone`, `contactName?`, `email?`, `company?`, `details Json` (зал — рассадка, дата, гости; подарки — упаковка, бутылки, дополнения, бирка, тираж), согласие. Правила зала: гостей не больше вместимости (банкет 14, фуршет 30, лекция 24), дата — с завтрашнего дня по Москве и не дальше года.
- **MonthlyCrate:** `month` (ключ, «2026-10»), `theme`, `wines String[]`, `sommelier`. `GET /monthly`: текущий — свежий ящик не позже текущего месяца, архив — шесть предыдущих (совпадает с эталоном `@wine/demo-data`).
- **MonthlySubscription:** уник. `phone` (повтор меняет набор и бутик, номер `M-000123` прежний), `plan` (duo | classic | cellar), `boutiqueId` (id из reservations, без проверки — база чужая), `status` (active | paused | cancelled).
- **Certificate:** `number` + `year` (на бумаге — `WB-2026-000123`), `nominal` (₽, 3 000–300 000), `recipientName`, `senderName`, `message?`, `format` (email | envelope; электронному нужен `recipientEmail`), `phone` покупателя, `status` (awaiting_payment → active → redeemed | expired), `validUntil` — год с даты оформления по Москве. Оплата — отдельный этап (платёжный провайдер, вебхук переводит в active).

### `identity`

- **User:** `name` (для шапки; инициалы считаются), `phone?` (уник., логин; у пользователей из CLI разработки нет), `birthDate?`, `email?`, `cardNumber?` (12 цифр, уник.), `marketingConsent`, `consentAt?`/`consentVersion?`, `favoriteBoutiqueId?`, `tastes String[]`, `notifications Json?` (null — настройки по умолчанию).
- **Session:** `tokenHash` (SHA-256 токена из cookie, уник.), `userId`, `expiresAt` (30 дней с последнего продления), `lastSeenAt` (пишется не чаще раза в час — тогда же продлевается срок и cookie), `revokedAt?`, `userAgent?` (для списка устройств). Каждый вход — новая сессия и новый токен.
- **PhoneCode:** `phone`, `codeHash` (SHA-256 «телефон:код»), `expiresAt` (5 минут), `attempts` (до 5, потом код сгорает), `consumedAt?`. Новый код — не раньше чем через минуту и не больше 5 в час на номер; проверяется только последний. Ответ на запрос кода одинаков для новых и известных номеров.
- **Registration:** `tokenHash`, `phone`, `expiresAt` (15 минут), `usedAt?` — подтверждённый новый номер до заполнения карты гостя; карта — с 18 лет.
- Доставка кода — `CodeSender`: пока в лог сервиса (`docker compose logs identity`), SMS — с сервисом notifications.

### `loyalty`

- **BonusEntry:** `userId`, `amount` (плюс — начислено, минус — списано), `title`, `reference` (уник. у гостя: «welcome», позже «reservation:<id>» — повтор события не начислит дважды), `at`. Баланс — сумма проводок. Приветственные 500 начисляются при первом открытии кабинета.
- **Favorite:** `userId`, `wineId` (catalog, без внешнего ключа), `createdAt`. Карточки — одним вызовом `CatalogService.GetWineSummaries` (в proto добавлены поля списка: сорта, регион, объём, силуэт); catalog не ответил — 503.
- Уровень — по бутылкам за 12 месяцев (6 / 12 / 24); покупки придут событиями из бутика, пока у всех 0.

### Кабинет в остальных сервисах

- `reservations`: `userId?`, `extendedAt?` у брони; «мои брони» — по `userId`, продление на 3 дня один раз, отмена; срок вышел — `expired` при чтении.
- `tastings`: `userId?` у записи и листа ожидания; записи на одну дегустацию складываются.
- `cellar`: **CellLease** (ячейка гостя и срок оплаты, оформляет управляющий — CLI `lease:assign`), **CellBottle** (опись), **CellPreparation** (бутылки к визиту, не раньше чем через 2 часа).
- `requests`: `userId?` и `skipMonth?` у подписки на набор; `balance` и `ownerId?` у сертификата — привязать по номеру можно оплаченный и ни к кому не привязанный (оплата пока — CLI `certificate:pay`).
- Публичные формы (бронь, запись, лист ожидания, подписка) идут через `optional-session`: вошёл — запись попадает в кабинет.



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

**Сделано 18.10.2026, проверено в Docker 19.10.2026:** образ identity собирается (371 МБ), `GET /api/auth/session` через Traefik отвечает по контракту (`no-store`, request id шлюза, 404 в формате контракта, пробы здоровья снаружи недоступны); Postgres 18.6 — база и роль на сервис, роль одного сервиса не может подключиться к базе другого; NATS 2.15.1 с JetStream; трейс запроса начинается на Traefik и продолжается в identity (traefik `GET` → `ReverseProxy` → identity `GET`), тот же `trace_id` — в логе сервиса; пробы здоровья в трейсы не попадают. `dependency-cruiser` отложен до второго сервиса: пока его работу делает `eslint-plugin-boundaries`, а сервисы не могут импортировать друг друга и без него — они не зависят друг от друга в `package.json`.

1. Turborepo: задачи `build`, `lint`, `typecheck`, `test`, `contracts:gen` с кэшем; в CI — только затронутое.
2. `packages/service-kit`: конфиг (zod), логи (pino, request id от шлюза, без cookie и тел запросов), OpenTelemetry, фильтр ошибок в формате контракта, глобальные Standard Schema пайп (тело — 422, query и path — 400) и сериализатор, health-пробы, корректное завершение, база для Prisma-клиента.
3. Первый сервис — `identity` с `GET /api/auth/session` → гость: проходит весь путь Traefik → сервис и задаёт шаблон для остальных.
4. `deploy/compose`: Postgres 18 (база и роль на сервис), NATS с JetStream, Traefik (маршруты `/api/*`), OTel Collector + Grafana-стек (профиль `observability`, чтобы не поднимать всегда).
5. Проверки архитектуры: `eslint-plugin-boundaries` (сервисы не импортируют друг друга, слои внутри), `dependency-cruiser`, тест покрытия `operationId` (нереализованные помечены как ожидаемые).
6. CI для бэкенда пока не пишем (решение 18.10.2026): `pnpm turbo run lint typecheck test` локально. Job `contracts` уже есть в общем CI — он проверяет актуальность сгенерированного из контракта.

**Готово, когда:** `docker compose up` поднимает всё, `GET /api/auth/session` через Traefik отвечает по контракту, трейс запроса виден в Grafana, глубокий импорт из чужого сервиса роняет линтер.

### B2 · `catalog`

**Сделано 19.10.2026.** Вина и сорта в Postgres (Prisma 7.10), сид из `@wine/demo-data`, `GET /wines` и `GET /grapes`, gRPC `wine.catalog.v1.CatalogService`; 9 тестов на настоящем Postgres (Testcontainers), включая gRPC и повторный сид. Порядок вин совпадает с моками фронта во всех 25 сочетаниях полки и сортировки. В Docker: миграции и сид — контейнер `catalog-migrate`, сервис за Traefik (`/api/wines`, `/api/grapes`). Фронт с `VITE_API_MOCKS=false` показывает каталог погреба и виноградники с данными из базы. `buf breaking` — локально (`pnpm --filter @wine/contracts proto:breaking`), CI для бэкенда пока нет.

1. Модели, миграции, сиды (вина и сорта), `GET /wines` (фильтр, сортировки с `NULLS LAST`, пагинация), `GET /grapes`.
2. `proto/wine/catalog/v1/catalog.proto`: `GetWineSummaries`, `ResolveWineSlugs`; gRPC-сервер в сервисе; `buf lint` и `buf breaking` в CI.
3. Интеграционные и компонентные тесты, ответы — по схемам контракта.

**Готово, когда:** фронт с `VITE_API_MOCKS=false` показывает полки, каталог погреба и виноградники так же, как на моках.

### B3 · `news`

**Сделано и проверено в Docker 20.10.2026.** Сид в контейнере `news-migrate` берёт вино у настоящего catalog по gRPC; через Traefik статья отдаёт `relatedWine` из catalog, при остановленном catalog — за ~1 с (дедлайн) и без вина, газета и подшивка работают. Фронт с `VITE_API_MOCKS=false` показывает газету, статью со стикером вина и подшивку с фильтрами. Газета в Postgres: выпуски (у архивных — только первая полоса), статьи (без текста — с плейсхолдером из дизайна и флагом `textPending`), полосы номера отдельно от статей (на полосе — сокращённая версия со своим текстом). Свежий выпуск, статьи и 40 вариантов подшивки совпадают с моками фронта. Вино для стикера — один gRPC-вызов catalog с дедлайном; catalog недоступен или медленнее дедлайна — статья открывается без вина (оба случая в тестах, 10 тестов на Testcontainers). «Ещё вырезки» — три свежие статьи с текстом, кроме текущей; моки фронта выровнены под это правило.

1. Модели, миграции, сиды выпусков и статей (вина — через `ResolveWineSlugs`).
2. `GET /news/issues/latest`, `GET /news/articles/{slug}` (404 по контракту), `GET /news/archive` (месяц по умолчанию — свежий, рубрика, счётчики без учёта фильтра).
3. gRPC-клиент `catalog` за портом, дедлайн, деградация до `relatedWine: null`; тест с выключенным `catalog`.

**Готово, когда:** газета, статьи и подшивка на реальном API совпадают с моками, а при остановленном `catalog` статьи открываются без стикера вина.

### B4 · `reviews` и `newsletter`

**Сделано и проверено в Docker 20.10.2026.** `reviews`: лента опубликованных писем (сид из `@wine/demo-data`, порядок как в моках), письмо с сайта — 202 и в базу как pending, 422 `invalid_letter` с текстом из мока формы (пустое после обрезки пробелов — тоже 422, правило домена). Модерация — CLI в контейнере: `docker compose exec reviews node dist/cli.js list | publish <id> --topic … --greeting … --signature … [--postscript …] | reject <id>`; без темы, обращения и подписи письмо не публикуется, опубликованное встаёт первым в ленте. `newsletter`: подписка — 204, адрес в `citext`, повтор в другом регистре не создаёт дубль, отписавшийся подписывается снова; 422 `invalid_email`. Обе формы — 5 запросов в минуту с адреса, сверх — 429 `too_many_requests` в формате контракта (13 тестов на Testcontainers). Через Traefik фронт с `VITE_API_MOCKS=false` показывает ленту и «Показать ещё», отправляет письмо («Письмо запечатано ✓») и подписку в футере («Вы подписаны ✓»).

Отступления от пунктов ниже:
- Лимит частоты — в сервисе (`@RateLimit` из `service-kit`), а не на шлюзе: так 429 приходит в формате ошибки контракта и проверяется тестами сервиса; IP клиента сервис берёт из `X-Forwarded-For` от Traefik. Лимит на шлюзе против грубого потока добавим при выкатке (B6).
- ПДн: тела запросов в логи не пишутся, cookie и `Authorization` скрыты; поля согласия (`consentAt`, `consentVersion`) в схеме есть, но пусты — вопрос из §6 не решён.
- Outbox не заведён: у писем и подписок пока нет подписчиков (п. 4).

1. `reviews`: `GET` (опубликованные), `POST` (pending, 202, 422 по контракту), доменное правило публикации, CLI модерации `reviews:list-pending | publish | reject`.
2. `newsletter`: идемпотентная подписка, 204.
3. Лимиты частоты на шлюзе для обеих форм, маскирование ПДн, согласия (если решим вопрос в §6).
4. Outbox, inbox и публикация в JetStream в `service-kit` — вместе с первым событием, у которого есть подписчик (например, уведомление сомелье о новом письме). Без подписчика события не заводим.

**Готово, когда:** письмо попадает в БД как pending и после `reviews:publish` появляется в ленте; повторная подписка не создаёт дубль; частые запросы получают 429 от шлюза.

### B5 · Край: сессия и защита

**Сделано и проверено в Docker 20.10.2026.** identity: пользователи и серверные сессии в своей базе (токен 256 бит в cookie `__Host-session`, в базе — SHA-256; 30 дней с продлением не чаще раза в час), `GET /auth/session` по cookie, `/internal/forward-auth` для Traefik, CLI `session:issue` / `session:revoke` для разработки. Traefik: на входе `strip-internal-headers` вырезает `X-User-Id` у всех запросов, middleware `require-session` (forwardAuth к identity) — для защищённых путей. `service-kit`: глобальная проверка `Origin` у изменяющих запросов (`ALLOWED_ORIGINS`, 403 `forbidden_origin`) и `@CurrentUser()`; в контракте у форм — ответы 403 и 429. Сквозные тесты `tests/e2e` через настоящий шлюз (9): поддельный `X-User-Id` снаружи до сервиса не доходит ни в каком регистре; защищённый путь без сессии — 401 от identity, с сессией (GET и POST) сервис получает настоящий id пользователя, после отзыва — снова 401; `/internal/*` снаружи недоступен; форма с чужого `Origin` — 403; подмена `X-Forwarded-For` не обходит лимит; маршруты — по целым сегментам. Фронт с `VITE_API_MOCKS=false` и cookie сессии показывает инициалы в шапке. identity — 9 тестов на Testcontainers.

Отступления: проверка `Origin` — в сервисах, а не на шлюзе (у Traefik её нет, а forward-auth на каждую форму сделал бы identity точкой отказа всех форм); identity для шлюза — HTTP, а не gRPC `ResolveSession` (Traefik forwardAuth умеет только HTTP).

1. Traefik: forward-auth к `identity` для защищённых путей (пока их нет — проверка на тестовом маршруте), вырезание внутренних заголовков снаружи, проверка `Origin` для мутирующих запросов.
2. В `identity` — инфраструктура cookie `__Host-` сессии, готовая к фазе 8.

**Готово, когда:** контракт реализован полностью (тест покрытия без исключений), запрос с поддельным заголовком пользователя снаружи не доходит до сервиса.

### B6 · Интеграция и выкатка

**Подготовлено и проверено локально 20.10.2026; ждёт VPS, домена и S3.** `deploy/compose/compose.prod.yaml` поверх `compose.yaml`: наружу только 80/443 (:80 — 308 на HTTPS), TLS от Let's Encrypt (tls-challenge), CORS только для `FRONT_ORIGIN` с cookie, общий лимит на шлюзе (100 запросов в секунду с адреса, всплеск 200), свой пароль у роли каждого сервиса (роли без `CREATEDB`), образы с тегом коммита, Grafana — только на `127.0.0.1` (через SSH-туннель), без тестовых маршрутов края и `whoami`. Выкатка и откат — `deploy/vps/deploy.sh <ssh-хост> [ref]`: образы собираются на VPS по одному, `up --wait`. Pages: переменная репозитория `API_URL` переключает сборку на настоящий API, `PAGES_BASE_PATH=/` — для своего домена. Локально (отдельный проект Compose на новых томах): init-скрипт создал базы и роли с отдельными паролями (пароль разработки не подходит, в чужую базу роль не пускают), миграции и сиды прошли, все сервисы здоровы; через :443 — каталог, CORS-preflight для своего origin и без заголовков для чужого, POST с чужим `Origin` — 403, `/api/_dev/*` — 404, 300 запросов за секунду — 230 из них 429. Найдено и исправлено: проверка готовности Postgres через сокет пропускала миграции к базе раньше конца первого запуска (теперь по TCP, со `start_period`).

**На VPS с 21.10.2026:** https://194-226-99-185.sslip.io — 2 vCPU / 2 ГБ RAM + 2 ГБ swap / 20 ГБ, Ubuntu 26.04, Docker из пакетов Ubuntu (хранилище overlay2, логи — драйвер `local` с ротацией). Решения по ходу:
- фронт — тоже с VPS, на одном адресе с API (`apps/web/Dockerfile`, nginx; Traefik: `/api` → сервисы, остальное → `web`). Фронт на `*.github.io` и API на другом сайте — cookie сессии `SameSite=Lax` в запросы к API не попадают, вход бы не работал. Pages остаётся демо на моках;
- своего домена нет — `sslip.io` (имя вида `1-2-3-4.sslip.io` указывает на IP), Let's Encrypt его принимает. Домен появится — `API_DOMAIN`/`FRONT_ORIGIN` в `.env`;
- образ миграций — образ сервиса + схема и миграции, Prisma CLI — в общем нижнем слое всех образов (раньше миграции несли весь этап build — 2,4 ГБ на сервис, диск кончался на шестом); кэш сборки чистится после каждого сервиса, образы прошлых выкаток — после успешной (откат пересобирает);
- CORS шлюза пропускал только GET/POST — кабинет шлёт PATCH/PUT/DELETE; поправлено.

Осталось: бэкапы — WAL-G 3.0 (работает с PostgreSQL 18) в S3 провайдера, когда будет хранилище; Grafana на 2 ГБ не помещается — наблюдаемость только на машине разработки; вход по паролю на VPS выключить после проверки ключа.

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
