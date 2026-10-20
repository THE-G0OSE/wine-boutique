import "reflect-metadata";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { PrismaPg } from "@prisma/adapter-pg";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { zGetSessionResponse, zRegisterGuestResponse, zRequestPhoneCodeResponse, zVerifyPhoneCodeResponse } from "@wine/contracts/openapi/zod";
import { loadConfig } from "@wine/service-kit";
import { createTestApp, migrateDatabase } from "@wine/service-kit/testing";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { AppModule } from "../src/app.module.js";
import { configSchema } from "../src/config.js";
import { LogCodeSender } from "../src/infrastructure/log-code-sender.js";
import { PrismaClient } from "../src/infrastructure/prisma/generated/client.js";

/** Последний отправленный код по номеру — перехватываем «SMS» в лог */
const sent = new Map<string, string>();

describe("вход по телефону на настоящем Postgres", () => {
  let pg: StartedPostgreSqlContainer;
  let prisma: PrismaClient;
  let app: NestFastifyApplication;

  beforeAll(async () => {
    vi.spyOn(LogCodeSender.prototype, "send").mockImplementation(async (phone, code) => {
      sent.set(phone, code);
    });
    pg = await new PostgreSqlContainer("postgres:18.6-alpine").start();
    const DATABASE_URL = pg.getConnectionUri();
    await migrateDatabase(DATABASE_URL);
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }) });
    const config = loadConfig(configSchema, { SERVICE_NAME: "identity", NODE_ENV: "test", LOG_LEVEL: "silent", DATABASE_URL });
    app = await createTestApp(AppModule.forRoot(config));
  }, 180_000);

  afterAll(async () => {
    await app?.close();
    await prisma?.$disconnect();
    await pg?.stop();
  });

  const post = (url: string, payload: object, headers: Record<string, string> = {}) =>
    app.inject({ method: "POST", url: `/api/auth${url}`, payload, headers, remoteAddress: `10.7.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` });
  const cookieOf = (setCookie: unknown) => String(setCookie).split(";")[0];
  /** Код для номера: сбрасываем ограничение «раз в минуту», состарив прошлые коды */
  const freshCode = async (phone: string) => {
    await prisma.phoneCode.updateMany({ where: { phone }, data: { createdAt: new Date(Date.now() - 61_000) } });
    const res = await post("/phone/code", { phone });
    expect(res.statusCode, res.body).toBe(202);
    return sent.get(phone)!;
  };

  it("код: 202 и сроки; в базе — только хеш; второй раньше чем через минуту — 429 с retryAfter", async () => {
    const res = await post("/phone/code", { phone: "+79160000001" });
    expect(res.statusCode).toBe(202);
    expect(zRequestPhoneCodeResponse.parse(res.json())).toEqual({ resendAfter: 60, expiresIn: 300 });
    const code = sent.get("+79160000001")!;
    expect(code).toMatch(/^\d{4}$/);
    const stored = await prisma.phoneCode.findFirstOrThrow({ where: { phone: "+79160000001" } });
    expect(Buffer.from(stored.codeHash).toString("utf8")).not.toContain(code);

    const again = await post("/phone/code", { phone: "+79160000001" });
    expect(again.statusCode).toBe(429);
    expect(again.json()).toMatchObject({ code: "too_many_requests", details: { retryAfter: expect.any(Number) } });
    expect((await post("/phone/code", { phone: "89160000001" })).json()).toMatchObject({ code: "invalid_phone" });
  });

  it("новый номер: код → токен регистрации → карта гостя, cookie и сессия; младше 18 — 422 underage", async () => {
    const phone = "+79160000002";
    const verify = await post("/phone/verify", { phone, code: await freshCode(phone) });
    expect(verify.statusCode, verify.body).toBe(200);
    const verification = zVerifyPhoneCodeResponse.parse(verify.json());
    expect(verification.status).toBe("needs_registration");
    expect(verify.headers["set-cookie"]).toBeUndefined();
    const registrationToken = verification.status === "needs_registration" ? verification.registrationToken : "";

    const body = { registrationToken, name: " Анна Кузнецова ", birthDate: "1990-10-16", email: "anna@example.ru", consents: { personalData: true, marketing: true } };
    const young = await post("/register", { ...body, birthDate: "2010-01-01" });
    expect(young.statusCode).toBe(422);
    expect(young.json()).toMatchObject({ code: "underage" });

    const registered = await post("/register", body);
    expect(registered.statusCode, registered.body).toBe(201);
    expect(zRegisterGuestResponse.parse(registered.json())).toMatchObject({ user: { name: "Анна Кузнецова", initials: "АК" } });
    const cookie = cookieOf(registered.headers["set-cookie"]);
    expect(cookie).toMatch(/^__Host-session=/);

    const session = await app.inject({ method: "GET", url: "/api/auth/session", headers: { cookie } });
    expect(zGetSessionResponse.parse(session.json()).user?.name).toBe("Анна Кузнецова");
    const user = await prisma.user.findUniqueOrThrow({ where: { phone } });
    expect(user).toMatchObject({ email: "anna@example.ru", marketingConsent: true, consentVersion: "2026-10-20" });
    expect(user.cardNumber).toMatch(/^[1-9]\d{11}$/);

    // Токен одноразовый
    expect((await post("/register", body)).json()).toMatchObject({ code: "registration_expired" });
  });

  it("известный номер: код → сразу вход с cookie", async () => {
    const phone = "+79160000002";
    const res = await post("/phone/verify", { phone, code: await freshCode(phone) });
    expect(zVerifyPhoneCodeResponse.parse(res.json())).toMatchObject({ status: "signed_in", user: { name: "Анна Кузнецова" } });
    expect(cookieOf(res.headers["set-cookie"])).toMatch(/^__Host-session=/);
  });

  it("неверный код: остаток попыток, после пятой код сгорает; верный код второй раз не принимается", async () => {
    const phone = "+79160000003";
    const code = await freshCode(phone);
    const wrong = code === "0000" ? "1111" : "0000";
    for (let left = 4; left >= 1; left--) {
      const res = await post("/phone/verify", { phone, code: wrong });
      expect(res.statusCode).toBe(422);
      expect(res.json()).toMatchObject({ code: "invalid_code", details: { attemptsLeft: left } });
    }
    expect((await post("/phone/verify", { phone, code: wrong })).json()).toMatchObject({ code: "code_expired" });
    expect((await post("/phone/verify", { phone, code })).statusCode).toBe(410);

    const next = await freshCode(phone);
    expect((await post("/phone/verify", { phone, code: next })).statusCode).toBe(200);
    expect((await post("/phone/verify", { phone, code: next })).json()).toMatchObject({ code: "code_expired" });
  });

  it("не больше пяти кодов в час на номер", async () => {
    const phone = "+79160000004";
    for (let i = 0; i < 5; i++) await freshCode(phone);
    await prisma.phoneCode.updateMany({ where: { phone }, data: { createdAt: new Date(Date.now() - 2 * 60_000) } });
    const res = await post("/phone/code", { phone });
    expect(res.statusCode).toBe(429);
    expect(res.json()).toMatchObject({ code: "too_many_requests" });
  });

  it("выход: сессия отозвана, cookie стёрта; гость — тоже 204", async () => {
    const phone = "+79160000002";
    const res = await post("/phone/verify", { phone, code: await freshCode(phone) });
    const cookie = cookieOf(res.headers["set-cookie"]);
    const logout = await post("/logout", {}, { cookie });
    expect(logout.statusCode).toBe(204);
    expect(String(logout.headers["set-cookie"])).toMatch(/^__Host-session=; .*Expires=Thu, 01 Jan 1970/);
    expect((await app.inject({ method: "GET", url: "/api/auth/session", headers: { cookie } })).json()).toEqual({ user: null });
    expect((await post("/logout", {})).statusCode).toBe(204);
  });
});
