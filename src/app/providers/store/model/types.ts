import type { IAppSliceScheme } from "@/shared/model/types";

export interface IStore {
    AppReducer: IAppSliceScheme;
}