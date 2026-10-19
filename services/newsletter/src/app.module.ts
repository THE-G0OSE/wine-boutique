import { Module, type DynamicModule } from "@nestjs/common";
import { databaseCheck, ServiceKitModule } from "@wine/service-kit";
import { Subscribe } from "./application/subscribe.js";
import type { NewsletterConfig } from "./config.js";
import { NewsletterController } from "./http/newsletter.controller.js";
import { DatabaseModule } from "./infrastructure/prisma/database.module.js";
import { NewsletterPrisma } from "./infrastructure/prisma/newsletter-prisma.js";

@Module({})
export class AppModule {
  static forRoot(config: NewsletterConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ServiceKitModule.forRoot({
          config,
          readiness: {
            imports: [DatabaseModule],
            inject: [NewsletterPrisma],
            useFactory: (prisma: NewsletterPrisma) => [databaseCheck(() => prisma.$queryRaw`SELECT 1`)],
          },
        }),
        DatabaseModule,
      ],
      controllers: [NewsletterController],
      providers: [Subscribe],
    };
  }
}
