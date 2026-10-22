#!/usr/bin/env bash
# Публичная ссылка на дашборд-витрину (только чтение, без входа). Один раз на VPS, после выкатки с профилем observability:
#   ssh <vps> 'bash /opt/wine-boutique/app/deploy/observability/publish-showcase.sh'
# Ссылка хранится в базе Grafana (том lgtm-data) — переживает перезапуски; повторный запуск печатает существующую.
set -euo pipefail
grafana="docker exec wine-boutique-otel-lgtm-1 curl -fsS -H Content-Type:application/json"
uid=wine-showcase
domain="$(sed -n 's/^API_DOMAIN=//p' "${WINE_HOME:-/opt/wine-boutique}/.env")"

existing="$(${grafana} "http://localhost:3000/api/dashboards/uid/${uid}/public-dashboards" 2> /dev/null || true)"
token="$(echo "${existing}" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4 || true)"
if [[ -z "${token}" ]]; then
  created="$(${grafana} -X POST "http://localhost:3000/api/dashboards/uid/${uid}/public-dashboards" \
    -d '{"isEnabled":true,"share":"public","timeSelectionEnabled":true,"annotationsEnabled":false}')"
  token="$(echo "${created}" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)"
fi
echo "https://${domain}/grafana/public-dashboards/${token}"
