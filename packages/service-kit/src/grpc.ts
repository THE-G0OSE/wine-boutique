import type { INestApplication } from "@nestjs/common";
import { Transport, type MicroserviceOptions } from "@nestjs/microservices";

/** Внутренний gRPC-API сервиса: пакет и .proto из @wine/contracts */
export interface GrpcServerOptions {
  /** Пакет proto, например `wine.catalog.v1` */
  package: string;
  /** Абсолютный путь к .proto: `fileURLToPath(import.meta.resolve("@wine/contracts/proto/wine/catalog/v1/catalog.proto"))` */
  protoPath: string;
  /** host:port; порт доступен только в сети сервисов, шлюз его не публикует */
  url: string;
}

/** Подключает gRPC-сервер к HTTP-приложению (гибридное приложение Nest): один процесс, два транспорта */
export const connectGrpc = (app: INestApplication, { package: pkg, protoPath, url }: GrpcServerOptions): void => {
  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.GRPC,
      options: {
        package: pkg,
        protoPath,
        url,
        // Поля proto snake_case → camelCase в TS, как в интерфейсах ts-proto
        loader: { keepCase: false, longs: Number, enums: String, defaults: false, oneofs: true },
      },
    },
    { inheritAppConfig: true }
  );
};
