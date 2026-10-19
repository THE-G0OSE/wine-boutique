/**
 * Модерация писем, пока нет админки. В контейнере сервиса:
 *   docker compose exec reviews node dist/cli.js list
 *   docker compose exec reviews node dist/cli.js publish <id> --topic tasting --greeting "Дорогая команда!" --signature "Анна" [--postscript "P.S. …"]
 *   docker compose exec reviews node dist/cli.js reject <id>
 * Работает через те же сценарии, что и сервис: правила публикации проверяет домен.
 */
import "reflect-metadata";
import { parseArgs } from "node:util";
import { NestFactory } from "@nestjs/core";
import { loadConfig } from "@wine/service-kit";
import { AppModule } from "./app.module.js";
import { Moderation } from "./application/letters.js";
import { configSchema } from "./config.js";
import { LetterRuleError, type ReviewTopic } from "./domain/letter.js";

const TOPICS: ReviewTopic[] = ["tasting", "gift", "reserve", "hall", "collection"];

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    topic: { type: "string" },
    greeting: { type: "string" },
    signature: { type: "string" },
    postscript: { type: "string" },
  },
});
const [command, id] = positionals;

const config = loadConfig(configSchema, { SERVICE_NAME: "reviews-cli", ...process.env, LOG_LEVEL: "warn" });
const app = await NestFactory.createApplicationContext(AppModule.forRoot(config), { logger: ["error", "warn"] });
const moderation = app.get(Moderation);

try {
  if (command === "list") {
    const pending = await moderation.pending();
    if (pending.length === 0) console.log("Писем на модерации нет");
    for (const letter of pending) {
      console.log(`\n${letter.id}  ${letter.receivedAt?.toISOString() ?? "—"}  ${letter.authorName}${letter.city ? `, ${letter.city}` : ""}`);
      console.log(letter.text);
    }
  } else if (command === "publish" && id) {
    const topic = values.topic as ReviewTopic | undefined;
    if (!topic || !TOPICS.includes(topic)) throw new LetterRuleError("missing_editorial_fields", `--topic: одно из ${TOPICS.join(", ")}`);
    await moderation.publish(id, {
      topic,
      greeting: values.greeting ?? "",
      signature: values.signature ?? "",
      postscript: values.postscript ?? null,
    });
    console.log(`Опубликовано: ${id}`);
  } else if (command === "reject" && id) {
    await moderation.reject(id);
    console.log(`Отклонено: ${id}`);
  } else {
    console.log("Команды: list | publish <id> --topic … --greeting … --signature … [--postscript …] | reject <id>");
    process.exitCode = 2;
  }
} catch (error) {
  if (!(error instanceof LetterRuleError)) throw error;
  console.error(`${error.code}: ${error.message}`);
  process.exitCode = 1;
} finally {
  await app.close();
}
