import { baseApi, type ApiBody } from "@/shared/api";
import type { Certificate } from "@/entities/certificate";

export const issueCertificateApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createCertificate: build.mutation<Certificate, ApiBody<"createCertificate">>({
      query: (body) => ({ url: "/certificates", method: "POST", body }),
    }),
  }),
});

export const { useCreateCertificateMutation } = issueCertificateApi;
