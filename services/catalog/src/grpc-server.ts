import { fileURLToPath } from "node:url";
import type { GrpcServerOptions } from "@wine/service-kit";
import { WINE_CATALOG_V1_PACKAGE_NAME } from "@wine/contracts/proto/catalog";

/** Где лежит контракт внутреннего API и на каком адресе его слушать */
export const grpcServerOptions = (url: string): GrpcServerOptions => ({
  package: WINE_CATALOG_V1_PACKAGE_NAME,
  protoPath: fileURLToPath(import.meta.resolve("@wine/contracts/proto/wine/catalog/v1/catalog.proto")),
  url,
});
