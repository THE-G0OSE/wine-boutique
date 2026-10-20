import { baseApi, type ApiBody, type ApiSchemas } from "@/shared/api";

export const prepareCellApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    prepareMyCell: build.mutation<ApiSchemas["CellPreparation"], ApiBody<"prepareMyCell">>({
      query: (body) => ({ url: "/me/cell/prepare", method: "POST", body }),
      invalidatesTags: ["MyCell"],
    }),
  }),
});

/** Отметить бутылки в описи — сомелье поднимет их из погреба к визиту */
export const { usePrepareMyCellMutation } = prepareCellApi;
