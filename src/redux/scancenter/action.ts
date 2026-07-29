import { createAsyncThunk } from "@reduxjs/toolkit";
import type { IAPIErrorResponse } from "@/interface/base";
import type { IReportUploadExtractResponse, IScanMultipartInitResponse, IScanReportUploadResponse, IScanTokenValidationResponse, IScanUploadCompleteResponse, IScanUploadGenerateResponse } from "./types/response";
import type { IReportUploadExtractRequest, IScanMultipartAbortRequest, IScanMultipartCompleteRequest, IScanMultipartInitRequest, IScanReportUploadRequest, IScanTokenValidationRequest, IScanUploadCompleteRequest, IScanUploadGenerateRequest } from "./types/request";
import apiInstance from "@/utils/axios";

interface IScanAddItemRequest {
    token: string;
    description: string;
}

const baseUrl = `${import.meta.env.VITE_FILE_API_URL || import.meta.env.VITE_BASE_URL || ""}/files-service/scan`;

export const validateToken = createAsyncThunk<IScanTokenValidationResponse, IScanTokenValidationRequest, { rejectValue: IAPIErrorResponse }>("/upload/validate", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IScanTokenValidationResponse>(`${baseUrl}/upload/validate`, payload);
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});
export const scanuploadgenerate = createAsyncThunk<IScanUploadGenerateResponse, IScanUploadGenerateRequest, { rejectValue: IAPIErrorResponse }>("/upload/generate", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IScanUploadGenerateResponse>(`${baseUrl}/upload/generate`, payload);
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});
export const scanuploadcomplete = createAsyncThunk<IScanUploadCompleteResponse, IScanUploadCompleteRequest, { rejectValue: IAPIErrorResponse }>("/upload/complete", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IScanUploadCompleteResponse>(`${baseUrl}/upload/complete`, payload);
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});
export const scanAddItem = createAsyncThunk<any, IScanAddItemRequest, { rejectValue: IAPIErrorResponse }>("/scan/upload/add-item", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post(`${baseUrl}/upload/add-item`, payload);
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});

export const scanMultipartInitiate = createAsyncThunk<IScanMultipartInitResponse, IScanMultipartInitRequest, { rejectValue: IAPIErrorResponse }>("/scan/upload/multipart/initiate", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IScanMultipartInitResponse>(`${baseUrl}/upload/multipart/initiate`, payload);
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});

export const scanMultipartComplete = createAsyncThunk<IScanUploadCompleteResponse, IScanMultipartCompleteRequest, { rejectValue: IAPIErrorResponse }>("/scan/upload/multipart/complete", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IScanUploadCompleteResponse>(`${baseUrl}/upload/multipart/complete`, payload);
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});

export const scanMultipartAbort = createAsyncThunk<void, IScanMultipartAbortRequest, { rejectValue: IAPIErrorResponse }>("/scan/upload/multipart/abort", async (payload, { rejectWithValue }) => {
    try {
        await apiInstance.post(`${baseUrl}/upload/multipart/abort`, payload);
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});
export const reportuploadextract = createAsyncThunk<IReportUploadExtractResponse, IReportUploadExtractRequest, { rejectValue: IAPIErrorResponse }>("/center/reports/extract", async (payload, { rejectWithValue }) => {
    try {
        const formData = new FormData();
        formData.append("token", payload.token);
        formData.append("scanItemId", payload.scanItemId);
        payload.files.forEach((file) => {
            formData.append("files", file);
        });

        const response = await apiInstance.post<IReportUploadExtractResponse>(
            `${baseUrl}/center/reports/extract`,
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});

export const scanreportupload = createAsyncThunk<IScanReportUploadResponse, IScanReportUploadRequest, { rejectValue: IAPIErrorResponse }>("/center/reports/upload", async (payload, { rejectWithValue }) => {
    try {
        const formData = new FormData();
        formData.append("token", payload.token);
        formData.append("scanItemId", payload.scanItemId);
        payload.files.forEach((file) => {
            formData.append("files", file);
        });

        const response = await apiInstance.post<IScanReportUploadResponse>(
            `${baseUrl}/center/reports/upload`,
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});
