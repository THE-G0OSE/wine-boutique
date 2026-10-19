import { defineConfig } from "prisma/config";

// DATABASE_URL — роль и база сервиса (postgresql://catalog:…@host:5432/catalog).
// Для prisma generate адрес не нужен, поэтому не env() (он падает без переменной)
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "node --enable-source-maps dist/seed.js" },
  datasource: { url: process.env.DATABASE_URL ?? "" },
});
