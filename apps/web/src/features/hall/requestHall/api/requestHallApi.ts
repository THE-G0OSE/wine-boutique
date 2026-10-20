import { baseApi, type ApiBody, type ApiSchemas } from "@/shared/api";

export const requestHallApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createHallRequest: build.mutation<ApiSchemas["ServiceRequest"], ApiBody<"createHallRequest">>({
      query: (body) => ({ url: "/requests/hall", method: "POST", body }),
    }),
  }),
});

export const { useCreateHallRequestMutation } = requestHallApi;
