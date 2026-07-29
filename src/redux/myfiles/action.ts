import { createAsyncThunk } from "@reduxjs/toolkit";
import type { IAPIErrorResponse } from "@/interface/base";
import apiInstance from "@/utils/axios";
import type {
    IDeleteScanFileResponse,
    IGetAllSelfResponse,
    IGetMetadataByIdResponse,
    IGetMyFilesResponse,
    IMultipartInitResponse,
    IReportUploadExtractResponse,
    IUploadCompleteResponse,
    IUploadFileCompleteResponse,
    IUploadGenerateResponse,
    IUploadInitResponse,
    IUserDashboardResponse,
    IUserUploadReportResponse,
} from "./types/response";
import type {
    IDeleteScanFileRequest,
    IGetAllSelfRequest,
    IGetMetadataByIdRequest,
    IGetMyFilesRequest,
    IMultipartAbortRequest,
    IMultipartCompleteRequest,
    IMultipartInitRequest,
    IUploadCompleteRequest,
    IUploadFileRequest,
    IUploadGenerateRequest,
    IUploadInitRequest,
    IUserUploadReportRequest,
} from "./types/request";

const baseUrl = import.meta.env.VITE_FILE_API_URL || import.meta.env.VITE_BASE_URL || "";

export const getmyfiles = createAsyncThunk<IGetMyFilesResponse, IGetMyFilesRequest, { rejectValue: IAPIErrorResponse }>("/scan/files/search", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IGetMyFilesResponse>(`${baseUrl}/files-service/scan/files/search`, payload);
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});

export const getmetadatabyId = createAsyncThunk<IGetMetadataByIdResponse, IGetMetadataByIdRequest, { rejectValue: IAPIErrorResponse }>("/scan/metadata", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IGetMetadataByIdResponse>(`${baseUrl}/files-service/scan/metadata`, payload);
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});

export const getSelfUploadMetadata = createAsyncThunk<IGetMetadataByIdResponse, IGetMetadataByIdRequest, { rejectValue: IAPIErrorResponse }>("/scan/user/files/metadata", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IGetMetadataByIdResponse>(`${baseUrl}/files-service/scan/user/files/metadata`, payload);
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});

export const userUploadReport = createAsyncThunk<IUserUploadReportResponse, IUserUploadReportRequest, { rejectValue: IAPIErrorResponse }>("/scan/user/reports/upload", async (payload, { rejectWithValue }) => {
    try {
        const formData = new FormData();
        formData.append('linkId', payload.linkId);
        formData.append('scanItemId', payload.scanItemId);
        payload.files.forEach((file) => {
            formData.append('files', file);   // change to 'files[]' if backend expects array notation
        });

        const response = await apiInstance.post<IUserUploadReportResponse>(
            `${baseUrl}/files-service/scan/user/reports/upload`,
            formData,
            { headers: { 'Content-Type': undefined } }
        );
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});

export const getdashboardcount = createAsyncThunk<IUserDashboardResponse, void, { rejectValue: IAPIErrorResponse }>("/scan/counts", async (_, { rejectWithValue }) => {
    try {
        const response = await apiInstance.get<IUserDashboardResponse>(`${baseUrl}/files-service/scan/counts`);
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});

export const deleteScanFile = createAsyncThunk<IDeleteScanFileResponse, IDeleteScanFileRequest, { rejectValue: IAPIErrorResponse }>("/scan/delete", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.delete<IDeleteScanFileResponse>(`${baseUrl}/files-service/scan/delete`, { data: payload });
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});

export const initUploadFile = createAsyncThunk<IUploadInitResponse, IUploadInitRequest, { rejectValue: IAPIErrorResponse }>("/scan/user/upload/init", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IUploadInitResponse>(`${baseUrl}/files-service/scan/user/upload/init`, payload);
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});

export const generateDicomUploadFile = createAsyncThunk<IUploadGenerateResponse, IUploadGenerateRequest, { rejectValue: IAPIErrorResponse }>("/scan/user/upload/generate", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IUploadGenerateResponse>(`${baseUrl}/files-service/scan/user/upload/generate`, payload);
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});

export const completeDicomUploadFile = createAsyncThunk<IUploadCompleteResponse, IUploadCompleteRequest, { rejectValue: IAPIErrorResponse }>("/scan/user/upload/complete", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IUploadCompleteResponse>(`${baseUrl}/files-service/scan/user/upload/complete`, payload);
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});

export const uploadFileDataExtract = createAsyncThunk<IReportUploadExtractResponse, IUploadFileRequest, { rejectValue: IAPIErrorResponse }>("/scan/user/self/reports", async (payload, { rejectWithValue }) => {
    try {
        const formData = new FormData();
        formData.append('linkId', payload.linkId);
        formData.append('scanItemId', payload.scanItemId);
        payload.files.forEach((file) => {
            formData.append('files', file);
        });
        const response = await apiInstance.post<IReportUploadExtractResponse>(
            `${baseUrl}/files-service/scan/user/self/reports/extract`,
            formData,
            { headers: { 'Content-Type': undefined } }
        );
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});

export const generateReportUploadFile = createAsyncThunk<IUploadFileCompleteResponse, IUploadFileRequest, { rejectValue: IAPIErrorResponse }>("/scan/user/self/reports/upload", async (payload, { rejectWithValue }) => {
    try {
        const formData = new FormData();
        formData.append('linkId', payload.linkId);
        formData.append('scanItemId', payload.scanItemId);
        payload.files.forEach((file) => {
            formData.append('files', file);
        });
        const response = await apiInstance.post<IUploadFileCompleteResponse>(
            `${baseUrl}/files-service/scan/user/self/reports/upload`,
            formData,
            { headers: { 'Content-Type': undefined } }
        );
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});

export const getAllSelfUpload = createAsyncThunk<IGetAllSelfResponse, IGetAllSelfRequest, { rejectValue: IAPIErrorResponse }>("/scan/user/files/search", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IGetAllSelfResponse>(`${baseUrl}/files-service/scan/user/files/search`, payload);
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});

export const initSelfMultipartUpload = createAsyncThunk<
    IMultipartInitResponse, IMultipartInitRequest, { rejectValue: IAPIErrorResponse }
>("/scan/user/upload/multipart/initiate", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IMultipartInitResponse>(
            `${baseUrl}/files-service/scan/user/upload/multipart/initiate`, payload);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data);
    }
});

export const completeSelfMultipartUpload = createAsyncThunk<
    IUploadCompleteResponse, IMultipartCompleteRequest, { rejectValue: IAPIErrorResponse }
>("/scan/user/upload/multipart/complete", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IUploadCompleteResponse>(
            `${baseUrl}/files-service/scan/user/upload/multipart/complete`, payload);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data);
    }
});

export const abortSelfMultipartUpload = createAsyncThunk<
    void, IMultipartAbortRequest, { rejectValue: IAPIErrorResponse }
>("/scan/user/upload/multipart/abort", async (payload, { rejectWithValue }) => {
    try {
        await apiInstance.post(
            `${baseUrl}/files-service/scan/user/upload/multipart/abort`, payload);
    } catch (error: any) {
        return rejectWithValue(error.response?.data);
    }
});
