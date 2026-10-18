import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/** Режим вина на главной: красное или белое — от текущего слайда hero */
export type WineMode = "red" | "white";

export const wineModeSlice = createSlice({
  name: "wineMode",
  initialState: { mode: "white" as WineMode },
  reducers: {
    setWineMode(state, { payload }: PayloadAction<WineMode>) {
      state.mode = payload;
    },
  },
  selectors: {
    selectWineMode: (state) => state.mode,
  },
});

export const { setWineMode } = wineModeSlice.actions;
export const { selectWineMode } = wineModeSlice.selectors;
