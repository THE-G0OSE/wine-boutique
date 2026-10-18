/**
 * OpenTelemetry для сервиса. Подключается до загрузки приложения:
 *   node --import @wine/service-kit/telemetry dist/main.js
 *
 * Те же автоинструментации, что у `@opentelemetry/auto-instrumentations-node/register`,
 * и те же переменные OTEL_* (экспортёр, адрес коллектора, имя сервиса; OTEL_SDK_DISABLED=true — выключено),
 * но без шума: пробы /health/* (их дёргают Docker и Traefik каждые несколько секунд), fs и dns не трассируются.
 */
import type { IncomingMessage } from "node:http";
import { register } from "node:module";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { NodeSDK } from "@opentelemetry/sdk-node";

if (process.env.OTEL_SDK_DISABLED !== "true") {
  // ESM: перехват импортов модулей, чтобы инструментации могли их обернуть
  register("@opentelemetry/instrumentation/hook.mjs", import.meta.url);

  const sdk = new NodeSDK({
    instrumentations: [
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-http": {
          ignoreIncomingRequestHook: (req: IncomingMessage) => req.url?.startsWith("/health/") ?? false,
        },
        "@opentelemetry/instrumentation-fs": { enabled: false },
        "@opentelemetry/instrumentation-dns": { enabled: false },
        "@opentelemetry/instrumentation-net": { enabled: false },
      }),
    ],
  });
  sdk.start();

  const shutdown = () => void sdk.shutdown();
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
}
