import { createSlice } from "@reduxjs/toolkit";
import type { Entitlements } from "@/utils/entitlements";
import { getBillingStatus } from "./action";

interface IBillingState {
    entitlements: Entitlements | null;
    loadingStatus: boolean;
}

const initialState: IBillingState = {
    entitlements: null,
    loadingStatus: true,
};

const billingSlice = createSlice({
    name: "billingSlice",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getBillingStatus.pending, (state) => {
                state.loadingStatus = true;
            })
            .addCase(getBillingStatus.fulfilled, (state, action) => {
                state.entitlements = action.payload?.recordInfo ?? null;
                state.loadingStatus = false;
            })
            .addCase(getBillingStatus.rejected, (state) => {
                state.loadingStatus = false;
            });
    },
});

export default billingSlice.reducer;
