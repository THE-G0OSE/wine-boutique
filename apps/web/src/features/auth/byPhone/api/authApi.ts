import { baseApi, type ApiBody, type ApiSchemas } from "@/shared/api";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    requestPhoneCode: build.mutation<ApiSchemas["PhoneCodeSent"], ApiBody<"requestPhoneCode">>({
      query: (body) => ({ url: "/auth/phone/code", method: "POST", body }),
    }),
    verifyPhoneCode: build.mutation<ApiSchemas["PhoneVerification"], ApiBody<"verifyPhoneCode">>({
      query: (body) => ({ url: "/auth/phone/verify", method: "POST", body }),
      // Вошёл — шапка и кабинет перечитают сессию
      invalidatesTags: (result) => (result?.status === "signed_in" ? ["Session"] : []),
    }),
    registerGuest: build.mutation<ApiSchemas["Session"], ApiBody<"registerGuest">>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      invalidatesTags: (result) => (result ? ["Session"] : []),
    }),
  }),
});

export const { useRequestPhoneCodeMutation, useVerifyPhoneCodeMutation, useRegisterGuestMutation } = authApi;
