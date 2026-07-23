export interface IUserRegisterRequest {
    firstName: string;
    lastName: string;
    gender: string;
    email: string;
    phoneCode: string;
    phoneNo: string;
    zipCode: string;
    dateOfBirth: string;
    password: string;
    confirmPassword: string;
}

export interface IUserGoogleLoginRequest {
    idToken: string;
}
export interface IUserGoogleLoginVerifyRequest {
    sessionId: string;
    phoneCode: string;
    phoneNo: string;
    dateOfBirth: string;
    zipCode: string;
}
export interface IUserFacebookLoginRequest {
    accessToken: string;
}
export interface IUserFacebookLoginVerifyRequest {
    sessionId: string;
    email: string;
    phoneCode: string;
    phoneNo: string;
    dateOfBirth: string;
    zipCode: string;
}
export interface IVerifyRegisterOTPRequest {
    sessionId: string;
    otp: string;
}

export interface IUserLoginRequest {
    username: string;
    password: string;
}
export interface IUserPhoneLoginRequest {
    phoneNo: string;
}

export interface IUserLogin2FARequest {
    username: string;
    sessionId: string;
    otp: string;
}
export interface IUserVerifyEmailRequest {
    sessionId: string;
    otp: string;
}

export interface IUserVerifyPhoneRequest {
    sessionId: string;
    otp: string;
}
export interface IUserForgotPasswordRequest {
    username: string;
}
export interface IUserVerifyForgotPasswordRequest {
    sessionId: string;
    otp: string;
}
export interface IUserResetPasswordRequest {
    sessionId: string;
    password: string;
    confirmPassword: string;
}
