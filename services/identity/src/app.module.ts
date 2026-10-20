import { Module, type DynamicModule } from "@nestjs/common";
import { databaseCheck, ServiceKitModule } from "@wine/service-kit";
import { RegisterGuest, RequestPhoneCode, VerifyPhoneCode } from "./application/phone-auth.js";
import { CloseAccount, GetProfile, UpdateProfile } from "./application/profile.js";
import { IssueSession, ResolveSession } from "./application/sessions.js";
import type { IdentityConfig } from "./config.js";
import { AuthController } from "./http/auth.controller.js";
import { MeController } from "./http/me.controller.js";
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
      controllers: [SessionController, AuthController, MeController, ForwardAuthController],
      providers: [ResolveSession, IssueSession, RequestPhoneCode, VerifyPhoneCode, RegisterGuest, GetProfile, UpdateProfile, CloseAccount],
    };
  }
}
