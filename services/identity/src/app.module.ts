import { Module, type DynamicModule } from "@nestjs/common";
import { databaseCheck, ServiceKitModule } from "@wine/service-kit";
import { IssueSession, ResolveSession } from "./application/sessions.js";
import type { IdentityConfig } from "./config.js";
import { ForwardAuthController } from "./http/forward-auth.controller.js";
import { SessionController } from "./http/session.controller.js";
import { DatabaseModule } from "./infrastructure/prisma/database.module.js";
import { IdentityPrisma } from "./infrastructure/prisma/identity-prisma.js";

@Module({})
export class AppModule {
  static forRoot(config: IdentityConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ServiceKitModule.forRoot({
          config,
          readiness: {
            imports: [DatabaseModule],
            inject: [IdentityPrisma],
            useFactory: (prisma: IdentityPrisma) => [databaseCheck(() => prisma.$queryRaw`SELECT 1`)],
          },
        }),
        DatabaseModule,
      ],
      controllers: [SessionController, ForwardAuthController],
      providers: [ResolveSession, IssueSession],
    };
  }
}
