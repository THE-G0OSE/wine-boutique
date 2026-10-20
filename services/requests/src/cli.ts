/**
 * Сертификаты, пока нет онлайн-оплаты и админки. В контейнере сервиса:
 *   docker compose exec requests node dist/cli.js certificate:pay WB-2026-000001
 * Отмечает сертификат оплаченным: его можно привязать к кабинету по номеру.
 */
import "reflect-metadata";
import { createCliContext, loadConfig } from "@wine/service-kit";
import { AppModule } from "./app.module.js";
import { configSchema } from "./config.js";
import { RequestsPrisma } from "./infrastructure/prisma/requests-prisma.js";

const [command, serial] = process.argv.slice(2);

const config = loadConfig(configSchema, { SERVICE_NAME: "requests-cli", ...process.env, LOG_LEVEL: "warn" });
const app = await createCliContext(AppModule.forRoot(config));
const prisma = app.get(RequestsPrisma);

try {
  const [, year, number] = /^WB-(\d{4})-(\d{6})$/.exec(serial ?? "") ?? [];
  if (command === "certificate:pay" && year) {
    const { count } = await prisma.certificate.updateMany({ where: { year: Number(year), number: Number(number), status: "awaiting_payment" }, data: { status: "active" } });
    console.log(count ? `Сертификат ${serial} оплачен` : `Нет неоплаченного сертификата ${serial}`);
    if (!count) process.exitCode = 1;
  } else {
    console.log("Команды: certificate:pay WB-2026-000001");
    process.exitCode = 2;
  }
} finally {
  await app.close();
}
