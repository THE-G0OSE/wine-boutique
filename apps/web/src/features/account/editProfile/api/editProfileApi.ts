import { baseApi, type ApiBody, type ApiSchemas } from "@/shared/api";

export const editProfileApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    updateProfile: build.mutation<ApiSchemas["Profile"], ApiBody<"updateProfile">>({
      query: (body) => ({ url: "/me", method: "PATCH", body }),
      // Имя меняется и в шапке
      invalidatesTags: ["Profile", "Session"],
    }),
    signOutEverywhere: build.mutation<void, void>({
      query: () => ({ url: "/me/sign-out-everywhere", method: "POST" }),
    }),
    deleteProfile: build.mutation<void, void>({
      query: () => ({ url: "/me", method: "DELETE" }),
    }),
  }),
});

export const { useUpdateProfileMutation, useSignOutEverywhereMutation, useDeleteProfileMutation } = editProfileApi;
