export interface IScanLinkRequest {
  patientId: string;
  searchString: string;
  bodyPoint: string;
  centerName: string;
  status?: string;
  page: number;
  size: number;
}

export interface INewRequestFormRequest {
  fullName: string;
  age: number;
  gender: string;
  patientId: string | undefined;
  patientMrnNumber?: string;

  labCenterId?: string;

  scanItems: {
    scanType: string;
    bodyPoint: string;
    scanDate: string | null;
  }[];

  activeDays: number;

  description?: string | null;

  dateOfScan?: string | null;

  remarks?: string | null;

  studyPreference?: {
    periodFrom?: string | null;
    periodTo?: string | null;
    scanMonth?: string | null;
    scanYear?: string | null;
  } | null;

  whyDidYouHaveThisScan?: string | null;

  doctorWhoReferredYou?: string | null;

  branchOrLocationVisited?: string | null;

  notifyByEmail?: boolean | null;

  /** Drawn signature as a base64 PNG string (canvas.toDataURL('image/png')). */
  signature?: string | null;
}

export interface IRequestViewIdRequest {
  id: string;
}

export interface IRequestReminderRequest {
  id: string;
}

export interface IRequestCancelRequest {
  token: string;
}

export interface IDownloadFaxPdfRequest {
  token: string;
}

export interface IGetALLImageCenterRequest {
  searchString: string;
  name: string;
  email: string;
  city: string;
  state: string;
  page: number;
  size: number;
}

export interface IAddImageCenterRequest {
  name: string;
  email: string;
  phoneNumber: string;
  location: string;
  address: string;
  zipCode: string;
  faxNumber: string | undefined;
  phoneCode: string;
  city: string;
  state: string;
  streetAddress: string;
}
