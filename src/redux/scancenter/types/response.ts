import type { IAPICommonResponse } from "@/interface/base";

/* ================= TOKEN VALIDATION ================= */

export interface IStudyPreference {
    periodFrom?: string | null;
    periodTo?: string | null;
    scanMonth?: string | null;
    scanYear?: string | null;
}

export interface IScanTokenValidationResponse extends IAPICommonResponse {
    tokenId: string;
    tokenStatus: string;
    tokenExpiresAt: string;
    linkId: string;
    linkStatus: string;
    fullName: string;
    age: number;
    gender: string;
    patientId: string;
    patientMrnNumber?: string;
    requestId?: string;
    scanItems: IScanItem[];
    description: string | null;
    remarks: string | null;
    email?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    center: IScanCenter;
    studyPreference?: IStudyPreference | null;
    scanReason?: string | null;
    referringDoctor?: string | null;
    visitedBranch?: string | null;
    dicomUrl?: string | null;
    dicomKey?: string | null;
}

export interface IScanItem {
    id: string;
    bodyPoint: string;
    scanType: string;
    reportUploaded: boolean
    scanUploaded: boolean
}

export interface IScanCenter {
    labCenterName: string;
    email: string;
    phoneCode: string | null;
    phoneNumber: string;
    location: string;
}

/* ================= UPLOAD GENERATE ================= */

export interface IScanUploadGenerateResponse extends IAPICommonResponse {
    files: IScanUploadFile[];
}

// Matches API docs exactly — no contentType field
export interface IScanUploadFile {
    fileId: string;
    fileName: string;
    scanItemId: string;
    presignedUrl: string;
    s3Key: string;
}

/* ================= UPLOAD COMPLETE ================= */

export interface IScanUploadCompleteResponse extends IAPICommonResponse {
    linkId: string;
}

export interface IScanReportUploadResponse extends IAPICommonResponse {}

/* ================= MULTIPART UPLOAD ================= */

export interface IScanMultipartInitResponsePart {
    partNumber: number
    presignedUrl: string
}

export interface IScanMultipartInitResponse {
    fileId: string
    s3Key: string
    uploadId: string
    parts: IScanMultipartInitResponsePart[]
}
export type IReportUploadExtractResponse = {
  fileName: string;
  patientName: string;
  mrn: string;
  dob: string;
  gender: string;
  age: string;
  summary: string;
}[];
