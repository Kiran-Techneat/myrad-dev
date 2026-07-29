import { createAsyncThunk } from "@reduxjs/toolkit";
import type { IAPIErrorResponse } from "@/interface/base";
import apiInstance from "@/utils/axios";
import type { IPayPerUseCheckoutRequest } from "./types/request";
import type { IBillingStatusResponse, ICheckoutResponse } from "./types/response";

const baseUrl = import.meta.env.VITE_USER_API_URL || import.meta.env.VITE_BASE_URL || "";

export const getBillingStatus = createAsyncThunk<IBillingStatusResponse, void, { rejectValue: IAPIErrorResponse }>(
    "/billing/status",
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiInstance.get<IBillingStatusResponse>(`${baseUrl}/users-service/api/v1/billing/status`);
            return response?.data;
        } catch (error: any | IAPIErrorResponse) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const checkoutAnnual = createAsyncThunk<ICheckoutResponse, void, { rejectValue: IAPIErrorResponse }>(
    "/billing/checkout/annual",
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiInstance.post<ICheckoutResponse>(`${baseUrl}/users-service/api/v1/billing/checkout/annual`, {});
            return response?.data;
        } catch (error: any | IAPIErrorResponse) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const checkoutPayPerUse = createAsyncThunk<ICheckoutResponse, IPayPerUseCheckoutRequest, { rejectValue: IAPIErrorResponse }>(
    "/billing/checkout/pay-per-use",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await apiInstance.post<ICheckoutResponse>(`${baseUrl}/users-service/api/v1/billing/checkout/pay-per-use`, payload);
            return response?.data;
        } catch (error: any | IAPIErrorResponse) {
            return rejectWithValue(error.response?.data);
        }
    }
);
