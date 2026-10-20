import { Inject, Injectable, type CanActivate, type ExecutionContext } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { SERVICE_CONFIG, type BaseConfig } from "../config/config.js";
import { ApiError } from "./api-error.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Защита от CSRF: изменяющий запрос из браузера принимается только с сайтов из ALLOWED_ORIGINS.
 * Браузер всегда ставит Origin на кросс-сайтовый POST; без Origin смотрим Sec-Fetch-Site.
 * Запросы не из браузера (curl, сервисы) Origin не шлют и проходят — CSRF возможен только через браузер.
 * Глобально, во всех сервисах: у Traefik нет проверки Origin по списку, а forward-auth на каждую форму
 * сделал бы identity точкой отказа для всего сайта.
 */
@Injectable()
export class OriginGuard implements CanActivate {
  constructor(@Inject(SERVICE_CONFIG) private readonly config: BaseConfig) {}

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== "http") return true;
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    if (SAFE_METHODS.has(request.method)) return true;
    const origin = request.headers.origin;
    const allowed = origin === undefined ? request.headers["sec-fetch-site"] !== "cross-site" : this.config.ALLOWED_ORIGINS.includes(origin);
    if (!allowed) throw new ApiError(403, "forbidden_origin", "Запрос пришёл с чужого сайта");
    return true;
  }
}
