import { Module, type DynamicModule, type Provider } from "@nestjs/common";
import { StandardSchemaSerializerInterceptor } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE, Reflector } from "@nestjs/core";
import { TerminusModule, type HealthIndicatorFunction } from "@nestjs/terminus";
import { LoggerModule } from "nestjs-pino";
import { SERVICE_CONFIG, type BaseConfig } from "./config/config.js";
import { HealthController, READINESS_CHECKS } from "./health/health.controller.js";
import { ApiExceptionFilter } from "./http/api-exception.filter.js";
import { ContractValidationPipe } from "./http/contract-validation.pipe.js";
import { loggerOptions } from "./logging/logger.options.js";

export interface ServiceKitOptions<C extends BaseConfig> {
  /** Уже проверенная конфигурация (`loadConfig`) — доступна в DI по токену SERVICE_CONFIG */
  config: C;
  /** Проверки готовности для /health/ready */
  readiness?: HealthIndicatorFunction[];
}

/**
 * Подключается первым в AppModule сервиса. Даёт: конфиг в DI, логи pino, пробы /health/*,
 * ошибки в формате контракта, проверку входа (`@Body({ schema })`) и выхода (`@SerializeOptions({ schema })`).
 */
@Module({})
export class ServiceKitModule {
  static forRoot<C extends BaseConfig>({ config, readiness = [] }: ServiceKitOptions<C>): DynamicModule {
    const providers: Provider[] = [
      { provide: SERVICE_CONFIG, useValue: config },
      { provide: READINESS_CHECKS, useValue: readiness },
      { provide: APP_FILTER, useClass: ApiExceptionFilter },
      { provide: APP_PIPE, useClass: ContractValidationPipe },
      {
        provide: APP_INTERCEPTOR,
        useFactory: (reflector: Reflector) => new StandardSchemaSerializerInterceptor(reflector),
        inject: [Reflector],
      },
    ];
    return {
      module: ServiceKitModule,
      global: true,
      imports: [LoggerModule.forRoot(loggerOptions(config)), TerminusModule.forRoot({ logger: false })],
      controllers: [HealthController],
      providers,
      exports: [SERVICE_CONFIG],
    };
  }
}
