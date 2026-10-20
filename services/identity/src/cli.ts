/**
 * Сессии для разработки, пока нет входа по телефону. В контейнере сервиса:
 *   docker compose exec identity node dist/cli.js session:issue --name "Анна Кузнецова"
 *   docker compose exec identity node dist/cli.js session:revoke <токен>
 * session:issue создаёт пользователя и сессию и печатает токен для cookie __Host-session.
 */
import "reflect-metadata";
import { parseArgs } from "node:util";
import { createCliContext, loadConfig } from "@wine/service-kit";
import { AppModule } from "./app.module.js";
import { IssueSession } from "./application/sessions.js";
import { configSchema } from "./config.js";
import { SESSION_COOKIE } from "./http/session-cookie.js";

const { positionals, values } = parseArgs({ allowPositionals: true, options: { name: { type: "string" }, json: { type: "boolean" } } });
const [command, token] = positionals;

const config = loadConfig(configSchema, { SERVICE_NAME: "identity-cli", ...process.env, LOG_LEVEL: "warn" });
const app = await createCliContext(AppModule.forRoot(config));
const sessions = app.get(IssueSession);

try {
  if (command === "session:issue" && values.name?.trim()) {
    const issued = await sessions.issueForNewUser(values.name);
    if (values.json) {
      console.log(JSON.stringify(issued));
    } else {
      console.log(`Пользователь: ${issued.userId}`);
      console.log(`Действует до: ${issued.expiresAt.toISOString()}`);
      console.log(`Cookie: ${SESSION_COOKIE}=${issued.token}`);
    }
  } else if (command === "session:revoke" && token) {
    const revoked = await sessions.revoke(token);
    console.log(revoked ? "Сессия отозвана" : "Такой действующей сессии нет");
    if (!revoked) process.exitCode = 1;
  } else {
    console.log('Команды: session:issue --name "Имя" [--json] | session:revoke <токен>');
    process.exitCode = 2;
  }
} finally {
  await app.close();
}
