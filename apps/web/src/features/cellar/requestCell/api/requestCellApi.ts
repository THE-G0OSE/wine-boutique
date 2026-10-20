import { baseApi, type ApiBody } from "@/shared/api";
import type { CellarRequest } from "@/entities/cellarCell";

export const requestCellApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createCellarRequest: build.mutation<CellarRequest, ApiBody<"createCellarRequest">>({
      query: (body) => ({ url: "/cellar/requests", method: "POST", body }),
    }),
  }),
});

export const { useCreateCellarRequestMutation } = requestCellApi;
