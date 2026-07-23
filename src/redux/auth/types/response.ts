import type { IAPICommonResponse } from "../../../interface/base";

// Register
export interface IUserRegisterResponse extends IAPICommonResponse {
    sessionId: string;
    otp: string;
}
export interface IVerifyRegisterOTPResponse extends IAPICommonResponse {
    refreshKey: string;
    accessToken: string;
}
export interface IUserVerifyEmailResponse extends IAPICommonResponse {
    sessionId: string;
    otp: string;
}
export interface IUserVerifyPhoneResponse extends IAPICommonResponse {
    refreshKey: string;
    accessToken: string;
}
// Login
export interface IUserLoginResponse extends IAPICommonResponse {
    sessionId: string;
    otp?: string;
}
export interface IUserLoginVerifyResponse extends IAPICommonResponse {
    refreshKey: string;
    accessToken: string;
}
// Forget Password
export interface IUserForgotPasswordResponse extends IAPICommonResponse {
    sessionId: string;
}
export interface IUserVerifyForgotPasswordResponse extends IAPICommonResponse {
    sessionId: string;
}
export interface IUserResetPasswordResponse extends IAPICommonResponse { }

export interface IUserGoogleLoginResponse extends IAPICommonResponse {
    sessionId?: string;
    accessToken?: string;
    refreshKey?: string;
}
export interface IUserGoogleLoginVerifyResponse extends IAPICommonResponse {
    refreshKey: string;
    accessToken: string;
}
