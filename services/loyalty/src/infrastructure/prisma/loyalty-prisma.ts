import { Inject, Injectable, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { SERVICE_CONFIG } from "@wine/service-kit";
import type { LoyaltyConfig } from "../../config.js";
import { PrismaClient } from "./generated/client.js";

/** Prisma-клиент базы loyalty. Доступен только слою infrastructure этого сервиса */
@Injectable()
export class LoyaltyPrisma extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject(SERVICE_CONFIG) config: LoyaltyConfig) {
    super({ adapter: new PrismaPg({ connectionString: config.DATABASE_URL, max: config.DATABASE_POOL_MAX }) });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
