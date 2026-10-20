import { defineConfig } from "prisma/config";

// DATABASE_URL — роль и база сервиса (postgresql://requests:…@host:5432/requests).
// Для prisma generate адрес не нужен, поэтому не env() (он падает без переменной)
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env.DATABASE_URL ?? "" },
});
