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

# Миграции и сид — отдельный одноразовый контейнер перед запуском сервиса: Prisma CLI — dev-зависимость
# и в прод-образ не попадает. docker build --target migrate …; SEED=true — ещё и демо-данные
FROM build AS migrate
ARG SERVICE
WORKDIR /repo/services/${SERVICE}
# Без баннера «обновитесь до prisma@latest»: latest — это 8.0 RC, мы на 7.10 намеренно
ENV NODE_ENV=production \
    PRISMA_HIDE_UPDATE_MESSAGE=true
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && if [ \"$SEED\" = true ]; then node dist/seed.js; fi"]

FROM ${NODE_IMAGE}
ENV NODE_ENV=production \
    HTTP_PORT=3000
WORKDIR /app
COPY --from=build --chown=node:node /out ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=3 \
  CMD wget -qO /dev/null http://127.0.0.1:3000/health/ready || exit 1
# OpenTelemetry (@wine/service-kit/telemetry): настраивается переменными OTEL_*, OTEL_SDK_DISABLED=true — выключено
CMD ["node", "--enable-source-maps", "--import", "@wine/service-kit/telemetry", "dist/main.js"]
