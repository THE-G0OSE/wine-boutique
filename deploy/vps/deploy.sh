#!/usr/bin/env bash
# Выкатка бэкенда на VPS по SSH:
#   deploy/vps/deploy.sh <ssh-хост> [git-ref, по умолчанию origin/main] [--observability]
# Откат — тот же вызов со старым ref (тегом или хешем): образы прошлых выкаток удаляются ради диска, поэтому соберутся заново.
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

# По одному сервису: параллельная сборка всех упирается в память небольшой ВМ.
# После каждого (пара «миграции + сервис» — у них общий этап build) кэш сборки чистится: этап build — гигабайты
# на сервис, на диске 20 ГБ все сразу не помещаются. Хранилище pnpm (cache mount) остаётся — пакеты не качаются заново
if ! docker image inspect "wine-boutique/web:${TAG}" > /dev/null 2>&1; then
  for service in identity catalog news reviews newsletter reservations tastings cellar requests loyalty; do
    ${compose} build "${service}-migrate" "${service}"
    docker builder prune --force --filter type!=exec.cachemount > /dev/null
  done
  ${compose} build web
  docker builder prune --force --filter type!=exec.cachemount > /dev/null
fi

${compose} up -d --remove-orphans --wait --wait-timeout 300
${compose} ps --format "table {{.Service}}\t{{.Status}}"

# Образы прошлых выкаток — с диска: откат на старый коммит соберёт их заново (~30 минут на 2 vCPU)
docker images --format '{{.Repository}}:{{.Tag}}' 'wine-boutique/*' | grep -v ":${TAG}$" | xargs -r docker rmi > /dev/null || true
docker image prune --force > /dev/null
echo "Выкачен коммит ${TAG}"
REMOTE
