import "reflect-metadata";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { PrismaPg } from "@prisma/adapter-pg";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { zGetSessionResponse } from "@wine/contracts/openapi/zod";
import { loadConfig } from "@wine/service-kit";
import { createTestApp, migrateDatabase, missingOperations } from "@wine/service-kit/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../src/app.module.js";
import { IssueSession } from "../src/application/sessions.js";
import { configSchema } from "../src/config.js";
import { hashSessionToken, SESSION_TOUCH_INTERVAL_MS } from "../src/domain/session.js";
import { PrismaClient } from "../src/infrastructure/prisma/generated/client.js";

describe("identity на настоящем Postgres", () => {
  let pg: StartedPostgreSqlContainer;
  let prisma: PrismaClient;
  let app: NestFastifyApplication;
  let sessions: IssueSession;

  beforeAll(async () => {
    pg = await new PostgreSqlContainer("postgres:18.6-alpine").start();
    const DATABASE_URL = pg.getConnectionUri();
    await migrateDatabase(DATABASE_URL);
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }) });
    const config = loadConfig(configSchema, { SERVICE_NAME: "identity", NODE_ENV: "test", LOG_LEVEL: "silent", DATABASE_URL });
    app = await createTestApp(AppModule.forRoot(config));
    sessions = app.get(IssueSession);
  }, 180_000);

  afterAll(async () => {
    await app?.close();
    await prisma?.$disconnect();
    await pg?.stop();
  });

  const cookie = (token: string) => ({ cookie: `theme=dark; __Host-session=${token}` });
  const getSession = (headers: Record<string, string> = {}) => app.inject({ method: "GET", url: "/api/auth/session", headers });
  const forwardAuth = (headers: Record<string, string> = {}) => app.inject({ method: "GET", url: "/internal/forward-auth", headers });

  it("реализует все свои операции контракта", async () => {
    expect(await missingOperations(app, "identity")).toEqual([]);
  });

  it("без cookie — гость, по схеме контракта, без кэша", async () => {
    const res = await getSession();
    expect(res.statusCode).toBe(200);
    expect(zGetSessionResponse.parse(res.json())).toEqual({ user: null });
    expect(res.headers["cache-control"]).toBe("no-store");
  });

  it("с cookie сессии — пользователь с инициалами; в базе только хеш токена", async () => {
    const { userId, token } = await sessions.issueForNewUser(" Анна Кузнецова ");
    const res = await getSession(cookie(token));
    expect(zGetSessionResponse.parse(res.json())).toEqual({ user: { id: userId, name: "Анна Кузнецова", initials: "АК", cardNumber: null } });
    // Только что выданную сессию продлевать рано — cookie не переписываем
    expect(res.headers["set-cookie"]).toBeUndefined();
    const stored = await prisma.session.findFirstOrThrow({ where: { userId } });
    expect(Buffer.from(stored.tokenHash).equals(hashSessionToken(token))).toBe(true);
    expect(Buffer.from(stored.tokenHash).toString("utf8")).not.toContain(token);
  });

  it("чужой, битый, истёкший и отозванный токен — гость", async () => {
    expect((await getSession(cookie("x".repeat(43)))).json()).toEqual({ user: null });
    expect((await getSession(cookie("не-токен"))).json()).toEqual({ user: null });

    const expired = await sessions.issueForNewUser("Пётр");
    await prisma.session.updateMany({ where: { userId: expired.userId }, data: { expiresAt: new Date(Date.now() - 1000) } });
    expect((await getSession(cookie(expired.token))).json()).toEqual({ user: null });

    const revoked = await sessions.issueForNewUser("Ольга");
    expect(await sessions.revoke(revoked.token)).toBe(true);
    expect((await getSession(cookie(revoked.token))).json()).toEqual({ user: null });
    expect(await sessions.revoke(revoked.token)).toBe(false);
  });

  it("сессия продлевается не чаще раза в час — и cookie получает новый срок", async () => {
    const { userId, token, expiresAt } = await sessions.issueForNewUser("Мария");
    const hourAgo = new Date(Date.now() - SESSION_TOUCH_INTERVAL_MS - 1000);
    await prisma.session.updateMany({ where: { userId }, data: { lastSeenAt: hourAgo } });
    const res = await getSession(cookie(token));
    const setCookie = String(res.headers["set-cookie"]);
    expect(setCookie).toMatch(new RegExp(`^__Host-session=${token}; Path=/; Expires=.+; HttpOnly; Secure; SameSite=Lax$`));
    const renewed = await prisma.session.findFirstOrThrow({ where: { userId } });
    expect(renewed.expiresAt.getTime()).toBeGreaterThanOrEqual(expiresAt.getTime());
    expect(renewed.lastSeenAt.getTime()).toBeGreaterThan(hourAgo.getTime());
  });

  it("forward-auth: вошёл — 200 и X-User-Id, гость — 401 в формате контракта", async () => {
    const { userId, token } = await sessions.issueForNewUser("Анна");
    const ok = await forwardAuth(cookie(token));
    expect(ok.statusCode).toBe(200);
    expect(ok.headers["x-user-id"]).toBe(userId);
    const guest = await forwardAuth();
    expect(guest.statusCode).toBe(401);
    expect(guest.json()).toEqual({ code: "unauthorized", message: "Войдите, чтобы продолжить" });
    expect(guest.headers["x-user-id"]).toBeUndefined();
    // Traefik может спросить и не GET — ответ тот же
    const post = await app.inject({ method: "POST", url: "/internal/forward-auth", headers: cookie(token) });
    expect(post.headers["x-user-id"]).toBe(userId);
  });

  it("forward-auth — не публичный путь: под /api его нет", async () => {
    expect((await app.inject({ method: "GET", url: "/api/internal/forward-auth" })).statusCode).toBe(404);
  });

  it("неизвестный путь — 404 в формате контракта; x-request-id шлюза прокидывается", async () => {
    const res = await app.inject({ method: "GET", url: "/api/auth/nope", headers: { "x-request-id": "req-42" } });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({ code: "not_found", message: "Такого адреса нет" });
    expect(res.headers["x-request-id"]).toBe("req-42");
  });

  it("пробы здоровья — вне /api, готовность проверяет базу", async () => {
    expect((await app.inject({ method: "GET", url: "/health/live" })).statusCode).toBe(200);
    expect((await app.inject({ method: "GET", url: "/health/ready" })).statusCode).toBe(200);
  });
});
