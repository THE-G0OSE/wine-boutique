#!/usr/bin/env bash
# Выкатка бэкенда на VPS по SSH:
#   deploy/vps/deploy.sh <ssh-хост> [git-ref, по умолчанию origin/main] [--observability]
# Откат — тот же вызов со старым ref (тегом или хешем): образы этого коммита уже собраны, сборки не будет.
#
# На VPS (один раз, см. README): Docker с Compose, клон репозитория в $WINE_HOME/app,
# окружение — $WINE_HOME/.env по образцу deploy/vps/.env.example. WINE_HOME — по умолчанию /opt/wine-boutique.
# Образы собираются на самом VPS: реестр не нужен, Docker Hub из России нестабилен — базовые образы через зеркало провайдера.
# Тег образа — хеш коммита. Миграции — одноразовые контейнеры *-migrate перед стартом сервиса (compose.yaml).
set -euo pipefail

host="${1:?Укажите ssh-хост: deploy/vps/deploy.sh <ssh-хост> [git-ref] [--observability]}"
ref="${2:-origin/main}"
profiles=""
if [[ "${3:-}" == "--observability" ]]; then profiles="--profile observability"; fi

home="${WINE_HOME:-/opt/wine-boutique}"

# ssh склеивает аргументы в одну строку для удалённой оболочки — экранируем, чтобы пустые и с пробелами дошли как есть
ssh "$host" "bash -s -- $(printf '%q ' "$ref" "$home" "$profiles")" <<'REMOTE'
set -euo pipefail
ref="$1"
home="$2"
profiles="$3"
cd "${home}/app"
git fetch --quiet --tags origin
git checkout --quiet --detach "$ref"
export TAG="$(git rev-parse --short=12 HEAD)"
compose="docker compose -f deploy/compose/compose.yaml -f deploy/compose/compose.prod.yaml --env-file ${home}/.env ${profiles}"

# По одному образу: параллельная сборка всех сервисов упирается в память небольшой ВМ
if ! docker image inspect "wine-boutique/reservations:${TAG}" > /dev/null 2>&1; then
  for service in identity-migrate identity catalog-migrate catalog news-migrate news reviews-migrate reviews newsletter-migrate newsletter reservations-migrate reservations; do
    ${compose} build "${service}"
  done
fi

${compose} up -d --remove-orphans --wait --wait-timeout 300
${compose} ps --format "table {{.Service}}\t{{.Status}}"
echo "Выкачен коммит ${TAG}"
REMOTE
