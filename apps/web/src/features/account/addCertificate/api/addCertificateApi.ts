import { baseApi, type ApiSchemas } from "@/shared/api";

export const addCertificateApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    addMyCertificate: build.mutation<ApiSchemas["MyCertificate"], string>({
      query: (serial) => ({ url: "/me/certificates", method: "POST", body: { serial } }),
      invalidatesTags: ["MyCertificates"],
    }),
  }),
});

/** Привязать сертификат к кабинету по номеру с оборота или из письма */
export const { useAddMyCertificateMutation } = addCertificateApi;
