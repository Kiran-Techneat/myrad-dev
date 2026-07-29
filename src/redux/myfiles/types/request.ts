export interface IGetMyFilesRequest {
  searchString: string;
  page: number;
  size: number;
}

export interface IGetMetadataByIdRequest {
  linkId: string;
  scanItemId: string;
}

export interface IUserUploadReportRequest {
  linkId: string;
  scanItemId: string;
  files: File[];
}

export interface IDeleteScanFileRequest {
  linkId: string;
  scanItemId: string;
}

export interface IUploadInitRequest {
  uploadType: string;
  patientId: string;
  fullName: string;
  description: string;
  scanItems: Array<{
    scanType: string;
    bodyPart: string;
  }>;
}

export interface IUploadGenerateRequest {
  linkId: string;
  files: Array<{
    fileName: string;
    scanItemId: string;
  }>;
}

export interface IUploadCompleteRequest {
  linkId: string;
  files: Array<{
    fileId: string;
    s3Key: string;
    scanItemId: string;
  }>;
}

export interface IUploadFileRequest {
  linkId: string;
  scanItemId: string;
  files: File[];
}

export interface IGetAllSelfRequest {
  searchString: string;
  fromDate: string | null;
  toDate: string | null;
  scanType: string;
  bodyPart: string;
  sortBy: string;
  page: number;
  size: number;
}

export interface IMultipartInitRequest {
  linkId: string;
  scanItemId: string;
  totalSizeBytes: number;
  partSizeBytes: number;
}

export interface IMultipartCompleteRequest {
  linkId: string;
  fileId: string;
  s3Key: string;
  uploadId: string;
  scanItemId: string;
  isFinalChunk?: boolean;
}

export interface IMultipartAbortRequest {
  s3Key: string;
  uploadId: string;
  fileId?: string;
  linkId: string;
}
