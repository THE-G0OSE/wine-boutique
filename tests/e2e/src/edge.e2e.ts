import { zGetSessionResponse } from "@wine/contracts/openapi/zod";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { compose, issueSession, request, sessionCookie } from "./gateway.js";

/**
 * Край: что Traefik и сервисы делают с запросом снаружи (docs/backend-plan.md, B5).
 * Тестовые маршруты /api/_dev/* — из deploy/traefik/dev/edge-check.yml, за ними whoami с эхом заголовков.
 */
describe("край: шлюз и сессия", () => {
  const SPOOFED = "00000000-0000-7000-8000-000000000000";
  let user: { userId: string; token: string };

  beforeAll(() => {
    user = issueSession("Анна Кузнецова (e2e)");
  });

  afterAll(() => {
    compose("exec", "-T", "postgres", "psql", "-U", "postgres", "-d", "identity", "-qc", "DELETE FROM users WHERE name LIKE '%(e2e)'");
  });

  /** Заголовки запроса, которые дошли до сервиса за шлюзом, — как их показал whoami */
  const echoedUserIds = async (res: Response): Promise<string[]> =>
    (await res.text())
      .split("\n")
      .filter((line) => /^x-user-id:/i.test(line))
      .map((line) => line.split(":")[1]?.trim() ?? "");

  it("заголовок пользователя снаружи до сервиса не доходит — в любом регистре", async () => {
    const res = await request("/api/_dev/echo", { headers: { "X-User-Id": SPOOFED } });
    expect(res.status).toBe(200);
    expect(await echoedUserIds(res)).toEqual([]);
    const lower = await request("/api/_dev/echo", { headers: { "x-user-id": SPOOFED } });
    expect(await echoedUserIds(lower)).toEqual([]);
  });

  it("защищённый путь без сессии — 401 от identity в формате контракта, даже с поддельным заголовком", async () => {
    const res = await request("/api/_dev/protected", { headers: { "X-User-Id": SPOOFED } });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ code: "unauthorized", message: "Войдите, чтобы продолжить" });
  });

  it("защищённый путь с сессией — сервис получает id пользователя от шлюза, а не подделку", async () => {
    const res = await request("/api/_dev/protected", { headers: { ...sessionCookie(user.token), "X-User-Id": SPOOFED } });
    expect(res.status).toBe(200);
    expect(await echoedUserIds(res)).toEqual([user.userId]);
    // Изменяющий запрос тоже проходит проверку сессии
    const post = await request("/api/_dev/protected", { method: "POST", headers: sessionCookie(user.token), body: "{}" });
    expect(post.status).toBe(200);
    expect(await echoedUserIds(post)).toEqual([user.userId]);
  });

  it("GET /api/auth/session по cookie — пользователь с инициалами", async () => {
    const res = await request("/api/auth/session", { headers: sessionCookie(user.token) });
    expect(zGetSessionResponse.parse(await res.json())).toEqual({ user: { id: user.userId, name: "Анна Кузнецова (e2e)", initials: "АК", cardNumber: null } });
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("после отзыва сессии — снова гость и 401", async () => {
    const other = issueSession("Пётр (e2e)");
    expect((await request("/api/_dev/protected", { headers: sessionCookie(other.token) })).status).toBe(200);
    compose("exec", "-T", "identity", "node", "dist/cli.js", "session:revoke", other.token);
    expect((await request("/api/_dev/protected", { headers: sessionCookie(other.token) })).status).toBe(401);
    expect(await (await request("/api/auth/session", { headers: sessionCookie(other.token) })).json()).toEqual({ user: null });
  });

  it("внутренний путь identity снаружи недоступен", async () => {
    expect((await request("/internal/forward-auth", { headers: sessionCookie(user.token) })).status).toBe(404);
    expect((await request("/api/internal/forward-auth", { headers: sessionCookie(user.token) })).status).toBe(404);
  });
});

describe("край: формы", () => {
  const json = (body: unknown, headers: Record<string, string> = {}): RequestInit => ({
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });

  it("форма с чужого сайта — 403 forbidden_origin; со своего — доходит до проверки данных", async () => {
    const evil = await request("/api/newsletter", json({ email: "e2e@example.ru" }, { origin: "https://evil.example" }));
    expect(evil.status).toBe(403);
    expect(await evil.json()).toEqual({ code: "forbidden_origin", message: "Запрос пришёл с чужого сайта" });
    // Неверный адрес — чтобы проверить пропуск без записи в базу
    const own = await request("/api/newsletter", json({ email: "не-адрес" }, { origin: "http://localhost:5174" }));
    expect(own.status).toBe(422);
    expect(await own.json()).toMatchObject({ code: "invalid_email" });
  });

  it("лимит частоты не обойти подменой X-Forwarded-For — шлюз ставит адрес клиента сам", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      const res = await request("/api/reviews", json({ name: "", text: "" }, { "x-forwarded-for": `203.0.113.${i + 1}` }));
      statuses.push(res.status);
    }
    expect(statuses.every((status) => status === 422 || status === 429)).toBe(true);
    expect(statuses.at(-1)).toBe(429);
  });

  it("маршруты — по целым сегментам: /api/newsletter не уходит в news", async () => {
    expect((await request("/api/newsx")).status).toBe(404);
    expect((await request("/api/newsletterx", json({}))).status).toBe(404);
  });
});
