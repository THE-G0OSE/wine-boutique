#!/bin/sh
# База и роль на сервис (docs/backend-architecture.md §5). Роль видит только свою базу.
# Пароль ролей в разработке — из DEV_DB_PASSWORD; на VPS базы создаются с отдельными секретами.
set -eu
for db in ${SERVICE_DATABASES}; do
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres <<SQL
CREATE ROLE ${db} LOGIN PASSWORD '${DEV_DB_PASSWORD}';
CREATE DATABASE ${db} OWNER ${db};
REVOKE ALL ON DATABASE ${db} FROM PUBLIC;
SQL
done
