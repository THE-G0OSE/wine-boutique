import { createSlice } from "@reduxjs/toolkit";

/** Подтверждение 18+: спрашиваем при первом входе и запоминаем на устройстве */
export const ageGateSlice = createSlice({
  name: "ageGate",
  initialState: { confirmed: false },
  reducers: {
    confirmAge(state) {
      state.confirmed = true;
    },
  },
  selectors: {
    selectIsAgeConfirmed: (state) => state.confirmed,
  },
});

export const { confirmAge } = ageGateSlice.actions;
export const { selectIsAgeConfirmed } = ageGateSlice.selectors;
