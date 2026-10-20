import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/** Шлюз из deploy/compose; другой порт — GATEWAY_URL */
export const GATEWAY = process.env.GATEWAY_URL ?? "http://localhost:18080";

const COMPOSE_FILE = fileURLToPath(new URL("../../../deploy/compose/compose.yaml", import.meta.url));

export const compose = (...args: string[]): string => execFileSync("docker", ["compose", "-f", COMPOSE_FILE, ...args], { encoding: "utf8" });

export const request = (path: string, init: RequestInit = {}): Promise<Response> => fetch(`${GATEWAY}${path}`, { redirect: "manual", ...init });

/** Пользователь и сессия через CLI identity — быстрее входа по телефону, когда номер не важен */
export const issueSession = (name: string): { userId: string; token: string } =>
  JSON.parse(compose("exec", "-T", "identity", "node", "dist/cli.js", "session:issue", "--name", name, "--json")) as { userId: string; token: string };

export const sessionCookie = (token: string) => ({ cookie: `__Host-session=${token}` });
