export interface IScanItem {
  id: string;
  bodyPoint: string;
  scanType: string;
}

export interface ICenter {
  labCenterName: string;
  email: string;
  phoneCode: string | null;
  phoneNumber: string;
  location: string;
}

export interface IImageSeries {
  studyDate: string;
  seriesName: string;
  seriesLabel: string;
  seriesInstanceUid: string;
}

export interface IScanFile {
  centerName: string;
  centerEmail: string;
  createdAt: string;
  linkId: string;
  patientId: string;
  patientName: string;
  scanItemId: string;
  scanType: string;
  bodyPoint: string;
  description: string | null;
  uploadSource: string | null;
  status: string;
  reportUrl: string | null;
  uploaded: boolean;
  requestId: string;
  series: IImageSeries[] | undefined | null;
}

export interface IGetMyFilesResponse {
  data: IScanFile[];
  totalpages: number;
  currentpage: number;
  recordlimit: number;
  totalrecords: number;
  recordCount: number;
}

export interface IFile {
  sequence: number;
  fileName: string;
  seriesDescription: string;
  fileId: string;
  s3Key: string;
  downloadUrl: string;
}

export interface ISeriesData {
  seriesInstanceUid: string;
  seriesLabel: string;
  seriesName: string;
  seriesDescription: string;
  modality: string;
  studyDate: string;
  studyDescription: string;
  institutionName: string;
  manufacturer: string;
  patientName: string;
  patientId: string;
  patientBirthDate: string;
  fileCount: number;
  files: IFile[];
}

export interface IReport {
  id: string;
  filePath: string;
  presignedUrl: string;
}

export interface IGetMetadataByIdResponse {
  headers: {
    message: string;
    statusCode: string;
  };
  studyId: string;
  data: ISeriesData[];
  recordCount: number;
  reports: IReport[];
}

export interface IUserUploadReportResponse {}

export interface IPatientScanCounts {
  myImages: number;
  sharedImages: number;
  reports: number;
}

export interface IUserDashboardResponse {
  recordInfo: {
    reports: number;
    myImages: number;
    sharedImages: number;
    byPatient?: Record<string, IPatientScanCounts>;
  };
}

export interface IDeleteScanFileResponse {}

export interface IUploadInitResponse {
  message: string;
  linkId: string;
  scanItems: [
    {
      id: string;
      bodyPoint: string;
      scanType: string;
      scanDate: string;
    },
  ];
}

export interface IUploadGenerateResponse {
  files: [
    {
      fileId: string;
      fileName: string;
      scanItemId: string;
      presignedUrl: string;
      s3Key: string;
    },
  ];
}

export interface IUploadCompleteResponse {
  linkId: string;
  filesProcessed: number;
}

export interface IUploadFileCompleteResponse {}

export interface IMultipartInitResponsePart {
  partNumber: number;
  presignedUrl: string;
}

export interface IMultipartInitResponse {
  fileId: string;
  s3Key: string;
  uploadId: string;
  parts: IMultipartInitResponsePart[];
}

export interface IGetAllSelfResponse {
  data: [
    {
      linkId: string;
      scanItemId: string;
      uploadType: string;
      patientId: string;
      fullName: string;
      description: string;
      scanType: string | null | '';
      bodyPart: string | null | '';
      linkStatus: string;
      status: string;
      processingStatus: string;
      createdAt: string;
      uploaded: boolean;
      reportUrl: string;
      studyDate: string | null;
    },
  ];
  totalpages: number;
  currentpage: number;
  recordlimit: number;
  totalrecords: number;
  recordCount: number;
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
