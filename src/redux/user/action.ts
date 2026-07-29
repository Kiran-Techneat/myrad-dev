import { createAsyncThunk } from "@reduxjs/toolkit";
import type { IAPIErrorResponse } from "@/interface/base";
import type { IContactChangeInitiateResponse, IContactChangeVerifyResponse, IUserAddFamilyMemberResponse, IUserChangeProfilePicResponse, IUserDeleteFamilyMemberResponse, IUserProfileResponse, IUserUpdateFamilyMemberResponse, IUserUpdatePasswordResponse, IUserUpdateProfileResponse } from "./types/response";
import type { IContactChangeInitiateRequest, IContactChangeVerifyRequest, IUserAddFamilyMemberRequest, IUserChangeProfilePicRequest, IUserDeleteFamilyMemberRequest, IUserUpdateFamilyMemberRequest, IUserUpdatePassword, IUserUpdateProfile } from "./types/request";
import apiInstance from "@/utils/axios";

const baseUrl = import.meta.env.VITE_USER_API_URL || import.meta.env.VITE_BASE_URL || "";

export const getUserProfile = createAsyncThunk<IUserProfileResponse, void, { rejectValue: IAPIErrorResponse }>("/userSlice/getUserProfile",
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiInstance.get<IUserProfileResponse>(`${baseUrl}/users-service/user/profile`);
            return response?.data;
        } catch (error: any | IAPIErrorResponse) {
            return rejectWithValue(error.response?.data);
        }
    }
);
export const changeProfilePic = createAsyncThunk<IUserChangeProfilePicResponse, IUserChangeProfilePicRequest, { rejectValue: IAPIErrorResponse }>("/userSlice/user/profilepicture", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IUserChangeProfilePicResponse>(`${baseUrl}/users-service/user/profilepicture`, payload,
            {
                headers: { 'Content-Type': 'multipart/form-data' }
            }
        );
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});
export const updatePassword = createAsyncThunk<IUserUpdatePasswordResponse, IUserUpdatePassword, { rejectValue: IAPIErrorResponse }>("/userSlice/user/changepassword", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.put<IUserUpdatePasswordResponse>(`${baseUrl}/users-service/user/changepassword`, payload);
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});
export const updateProfile = createAsyncThunk<IUserUpdateProfileResponse, IUserUpdateProfile, { rejectValue: IAPIErrorResponse }>("/userSlice/user/update/profile", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IUserUpdateProfileResponse>(`${baseUrl}/users-service/user/update/profile`, payload);
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});
export const addFamilyMember = createAsyncThunk<IUserAddFamilyMemberResponse, IUserAddFamilyMemberRequest, { rejectValue: IAPIErrorResponse }>("/userSlice/user/family/member/add", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IUserAddFamilyMemberResponse>(`${baseUrl}/users-service/user/family/member/add`, payload);
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});
export const deleteFamilyMember = createAsyncThunk<IUserDeleteFamilyMemberResponse, IUserDeleteFamilyMemberRequest, { rejectValue: IAPIErrorResponse }>("/userSlice/user/family/member/remove",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await apiInstance.delete<IUserDeleteFamilyMemberResponse>(`${baseUrl}/users-service/user/family/member/remove`, { data: payload });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data);
        }
    }
);
export const updateFamilyMember = createAsyncThunk<IUserUpdateFamilyMemberResponse, IUserUpdateFamilyMemberRequest, { rejectValue: IAPIErrorResponse }>("/userSlice/user/family/member/edit", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.patch<IUserUpdateFamilyMemberResponse>(`${baseUrl}/users-service/user/family/member/edit`, payload);
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});

export const initiateContactChange = createAsyncThunk<IContactChangeInitiateResponse, IContactChangeInitiateRequest, { rejectValue: IAPIErrorResponse }>(
    "/userSlice/user/contact/initiate",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await apiInstance.post<IContactChangeInitiateResponse>(`${baseUrl}/users-service/user/contact/initiate`, payload);
            return response?.data;
        } catch (error: any | IAPIErrorResponse) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const verifyContactChange = createAsyncThunk<IContactChangeVerifyResponse, IContactChangeVerifyRequest, { rejectValue: IAPIErrorResponse }>(
    "/userSlice/user/contact/verify",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await apiInstance.post<IContactChangeVerifyResponse>(`${baseUrl}/users-service/user/contact/verify`, payload);
            return response?.data;
        } catch (error: any | IAPIErrorResponse) {
            return rejectWithValue(error.response?.data);
        }
    }
);
