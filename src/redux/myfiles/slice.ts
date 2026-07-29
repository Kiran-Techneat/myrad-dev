import { createSlice } from "@reduxjs/toolkit";
import { getAllSelfUpload, getdashboardcount, getmetadatabyId, getSelfUploadMetadata, getmyfiles, uploadFileDataExtract } from "./action";
import type { IGetAllSelfResponse, IGetMetadataByIdResponse, IGetMyFilesResponse, IReportUploadExtractResponse, IUserDashboardResponse } from "./types/response";

interface IMyFilesState {
    myfilesdata: IGetMyFilesResponse | null;
    metadata: IGetMetadataByIdResponse | null;
    dashboardcount: IUserDashboardResponse | null;
    selfuploaddata: IGetAllSelfResponse | null;
    reportUploadExtractResponse: IReportUploadExtractResponse | null;
}

const initialState: IMyFilesState = {
    myfilesdata: null,
    metadata: null,
    dashboardcount: null,
    selfuploaddata: null,
    reportUploadExtractResponse: null,
};

const myfilesSlice = createSlice({
    name: "myfilesSlice",
    initialState,
    reducers: {
        resetUploadExtract: (state) => {
            state.reportUploadExtractResponse = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getmyfiles.fulfilled, (state, action) => {
                state.myfilesdata = action.payload;
            })
            .addCase(getmetadatabyId.fulfilled, (state, action) => {
                state.metadata = action.payload;
            })
            .addCase(getSelfUploadMetadata.fulfilled, (state, action) => {
                state.metadata = action.payload;
            })
            .addCase(getdashboardcount.fulfilled, (state, action) => {
                const recordInfo = action.payload;
                state.dashboardcount = recordInfo;
            })
            .addCase(getAllSelfUpload.fulfilled, (state, action) => {
                state.selfuploaddata = action.payload;
            })
            .addCase(uploadFileDataExtract.fulfilled, (state, action) => {
                const payload = action.payload as any;
                state.reportUploadExtractResponse = payload?.recordInfo ?? payload;
            });
    },
});

export const { resetUploadExtract } = myfilesSlice.actions;
export default myfilesSlice.reducer;
