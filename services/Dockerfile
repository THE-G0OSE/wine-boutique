# Образ любого сервиса. Контекст — корень репозитория:
#   docker build -f services/Dockerfile --build-arg SERVICE=identity -t wine/identity .
ARG NODE_IMAGE=node:24-alpine

FROM ${NODE_IMAGE} AS build
ARG SERVICE
WORKDIR /repo
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

# Хранилище pnpm — в кэше BuildKit, а не в слое образа: при смене lockfile докачивается только новое,
# а пакеты копируются из кэша, а не жёсткими ссылками из нижних слоёв (на медленном диске это минуты на пакет)
ENV PNPM_STORE=/pnpm/store

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm fetch --store-dir "$PNPM_STORE"

COPY . .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store     pnpm install --offline --frozen-lockfile --store-dir "$PNPM_STORE" --filter wine-boutique --filter "@wine/${SERVICE}..."
RUN pnpm turbo run build --filter "@wine/${SERVICE}..."
# Только прод-зависимости сервиса; пакеты workspace (service-kit, contracts) копируются внутрь вместе с dist
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store     pnpm --filter "@wine/${SERVICE}" deploy --prod --legacy --store-dir "$PNPM_STORE" /out

# Общая основа образов сервиса и миграций: Node и Prisma CLI. CLI нужен только миграциям, но лежит здесь, под слоем сервиса:
# слой с ним одинаков у всех 20 образов и хранится на диске один раз (~300 МБ), а над слоем /out он повторился бы 10 раз.
# На VPS с диском 20 ГБ это разница между «помещается» и «нет»
FROM ${NODE_IMAGE} AS base
ARG PRISMA_VERSION=7.10.1
RUN npm install --prefix /opt/prisma --omit=dev --no-audit --no-fund --loglevel=error "prisma@${PRISMA_VERSION}"  && npm cache clean --force
ENV NODE_ENV=production     HTTP_PORT=3000     PRISMA_HIDE_UPDATE_MESSAGE=true
WORKDIR /app

FROM base AS runtime
COPY --from=build --chown=node:node /out ./
USER node
EXPOSE 3000

# Миграции и сид — одноразовый контейнер перед запуском сервиса: docker build --target migrate …; SEED=true — ещё и демо-данные.
# Поверх образа сервиса: сид — dist/seed.js с прод-зависимостями; добавляются схема, миграции и prisma.config.ts
# (он импортирует prisma/config — ссылка на CLI в node_modules). Раньше здесь был весь этап build — 2,4 ГБ на сервис
FROM runtime AS migrate
ARG SERVICE
RUN ln -s /opt/prisma/node_modules/prisma /app/node_modules/prisma
COPY --from=build /repo/services/${SERVICE}/prisma ./prisma
COPY --from=build /repo/services/${SERVICE}/prisma.config.ts ./
CMD ["sh", "-c", "/opt/prisma/node_modules/.bin/prisma migrate deploy && if [ \"$SEED\" = true ]; then node dist/seed.js; fi"]

# Образ сервиса — последний этап (сборка без --target)
FROM runtime
HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=3   CMD wget -qO /dev/null http://127.0.0.1:3000/health/ready || exit 1
# OpenTelemetry (@wine/service-kit/telemetry): настраивается переменными OTEL_*, OTEL_SDK_DISABLED=true — выключено
CMD ["node", "--enable-source-maps", "--import", "@wine/service-kit/telemetry", "dist/main.js"]
