#!/bin/sh
# База и роль на сервис (docs/backend-architecture.md §5). Роль видит только свою базу.
# Пароль роли — из <БАЗА>_DB_PASSWORD (на VPS — свой секрет у каждого сервиса), в разработке — общий DEV_DB_PASSWORD.
# Скрипт выполняется один раз — при создании тома Postgres.
set -eu
for db in ${SERVICE_DATABASES}; do
  password_var="$(echo "${db}" | tr '[:lower:]' '[:upper:]')_DB_PASSWORD"
  password="$(printenv "${password_var}" || true)"
  password="${password:-${DEV_DB_PASSWORD:?нет ни ${password_var}, ни DEV_DB_PASSWORD}}"
  # CREATEDB — только для разработки: prisma migrate dev создаёт теневую базу
  createdb_option="NOCREATEDB"
  if [ "${ROLE_CREATEDB:-false}" = true ]; then createdb_option="CREATEDB"; fi
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -v password="${password}" <<SQL
CREATE ROLE ${db} LOGIN ${createdb_option} PASSWORD :'password';
CREATE DATABASE ${db} OWNER ${db};
REVOKE ALL ON DATABASE ${db} FROM PUBLIC;
SQL
done
