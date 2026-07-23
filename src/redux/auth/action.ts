import { createAsyncThunk } from "@reduxjs/toolkit";
import type { IAPIErrorResponse } from "../../interface/base";
import type { IUserRegisterResponse, IUserLoginResponse, IUserVerifyEmailResponse, IUserVerifyPhoneResponse, IUserLoginVerifyResponse, IUserForgotPasswordResponse, IUserVerifyForgotPasswordResponse, IUserResetPasswordResponse, IVerifyRegisterOTPResponse, IUserGoogleLoginResponse, IUserGoogleLoginVerifyResponse } from "./types/response";
import type { IUserRegisterRequest, IUserLoginRequest, IUserLogin2FARequest, IUserVerifyEmailRequest, IUserVerifyPhoneRequest, IUserForgotPasswordRequest, IUserVerifyForgotPasswordRequest, IUserResetPasswordRequest, IUserPhoneLoginRequest, IVerifyRegisterOTPRequest, IUserGoogleLoginRequest, IUserGoogleLoginVerifyRequest, IUserFacebookLoginRequest, IUserFacebookLoginVerifyRequest } from "./types/request";
import apiInstance from "@/utils/axios";
import { encryptData, setSession } from "@/utils/authUtility";

const baseUrl = import.meta.env.VITE_USER_API_URL || import.meta.env.VITE_BASE_URL || "";

export const userRegister = createAsyncThunk<IUserRegisterResponse, IUserRegisterRequest, { rejectValue: IAPIErrorResponse }>("/authSlice/userRegister", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IUserRegisterResponse>(`${baseUrl}/users-service/registration/register`, payload);
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});

export const VerifyRegisterOTP = createAsyncThunk<IVerifyRegisterOTPResponse, IVerifyRegisterOTPRequest, { rejectValue: IAPIErrorResponse }>("/authSlice/verifyRegisterOTP", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IVerifyRegisterOTPResponse>(`${baseUrl}/users-service/registration/verify`, payload);
        const { accessToken, refreshKey } = response?.data;
        if (accessToken && refreshKey) {
            const dataToEncrypt = JSON.stringify({ accessToken, refreshKey });
            const encrypted = encryptData(dataToEncrypt);
            setSession(encrypted);
        }
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});

export const verifyRegisterEmail = createAsyncThunk<IUserVerifyEmailResponse, IUserVerifyEmailRequest, { rejectValue: IAPIErrorResponse }>("/authSlice/verifyRegisterEmail", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IUserVerifyEmailResponse>(`${baseUrl}/users-service/auth/verify/email`, payload);
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});

export const verifyRegisterPhone = createAsyncThunk<IUserVerifyPhoneResponse, IUserVerifyPhoneRequest, { rejectValue: IAPIErrorResponse }>("/authSlice/verifyRegisterPhone", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IUserVerifyPhoneResponse>(`${baseUrl}/users-service/auth/verify/phone`, payload);
        const { accessToken, refreshKey } = response?.data;
        if (accessToken && refreshKey) {
            const dataToEncrypt = JSON.stringify({ accessToken, refreshKey });
            const encrypted = encryptData(dataToEncrypt);
            setSession(encrypted);
        }
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
}
);

export const userLogin = createAsyncThunk<IUserLoginResponse, IUserLoginRequest, { rejectValue: IAPIErrorResponse }>("/authSlice/userLogin", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IUserLoginResponse>(`${baseUrl}/users-service/auth/signin`, payload);
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});

export const userLoginVerification = createAsyncThunk<IUserLoginVerifyResponse, IUserLogin2FARequest, { rejectValue: IAPIErrorResponse }>("/authSlice/userLoginVerification", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IUserLoginVerifyResponse>(`${baseUrl}/users-service/auth/signin2fa`, payload);
        const { accessToken, refreshKey } = response?.data;
        if (accessToken && refreshKey) {
            const dataToEncrypt = JSON.stringify({ accessToken, refreshKey });
            const encrypted = encryptData(dataToEncrypt);
            setSession(encrypted);
        }
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});

