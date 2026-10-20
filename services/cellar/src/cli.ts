/**
 * Договоры хранения, пока нет админки. В контейнере сервиса:
 *   docker compose exec cellar node dist/cli.js lease:assign --user <id гостя> --cell 204 --until 2027-10-16 [--demo]
 * Ячейка переходит гостю и становится занятой; --demo — опись бутылок из макета кабинета.
 */
import "reflect-metadata";
import { parseArgs } from "node:util";
import { createCliContext, loadConfig } from "@wine/service-kit";
import { AppModule } from "./app.module.js";
import { configSchema } from "./config.js";
import { assignLease } from "./infrastructure/prisma/assign-lease.js";
import { CellarPrisma } from "./infrastructure/prisma/cellar-prisma.js";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { user: { type: "string" }, cell: { type: "string" }, until: { type: "string" }, demo: { type: "boolean" } },
});

const config = loadConfig(configSchema, { SERVICE_NAME: "cellar-cli", ...process.env, LOG_LEVEL: "warn" });
const app = await createCliContext(AppModule.forRoot(config));

try {
  if (positionals[0] === "lease:assign" && values.user && values.cell && /^\d{4}-\d{2}-\d{2}$/.test(values.until ?? "")) {
    const { leaseId } = await assignLease(app.get(CellarPrisma), { userId: values.user, cellNumber: values.cell, paidUntil: values.until!, demo: values.demo });
    console.log(`Ячейка ${values.cell} — гостю ${values.user}, договор ${leaseId}`);
  } else {
    console.log("Команды: lease:assign --user <id> --cell 204 --until 2027-10-16 [--demo]");
    process.exitCode = 2;
  }
} finally {
  await app.close();
}
