import { defineConfig } from "vitest/config";

// Тесты ходят в поднятый Compose — последовательно и с запасом по времени на CLI в контейнере
export default defineConfig({
  test: { include: ["src/**/*.e2e.ts"], fileParallelism: false, testTimeout: 30_000, hookTimeout: 60_000 },
});
