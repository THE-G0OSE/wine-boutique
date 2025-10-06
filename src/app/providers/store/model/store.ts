import type { IStore } from "@/app/providers/store/model/types";
import { appReducer } from "@/shared/model/appSlice";
import { configureStore, type ReducersMapObject } from "@reduxjs/toolkit";

const rootReducer: ReducersMapObject<IStore> = {
    AppReducer: appReducer,
}

export const makeStore = () => {
    return configureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) => getDefaultMiddleware()
    })
}

export type AppStore = ReturnType<typeof makeStore>

export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]