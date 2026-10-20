#!/bin/sh
# База и роль на сервис (docs/backend-architecture.md §5). Роль видит только свою базу.
# Запускается одноразовым контейнером postgres-init при каждом `compose up`: недостающие роли и базы досоздаются,
# существующие не трогаются — новый сервис получает базу и на старом томе Postgres.
# Пароль роли — из <БАЗА>_DB_PASSWORD (на VPS — свой секрет у каждого сервиса), в разработке — общий DEV_DB_PASSWORD.
set -eu
for db in ${SERVICE_DATABASES}; do
  password_var="$(echo "${db}" | tr '[:lower:]' '[:upper:]')_DB_PASSWORD"
  password="$(printenv "${password_var}" || true)"
  password="${password:-${DEV_DB_PASSWORD:?нет ни ${password_var}, ни DEV_DB_PASSWORD}}"
  # CREATEDB — только для разработки: prisma migrate dev создаёт теневую базу
  createdb_option="NOCREATEDB"
  if [ "${ROLE_CREATEDB:-false}" = true ]; then createdb_option="CREATEDB"; fi
  psql -v ON_ERROR_STOP=1 --dbname postgres -v db="${db}" -v password="${password}" -v createdb="${createdb_option}" <<'SQL'
SELECT format('CREATE ROLE %I LOGIN %s PASSWORD %L', :'db', :'createdb', :'password')
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = :'db') \gexec
SELECT format('CREATE DATABASE %I OWNER %I', :'db', :'db')
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = :'db') \gexec
SELECT format('REVOKE ALL ON DATABASE %I FROM PUBLIC', :'db') \gexec
SQL
  echo "база ${db}: готова"
done
