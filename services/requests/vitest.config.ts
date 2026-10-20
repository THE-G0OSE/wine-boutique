import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

// Nest берёт зависимости из метаданных декораторов — их генерирует SWC (esbuild/oxc в Vitest этого не умеют)
export default defineConfig({
  plugins: [
    swc.vite({
      module: { type: "es6" },
      jsc: {
        parser: { syntax: "typescript", decorators: true },
        transform: { legacyDecorator: true, decoratorMetadata: true },
      },
    }),
  ],
  // Тесты ходят в настоящий Postgres (Testcontainers): на медленном диске 5 секунд по умолчанию мало
  test: { include: ["src/**/*.spec.ts", "test/**/*.spec.ts"], testTimeout: 30_000 },
});