export const userGoogleLogin = createAsyncThunk<IUserGoogleLoginResponse, IUserGoogleLoginRequest, { rejectValue: IAPIErrorResponse }>("/authSlice/userGoogleLogin", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IUserGoogleLoginResponse>(`${baseUrl}/users-service/auth/google`, payload);
        const { accessToken, refreshKey } = response?.data || {};
        if (accessToken && refreshKey) {
            const dataToEncrypt = JSON.stringify({ accessToken, refreshKey });
            const encrypted = encryptData(dataToEncrypt);
            setSession(encrypted);
        }
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});
export const userGoogleLoginVerify = createAsyncThunk<IUserGoogleLoginVerifyResponse, IUserGoogleLoginVerifyRequest, { rejectValue: IAPIErrorResponse }>("/authSlice/userGoogleLoginVerify", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IUserGoogleLoginVerifyResponse>(`${baseUrl}/users-service/auth/google/complete`, payload);
        const { accessToken, refreshKey } = response?.data;
        if (accessToken && refreshKey) {
            const dataToEncrypt = JSON.stringify({ accessToken, refreshKey });
            const encrypted = encryptData(dataToEncrypt);
            setSession(encrypted);
        }
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});
export const userFacebookLogin = createAsyncThunk<IUserGoogleLoginResponse, IUserFacebookLoginRequest, { rejectValue: IAPIErrorResponse }>("/authSlice/userFacebookLogin", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IUserGoogleLoginResponse>(`${baseUrl}/users-service/auth/facebook`, payload);
        const { accessToken, refreshKey } = response?.data || {};
        if (accessToken && refreshKey) {
            const dataToEncrypt = JSON.stringify({ accessToken, refreshKey });
            const encrypted = encryptData(dataToEncrypt);
            setSession(encrypted);
        }
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});
export const userFacebookLoginVerify = createAsyncThunk<IUserGoogleLoginVerifyResponse, IUserFacebookLoginVerifyRequest, { rejectValue: IAPIErrorResponse }>("/authSlice/userFacebookLoginVerify", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IUserGoogleLoginVerifyResponse>(`${baseUrl}/users-service/auth/facebook/complete`, payload);
        const { accessToken, refreshKey } = response?.data || {};
        if (accessToken && refreshKey) {
            const dataToEncrypt = JSON.stringify({ accessToken, refreshKey });
            const encrypted = encryptData(dataToEncrypt);
            setSession(encrypted);
        }
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});

export const userForgotPassword = createAsyncThunk<IUserForgotPasswordResponse, IUserForgotPasswordRequest, { rejectValue: IAPIErrorResponse }>("/authSlice/userForgotPassword", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IUserForgotPasswordResponse>(`${baseUrl}/users-service/user/auth/forgotpassword`, payload);
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});

export const userVerifyForgotPassword = createAsyncThunk<IUserVerifyForgotPasswordResponse, IUserVerifyForgotPasswordRequest, { rejectValue: IAPIErrorResponse }>("/authSlice/userVerifyForgotPassword", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IUserVerifyForgotPasswordResponse>(`${baseUrl}/users-service/user/auth/validaterecoveryotp`, payload);
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});

export const userResetPassword = createAsyncThunk<IUserResetPasswordResponse, IUserResetPasswordRequest, { rejectValue: IAPIErrorResponse }>("/authSlice/userResetPassword", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IUserResetPasswordResponse>(`${baseUrl}/users-service/user/auth/updatepassword`, payload);
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});
export const userphonelogin = createAsyncThunk<IUserLoginResponse, IUserPhoneLoginRequest, { rejectValue: IAPIErrorResponse }>("/authSlice/userPhoneLogin", async (payload, { rejectWithValue }) => {
    try {
        const response = await apiInstance.post<IUserLoginResponse>(`${baseUrl}/users-service/auth/signin/phone`, payload);
        return response?.data;
    } catch (error: any | IAPIErrorResponse) {
        return rejectWithValue(error.response?.data);
    }
});
