import type { HealthIndicatorFunction } from "@nestjs/terminus";

/**
 * Проверка готовности «база отвечает»: `databaseCheck(() => prisma.$queryRaw("SELECT 1"))` или любой другой пинг.
 * Ошибка соединения → /health/ready отдаёт 503, и шлюз перестаёт слать запросы на этот экземпляр.
 */
export const databaseCheck =
  (ping: () => Promise<unknown>, key = "database"): HealthIndicatorFunction =>
  async () => {
    await ping();
    return { [key]: { status: "up" } };
  };
