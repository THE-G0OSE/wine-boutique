import { defineConfig } from "@hey-api/openapi-ts";

/** zod-схемы запросов и ответов публичного API — для валидации в сервисах (Standard Schema в Nest 12) */
export default defineConfig({
  input: "./openapi/openapi.yaml",
  output: { path: "./openapi/generated/zod", postProcess: [] },
  // date-time со смещением пояса («2026-10-21T15:00:00+03:00»): время самовывоза — по часам бутика
  plugins: [{ name: "zod", requests: true, responses: true, dates: { offset: true } }],
});
