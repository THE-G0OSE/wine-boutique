import { defineConfig } from "@hey-api/openapi-ts";

/** zod-схемы запросов и ответов публичного API — для валидации в сервисах (Standard Schema в Nest 12) */
export default defineConfig({
  input: "./openapi/openapi.yaml",
  output: { path: "./openapi/generated/zod", postProcess: [] },
  plugins: [{ name: "zod", requests: true, responses: true }],
});
