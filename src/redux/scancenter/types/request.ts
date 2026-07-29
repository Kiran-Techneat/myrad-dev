export interface IScanTokenValidationRequest {
    token: string
}

// Matches the API docs exactly — only fileName + scanItemId, no contentType
export interface IScanUploadGenerateRequest {
    token: string
    files: Array<{
        fileName: string
        scanItemId: string
    }>
}

export interface IScanUploadCompleteRequest {
    token: string
    files: Array<{
        fileId: string
        s3Key: string
        scanItemId: string
    }>
}

export interface IScanReportUploadRequest {
    token: string;
    scanItemId: string;
    files: File[];
}

export interface IScanMultipartInitRequest {
    token: string
    totalSizeBytes: number
    partSizeBytes: number
}

export interface IScanMultipartCompleteRequest {
    token: string
    fileId: string
    s3Key: string
    uploadId: string
    isFinalChunk?: boolean
}

export interface IScanMultipartAbortRequest {
    token: string
    s3Key: string
    uploadId: string
    fileId?: string
}
export interface IReportUploadExtractRequest {
    token: string;
    scanItemId: string;
    files: File[];
}
