// ESLint для бэкенда: сервисы (services/*) и @wine/service-kit.
// Каждый пакет подключает его своим eslint.config.js. Слои — docs/backend-architecture.md §4.
import js from "@eslint/js";
import boundaries from "eslint-plugin-boundaries";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * Слои внутри сервиса. Файлы в корне src (main.ts, app.module.ts, config.ts) — корень композиции:
 * они не относятся к слоям и собирают всё.
 */
const LAYERS = [
  { type: "domain", pattern: "src/domain" },
  { type: "application", pattern: "src/application" },
  { type: "http", pattern: "src/http" },
  { type: "grpc", pattern: "src/grpc" },
  { type: "events", pattern: "src/events" },
  { type: "infrastructure", pattern: "src/infrastructure" },
];

const allow = (from, ...to) => ({
  from: { element: { type: from } },
  allow: { to: { element: { types: { anyOf: [from, ...to] } } } },
});

export default tseslint.config(
  { ignores: ["dist", "coverage"] },
  {
    files: ["**/*.ts"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: { ecmaVersion: 2024, globals: globals.node },
    plugins: { boundaries },
    settings: {
      "import/resolver": { typescript: { alwaysTryTypes: true } },
      "boundaries/elements": LAYERS,
      "boundaries/include": ["src/**/*.ts"],
    },
    rules: {
      // Внутри сервиса: http | grpc | events → application → domain; infrastructure реализует порты application
      "boundaries/dependencies": [
        2,
        {
          default: "disallow",
          policies: [
            allow("domain"),
            allow("application", "domain"),
            allow("http", "application", "domain"),
            allow("grpc", "application", "domain"),
            allow("events", "application", "domain"),
            allow("infrastructure", "application", "domain"),
          ],
        },
      ],
      // Классы Nest с DI объявляют параметры конструктора, даже если тело пустое
      "@typescript-eslint/no-extraneous-class": "off",
    },
  },
  {
    // Домен — чистый TypeScript: без фреймворков, ORM, транспорта и сгенерированных контрактов
    files: ["src/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@nestjs/*", "@prisma/*", "*/generated/*", "fastify", "@grpc/*", "@nats-io/*", "nats"], message: "Домен не знает про фреймворк, ORM и транспорт" },
            { group: ["@wine/contracts", "@wine/contracts/*"], message: "Домен не зависит от контрактов API — переводите их в доменные типы на краю (http, grpc, events)" },
          ],
        },
      ],
    },
  }
);
