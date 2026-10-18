import { Controller, Get, Inject } from "@nestjs/common";
import { HealthCheck, HealthCheckService, type HealthIndicatorFunction } from "@nestjs/terminus";

/** Проверки готовности сервиса (БД, брокер) — сервис добавляет свои через этот токен */
export const READINESS_CHECKS = Symbol("READINESS_CHECKS");

/** Пробы для Docker и шлюза: вне префикса /api и вне контракта */
@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    @Inject(READINESS_CHECKS) private readonly readiness: HealthIndicatorFunction[]
  ) {}

  /** Процесс жив и отвечает */
  @Get("live")
  @HealthCheck()
  live() {
    return this.health.check([]);
  }

  /** Сервис может обслуживать запросы: зависимости доступны */
  @Get("ready")
  @HealthCheck()
  ready() {
    return this.health.check(this.readiness);
  }
}
