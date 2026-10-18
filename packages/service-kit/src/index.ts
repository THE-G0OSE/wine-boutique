export { baseConfigSchema, loadConfig, SERVICE_CONFIG, type BaseConfig } from "./config/config.js";
export { ApiError, type ApiErrorBody } from "./http/api-error.js";
export { ContractResponse } from "./http/contract-response.decorator.js";
export { READINESS_CHECKS } from "./health/health.controller.js";
export { ServiceKitModule, type ServiceKitOptions } from "./service-kit.module.js";
export { API_PREFIX, configureApp, createFastifyAdapter, startService } from "./bootstrap.js";
