import { credentials, loadPackageDefinition, Metadata, type CallOptions, type ChannelCredentials, type Client, type ServiceError } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
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

/** Клиент внутреннего API соседа: пакетные вызовы, у каждого — дедлайн */
export interface GrpcClientOptions {
  protoPath: string;
  /** Пакет proto, например `wine.catalog.v1` */
  package: string;
  /** Сервис в пакете, например `CatalogService` */
  service: string;
  /** host:port соседа в сети сервисов */
  url: string;
  /** Дедлайн вызова по умолчанию, мс (правила: 1 с) */
  timeoutMs?: number;
}

type UnaryMethod = (request: unknown, metadata: Metadata, options: CallOptions, callback: (error: ServiceError | null, response: unknown) => void) => void;

/**
 * Тонкая обёртка над @grpc/grpc-js: `await client.unary("GetWineSummaries", { ids })`.
 * Ошибка соседа (UNAVAILABLE, DEADLINE_EXCEEDED…) пробрасывается — что делать при отказе, решает сценарий.
 */
export class GrpcClient {
  private readonly client: Client;
  private readonly timeoutMs: number;

  constructor({ protoPath, package: pkg, service, url, timeoutMs = 1000 }: GrpcClientOptions) {
    const definition = loadSync(protoPath, { keepCase: false, longs: Number, enums: String, defaults: false, oneofs: true });
    const root = loadPackageDefinition(definition) as Record<string, unknown>;
    const Ctor = pkg.split(".").reduce<Record<string, unknown>>((node, part) => node[part] as Record<string, unknown>, root)[
      service
    ] as new (url: string, credentials: ChannelCredentials) => Client;
    this.client = new Ctor(url, credentials.createInsecure());
    this.timeoutMs = timeoutMs;
  }

  unary<Res>(method: string, request: unknown, timeoutMs = this.timeoutMs): Promise<Res> {
    const call = (this.client as unknown as Record<string, UnaryMethod>)[method];
    if (!call) return Promise.reject(new Error(`В клиенте gRPC нет метода ${method}`));
    return new Promise<Res>((resolve, reject) => {
      call.call(this.client, request, new Metadata(), { deadline: Date.now() + timeoutMs }, (error, response) =>
        error ? reject(error) : resolve(response as Res)
      );
    });
  }

  close(): void {
    this.client.close();
  }
}
