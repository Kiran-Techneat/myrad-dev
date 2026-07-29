export type IUserChangeProfilePicRequest = FormData;

export interface IUserUpdatePassword {
    password: string,
    newPassword: string,
    confirmPassword: string
}
export interface IUserUpdateProfile {
    firstName: string,
    lastName: string,
    gender: string,
    phoneCode: string,
    phoneNo: string,
    zipCode: string,
    dateOfBirth: string
}
export interface IUserAddFamilyMemberRequest {
    firstName: string,
    lastName: string,
    relationship: string,
    dateOfBirth: string,
    gender: string,
    phone: string,
    email: string
}
export interface IUserDeleteFamilyMemberRequest {
    memberIds: string[];
}
export interface IContactChangeInitiateRequest {
    type: 'email' | 'phoneno';
    newValue: string;
    phoneCode?: string;
}

export interface IContactChangeVerifyRequest {
    sessionId: string;
    otp: string;
}

export interface IUserUpdateFamilyMemberRequest {
    memberId: string,
    firstName: string,
    lastName: string,
    relationship: string,
    dateOfBirth: string,
    gender: string,
    phone: string,
    email: string
}
