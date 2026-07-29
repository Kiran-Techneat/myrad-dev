import type { IAPICommonResponse } from "@/interface/base";

export interface IFamilyMember {
    memberId: string;
    firstName: string;
    lastName: string;
    relationship: string;
    dateOfBirth: string;
    gender: string;
    email: string;
    phone?: string;
}

export interface IUserProfileResponse extends IAPICommonResponse {
    id: string;
    selfPatientId?: string;
    firstName: string;
    lastName: string;
    gender: string;
    profilePicUrl?: string;
    dateOfBirth: string;
    email: string;
    phoneCode: string;
    phoneNo: string;
    zipCode: string;
    isActive: boolean;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    createdAt: string;
    updatedAt: string;
    familyMembers?: IFamilyMember[];  // Optional - only present when added
}
export interface IUserChangeProfilePicResponse extends IAPICommonResponse { }
export interface IUserUpdatePasswordResponse extends IAPICommonResponse { }
export interface IUserUpdateProfileResponse extends IAPICommonResponse { }
export interface IUserAddFamilyMemberResponse extends IAPICommonResponse { }
export interface IUserDeleteFamilyMemberResponse extends IAPICommonResponse { }
export interface IUserUpdateFamilyMemberResponse extends IAPICommonResponse { }

export interface IContactChangeInitiateResponse extends IAPICommonResponse {
    sessionId: string;
    otp?: string;
}
export interface IContactChangeVerifyResponse extends IAPICommonResponse { }
