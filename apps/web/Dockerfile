# Фронт для VPS: сборка Vite и nginx со статикой. Контекст — корень репозитория:
#   docker build -f apps/web/Dockerfile --build-arg SITE_URL=https://example.ru/ -t wine/web .
# Сайт и API — на одном адресе (Traefik: /api → сервисы, остальное — сюда): cookie сессии свои, CORS не нужен.
# На GitHub Pages собирается отдельно, в CI, — демо на моках MSW.
ARG NODE_IMAGE=node:24-alpine

FROM ${NODE_IMAGE} AS build
WORKDIR /repo
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    PNPM_STORE=/pnpm/store
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm fetch --store-dir "$PNPM_STORE"

COPY . .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --offline --frozen-lockfile --store-dir "$PNPM_STORE" --filter wine-boutique --filter "@wine/web..."

# Адрес сайта — для Open Graph (абсолютная ссылка на картинку превью)
ARG SITE_URL
ENV BASE_PATH=/ \
    VITE_API_URL=/api \
    VITE_API_MOCKS=false \
    SITE_URL=${SITE_URL}
RUN pnpm turbo run build --filter "@wine/web..." \
 && rm -f apps/web/dist/mockServiceWorker.js

FROM nginx:1.28.3-alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
HEALTHCHECK --interval=15s --timeout=3s --retries=3 CMD wget -qO /dev/null http://127.0.0.1/ || exit 1
