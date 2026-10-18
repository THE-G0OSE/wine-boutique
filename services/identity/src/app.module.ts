import { Module, type DynamicModule } from "@nestjs/common";
import { ServiceKitModule } from "@wine/service-kit";
import { GetCurrentSession } from "./application/get-current-session.js";
import type { IdentityConfig } from "./config.js";
import { SessionController } from "./http/session.controller.js";

@Module({})
export class AppModule {
  static forRoot(config: IdentityConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [ServiceKitModule.forRoot({ config })],
      controllers: [SessionController],
      providers: [GetCurrentSession],
    };
  }
}
