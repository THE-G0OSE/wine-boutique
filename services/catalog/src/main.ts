import "reflect-metadata";
import { loadConfig, startService } from "@wine/service-kit";
import { AppModule } from "./app.module.js";
import { configSchema } from "./config.js";
import { grpcServerOptions } from "./grpc-server.js";

const config = loadConfig(configSchema);
await startService(AppModule.forRoot(config), config, { grpc: grpcServerOptions(config.GRPC_URL) });
