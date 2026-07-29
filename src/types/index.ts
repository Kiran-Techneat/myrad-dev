/** Domain models for the MyRad Images portal. */

export type StudyTag =
  | 'MRI'
  | 'CT'
  | 'XR'
  | 'US'
  | 'ECHO'
  | 'PET'
  | 'MMG'
  | 'NS'
  | 'OTH';

export type RequestItemStatus = 'ready' | 'pending' | 'cancelled';
export type AggregateStatus = 'ready' | 'pending' | 'partial' | 'cancelled';

export interface Person {
  id: number | string;
  name: string;
  role: string;
  initials: string;
  sex: string;
  dob: string;
  isSelf?: boolean;
  mobile?: string;
}

export interface Provider {
  name: string;
  spec: string;
  init: string;
  phone?: string;
  email?: string;
  fax?: string;
}

export interface Center {
  id: number;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  fax?: string;
}

export interface Study {
  id: number | string;
  tag: StudyTag;
  name: string;
  place: string;
  date: string;
  status: RequestItemStatus;
  reportStatus: 'ready' | 'pending';
  patient: string;
  selfUploaded?: boolean;
  hasImages?: boolean;
  selfNotes?: string;
  selfKind?: string;
  walkIn?: boolean;
  // Optional keys carried through from the real Images-service API (IScanFile).
  // Present on studies mapped from the files-service; absent on mock studies.
  linkId?: string;
  scanItemId?: string;
  patientId?: string;
  reportUrl?: string | null;
  uploadSource?: string | null;
  statusRaw?: string;
  series?: Array<{
    studyDate: string;
    seriesName: string;
    seriesLabel: string;
    seriesInstanceUid: string;
  }> | null;
}

export interface RequestItem {
  tag: StudyTag;
  label: string;
  status: RequestItemStatus;
  dateLabel?: string;
  notFound?: boolean;
  centerNote?: string;
  reportUrl?: string | null;
  scanItemId?: string;
  linkId?: string;
  uploadSource?: string | null;
}

export interface ImagingRequest {
  id: string;
  center: string;
  date: string;
  status: AggregateStatus;
  delivery: string;
  patient: string;
  items: RequestItem[];
  centerAddr?: string;
  centerPhone?: string;
  centerEmail?: string;
  centerFax?: string;
  mrn?: string;
  note?: string;
}

export interface ShareStudyRef {
  name: string;
  contents: string;
}

export interface Share {
  study: string;
  person: string;
  provider: string;
  spec: string;
  init: string;
  date: string;
  viewed: boolean;
  studies: ShareStudyRef[];
}

export interface StudyType {
  id: string;
  abbr: StudyTag;
  label: string;
  groupKey: string | null;
  filterFree?: boolean;
}

export interface PartGroup {
  k: string;
  l: string;
  short?: string;
  ch?: string[];
  free?: boolean;
}
