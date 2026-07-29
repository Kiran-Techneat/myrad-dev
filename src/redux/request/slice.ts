import { createSlice } from "@reduxjs/toolkit";
import { getAllImageCenterList, getAllScanLink, getRequestDashboard, requestViewId } from "./action";
import type { IGetAllImageCenterResponse, IRequestDashboardResponse, IRequestViewIdResponse, IScanLinkResponse } from "./types/response";

interface IRequestState {
    scanLink: IScanLinkResponse | null;
    requestDashboard: IRequestDashboardResponse | null;
    allImageCenterList: IGetAllImageCenterResponse | null;
    requestDetails: IRequestViewIdResponse | null;
}

const initialState: IRequestState = {
    scanLink: null,
    requestDashboard: null,
    allImageCenterList: null,
    requestDetails: null,
};

const requestSlice = createSlice({
    name: "requestSlice",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllScanLink.fulfilled, (state, action) => {
                state.scanLink = action.payload;
            })
            .addCase(getRequestDashboard.fulfilled, (state, action) => {
                state.requestDashboard = action.payload;
            })
            .addCase(getAllImageCenterList.fulfilled, (state, action) => {
                state.allImageCenterList = action.payload;
            })
            .addCase(requestViewId.pending, (state) => {
                // Reset so navigating between requests shows a fresh load, not stale data.
                state.requestDetails = null;
            })
            .addCase(requestViewId.fulfilled, (state, action) => {
                state.requestDetails = action.payload;
            })
            .addCase(requestViewId.rejected, (state) => {
                state.requestDetails = null;
            });
    },
});

export default requestSlice.reducer;
