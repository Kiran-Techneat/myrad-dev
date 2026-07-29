export interface IScanLinkItem {
  id: string;
  fullName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  patientId: string;
  description: string;
  linkUrl: string;
  token: string;
  requestId: string;
  center: {
    labCenterName: string;
    email: string;
    phoneCode: string | null;
    phoneNumber: string;
    location: string;
  };
  scanItems: {
    scanType: string;
    bodyPoint: string;
    scanDate: string;
    scanUploaded?: boolean | null;
    reportUploaded?: boolean | null;
  }[];
  createdAt: string;
  status: 'PENDING' | 'PartiallyUploaded' | 'COMPLETED' | 'REVOKED' | string;
  receivedDate: string;
  expiresAt: string;
}

export interface IScanLinkResponse {
  data: IScanLinkItem[];
  totalpages: number;
  currentpage: number;
  recordlimit: number;
  totalrecords: number;
  recordCount: number;
}

export interface IRequestViewIdResponse {
  id: string;
  fullName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  patientId: string;
  description: string;
  linkUrl: string;
  token: string;
  requestId: string;
  center: {
    labCenterName: string;
    email: string;
    phoneCode: string | null;
    phoneNumber: string;
    location: string;
  };
  scanItems: {
    id: string;
    scanType: string;
    bodyPoint: string;
    scanDate: string;
    scanUploaded?: boolean | null;
    reportUploaded?: boolean | null;
    reportUrl?: string | null;
    uploadSource?: string | null;
  }[];
  createdAt: string;
  status: 'PENDING' | 'PartiallyUploaded' | 'COMPLETED' | 'REVOKED' | string;
  receivedDate: string;
  expiresAt: string;
}

export interface IRequestReminderResponse {
  message?: string;
}

export interface IRequestCancelResponse {
  message?: string;
}

export interface IPatientRequestCounts {
  pending: number;
  completed: number;
  partiallyUploaded: number;
  cancelledRequest: number;
  total: number;
}

export interface IRequestDashboardResponse {
  total: number;
  pending: number;
  completed: number;
  partiallyUploaded: number;
  cancelledRequest: number;
  byPatient?: Record<string, IPatientRequestCounts>;
}

export interface ICreateRequestResponse {
  token: string;
  linkUrl: string;
  requestId: string;
  /** Temporary (12h) HTTPS link to the stored signature image. */
  signatureUrl: string;
}

export interface IImageCenterResponse {
  id: string;
  name: string;
  email?: string;
  phoneCode?: string;
  phoneNumber?: string;
  location?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  faxNumber?: string;
  streetAddress?: string;
}

export interface IGetAllImageCenterResponse {
  totalpages: number;
  currentpage: number;
  recordlimit: number;
  totalrecords: number;
  recordCount: number;
  searchResult: {
    masterCenters: IImageCenterResponse[];
    userCenters: IImageCenterResponse[];
  };
}

export interface IAddImageCenterResponse {
  id?: string;
}
