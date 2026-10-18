# Образ фронтенда. Контекст сборки — корень репозитория (нужны пакеты workspace):
#   docker build -f apps/web/Dockerfile .
FROM node:24-alpine AS build
WORKDIR /repo
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

# Сначала только манифесты — слой с зависимостями кэшируется, пока они не меняются
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY packages/contracts/package.json packages/contracts/
COPY packages/demo-data/package.json packages/demo-data/
RUN pnpm install --frozen-lockfile --filter @wine/web...

COPY packages packages
COPY apps/web apps/web

# Значения по умолчанию — как в apps/web/.env. С бэкендом:
# docker build -f apps/web/Dockerfile --build-arg VITE_API_MOCKS=false .
ARG VITE_API_URL=/api
ARG VITE_API_MOCKS=true
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_API_MOCKS=${VITE_API_MOCKS}
RUN pnpm --filter @wine/web build

# Раздача статики: nginx без root, порт 8080
FROM nginxinc/nginx-unprivileged:1.30-alpine
COPY deploy/nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY deploy/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO /dev/null http://127.0.0.1:8080/ || exit 1
