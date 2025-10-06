import type { RootState } from "@/app/providers/store/model/store";
import type { IAppSliceScheme } from "@/shared/model/types";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

const initialState: IAppSliceScheme = {
    theme: "white"
}

export const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<"red" | "white">) => {
            state.theme = action.payload
        }
    }
})

export const appReducer = appSlice.reducer
export const {setTheme} = appSlice.actions

export const appSelection = (state: RootState) => state.AppReducer