import "reflect-metadata";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { PrismaPg } from "@prisma/adapter-pg";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { zGetProfileResponse, zUpdateProfileResponse } from "@wine/contracts/openapi/zod";
import { loadConfig } from "@wine/service-kit";
import { createTestApp, migrateDatabase, missingOperations } from "@wine/service-kit/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../src/app.module.js";
import { IssueSession } from "../src/application/sessions.js";
import { configSchema } from "../src/config.js";
import { PrismaClient } from "../src/infrastructure/prisma/generated/client.js";

const CHROME = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36";
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

describe("кабинет: профиль identity на настоящем Postgres", () => {
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

  /** Гость с картой и двумя устройствами; запросы — как после шлюза: X-User-Id и cookie */
  const guest = async () => {
    const { id } = await prisma.user.create({
      data: { name: "Анна Королёва", phone: `+7916${Math.floor(1_000_000 + Math.random() * 8_999_999)}`, birthDate: new Date("1990-10-16"), cardNumber: String(Date.now()).padStart(12, "4").slice(-12) },
    });
    const phone = await sessions.issue(id, new Date(Date.now() - 86_400_000), IPHONE);
    const browser = await sessions.issue(id, new Date(), CHROME);
    return { id, headers: { "x-user-id": id, cookie: `__Host-session=${browser.token}` }, phoneToken: phone.token };
  };

  it("реализует все свои операции контракта", async () => {
    expect(await missingOperations(app, "identity")).toEqual([]);
  });

  it("профиль: данные карты, уведомления по умолчанию, устройства с текущим", async () => {
    const { id, headers } = await guest();
    const res = await app.inject({ method: "GET", url: "/api/me", headers });
    expect(res.headers["cache-control"]).toBe("private, no-store");
    const profile = zGetProfileResponse.parse(res.json());
    expect(profile).toMatchObject({ id, name: "Анна Королёва", birthDate: "1990-10-16", tastes: [], favoriteBoutiqueId: null });
    expect(profile.notifications.arrivals).toEqual({ sms: false, email: true });
    expect(profile.sessions.map(({ device, current }) => ({ device, current }))).toEqual([
      { device: "Chrome · Windows", current: true },
      { device: "Safari · iPhone", current: false },
    ]);
  });

  it("изменение: имя, почта, бутик, вкусы без повторов, уведомления; пустое имя — 422", async () => {
    const { headers } = await guest();
    const notifications = {
      reservations: { sms: false, email: true },
      tastings: { sms: true, email: true },
      arrivals: { sms: false, email: false },
      cell: { sms: true, email: false },
      monthly: { sms: false, email: false },
    };
    const res = await app.inject({
      method: "PATCH",
      url: "/api/me",
      headers,
      payload: { name: " Анна К. ", email: "anna@example.ru", favoriteBoutiqueId: "cellar", tastes: ["aged", "burgundy"], notifications },
    });
    expect(res.statusCode, res.body).toBe(200);
    expect(zUpdateProfileResponse.parse(res.json())).toMatchObject({ name: "Анна К.", email: "anna@example.ru", favoriteBoutiqueId: "cellar", tastes: ["aged", "burgundy"], notifications });
    expect((await app.inject({ method: "GET", url: "/api/auth/session", headers })).json()).toMatchObject({ user: { name: "Анна К.", initials: "АК" } });

    const cleared = await app.inject({ method: "PATCH", url: "/api/me", headers, payload: { email: null } });
    expect(cleared.json()).toMatchObject({ email: null });
    const empty = await app.inject({ method: "PATCH", url: "/api/me", headers, payload: { name: "  " } });
    expect(empty.statusCode).toBe(422);
    expect(empty.json()).toMatchObject({ code: "invalid_profile" });
  });

  it("выйти на всех устройствах: все сессии отозваны, cookie стёрта", async () => {
    const { id, headers, phoneToken } = await guest();
    const res = await app.inject({ method: "POST", url: "/api/me/sign-out-everywhere", headers });
    expect(res.statusCode).toBe(204);
    expect(String(res.headers["set-cookie"])).toMatch(/^__Host-session=;/);
    expect(await prisma.session.count({ where: { userId: id, revokedAt: null } })).toBe(0);
    expect((await app.inject({ method: "GET", url: "/api/auth/session", headers: { cookie: `__Host-session=${phoneToken}` } })).json()).toEqual({ user: null });
  });

  it("удаление кабинета: пользователя и сессий нет", async () => {
    const { id, headers } = await guest();
    expect((await app.inject({ method: "DELETE", url: "/api/me", headers })).statusCode).toBe(204);
    expect(await prisma.user.count({ where: { id } })).toBe(0);
    expect(await prisma.session.count({ where: { userId: id } })).toBe(0);
  });

  it("без пользователя от шлюза — 401 в формате контракта", async () => {
    const res = await app.inject({ method: "GET", url: "/api/me" });
    expect(res.statusCode).toBe(401);
    expect(res.json()).toEqual({ code: "unauthorized", message: "Войдите, чтобы продолжить" });
  });

  it("необязательная сессия для форм: вошёл — 200 и X-User-Id, гость — 200 без заголовка", async () => {
    const { id, headers } = await guest();
    const signed = await app.inject({ method: "POST", url: "/internal/forward-auth-optional", headers: { cookie: headers.cookie } });
    expect(signed.statusCode).toBe(200);
    expect(signed.headers["x-user-id"]).toBe(id);
    const anonymous = await app.inject({ method: "GET", url: "/internal/forward-auth-optional" });
    expect(anonymous.statusCode).toBe(200);
    expect(anonymous.headers["x-user-id"]).toBeUndefined();
  });
});
