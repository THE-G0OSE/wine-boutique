# Сборка: Node 24 и pnpm той версии, что указана в packageManager (через corepack)
FROM node:24-alpine AS build
WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Значения по умолчанию — как в .env. Когда появится бэкенд:
# docker build --build-arg VITE_API_MOCKS=false --build-arg VITE_API_URL=https://api.example.ru .
ARG VITE_API_URL=/api
ARG VITE_API_MOCKS=true
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_API_MOCKS=${VITE_API_MOCKS}
RUN pnpm build

# Раздача статики: nginx без root, порт 8080
FROM nginxinc/nginx-unprivileged:1.30-alpine
COPY deploy/nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY deploy/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO /dev/null http://127.0.0.1:8080/ || exit 1
