import { createAsyncThunk } from "@reduxjs/toolkit";
import type { IAPIErrorResponse } from "@/interface/base";
import apiInstance from "@/utils/axios";
import type {
    IAddImageCenterRequest,
    IDownloadFaxPdfRequest,
    IGetALLImageCenterRequest,
    INewRequestFormRequest,
    IRequestCancelRequest,
    IRequestReminderRequest,
    IRequestViewIdRequest,
    IScanLinkRequest,
} from "./types/request";
import type {
    IAddImageCenterResponse,
    ICreateRequestResponse,
    IGetAllImageCenterResponse,
    IRequestCancelResponse,
    IRequestDashboardResponse,
    IRequestReminderResponse,
    IRequestViewIdResponse,
    IScanLinkResponse,
} from "./types/response";

const baseUrl = import.meta.env.VITE_USER_API_URL || import.meta.env.VITE_BASE_URL || "";

export const getAllScanLink = createAsyncThunk<IScanLinkResponse, IScanLinkRequest, { rejectValue: IAPIErrorResponse }>(
    "/scan/link/search",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await apiInstance.post<IScanLinkResponse>(`${baseUrl}/users-service/scan/link/search`, payload);
            return response?.data;
        } catch (error: any | IAPIErrorResponse) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const getRequestDashboard = createAsyncThunk<IRequestDashboardResponse, void, { rejectValue: IAPIErrorResponse }>(
    "/scan/link/count",
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiInstance.get<IRequestDashboardResponse>(`${baseUrl}/users-service/scan/link/count`);
            return response?.data;
        } catch (error: any | IAPIErrorResponse) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const createNewRequest = createAsyncThunk<ICreateRequestResponse, INewRequestFormRequest, { rejectValue: IAPIErrorResponse }>(
    "/scan/link/create",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await apiInstance.post<ICreateRequestResponse>(`${baseUrl}/users-service/scan/link/create`, payload);
            return response?.data;
        } catch (error: any | IAPIErrorResponse) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const getAllImageCenterList = createAsyncThunk<IGetAllImageCenterResponse, IGetALLImageCenterRequest, { rejectValue: IAPIErrorResponse }>(
    "/master/centers/search",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await apiInstance.post<IGetAllImageCenterResponse>(`${baseUrl}/users-service/master/centers/search`, payload);
            return response?.data;
        } catch (error: any | IAPIErrorResponse) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const requestViewId = createAsyncThunk<IRequestViewIdResponse, IRequestViewIdRequest, { rejectValue: IAPIErrorResponse }>(
    "/scan/link/view",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await apiInstance.post(`${baseUrl}/users-service/scan/link/view`, payload);
            // Endpoint wraps the detail under `recordInfo`; fall back to data/root for safety.
            const body: any = response?.data;
            return (body?.recordInfo ?? body?.data ?? body) as IRequestViewIdResponse;
        } catch (error: any | IAPIErrorResponse) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const requestReminder = createAsyncThunk<IRequestReminderResponse, IRequestReminderRequest, { rejectValue: IAPIErrorResponse }>(
    "/scan/link/remind",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await apiInstance.post<IRequestReminderResponse>(`${baseUrl}/users-service/scan/link/remind`, payload);
            return response?.data;
        } catch (error: any | IAPIErrorResponse) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const requestCancel = createAsyncThunk<IRequestCancelResponse, IRequestCancelRequest, { rejectValue: IAPIErrorResponse }>(
    "/scan/link/revoke",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await apiInstance.post<IRequestCancelResponse>(`${baseUrl}/users-service/scan/link/revoke`, payload);
            return response?.data;
        } catch (error: any | IAPIErrorResponse) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const downloadFaxPdf = createAsyncThunk<Blob, IDownloadFaxPdfRequest, { rejectValue: IAPIErrorResponse }>(
    "/public/fax/sheet",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await apiInstance.post<Blob>(
                `${baseUrl}/users-service/public/fax/sheet`,
                payload,
                { responseType: 'blob' }
            );
            return response?.data;
        } catch (error: any | IAPIErrorResponse) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const addImageCenter = createAsyncThunk<IAddImageCenterResponse, IAddImageCenterRequest, { rejectValue: IAPIErrorResponse }>(
    "/scan/link/lab/centers/add",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await apiInstance.post<IAddImageCenterResponse>(`${baseUrl}/users-service/scan/link/lab/centers/add`, payload);
            return response?.data;
        } catch (error: any | IAPIErrorResponse) {
            return rejectWithValue(error.response?.data);
        }
    }
);
