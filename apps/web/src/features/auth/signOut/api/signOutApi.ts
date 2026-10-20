import { baseApi } from "@/shared/api";

export const signOutApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    signOut: build.mutation<void, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      invalidatesTags: ["Session"],
    }),
  }),
});

export const { useSignOutMutation } = signOutApi;
