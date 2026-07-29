import { createSlice } from "@reduxjs/toolkit";
import { reportuploadextract, validateToken } from "./action";
import type { IReportUploadExtractResponse, IScanTokenValidationResponse } from "./types/response";

interface IScanCenterState {
    scancenterDetails: IScanTokenValidationResponse | null;
    reportUploadExtractResponse: IReportUploadExtractResponse | null;
}

const initialState: IScanCenterState = {
    scancenterDetails: null,
    reportUploadExtractResponse: null,
};

const scanCenterSlice = createSlice({
    name: "ScanCenterSlice",
    initialState,
    reducers: {
        resetScanCenter: (state) => {
            state.scancenterDetails = null;
        },
        resetUploadExtract: (state) => {
            state.reportUploadExtractResponse = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(validateToken.fulfilled, (state, action) => {
                const payload = action.payload as any;
                state.scancenterDetails = payload?.recordInfo ?? payload;
            })
            .addCase(reportuploadextract.fulfilled, (state, action) => {
                const payload = action.payload as any;
                state.reportUploadExtractResponse = payload?.recordInfo ?? payload;
            });
    },
});

export const { resetScanCenter, resetUploadExtract } = scanCenterSlice.actions;
export default scanCenterSlice.reducer;
