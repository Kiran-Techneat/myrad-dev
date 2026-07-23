import { create } from 'zustand';

export type StudyUploadState = 'await' | 'uploading' | 'done';

export interface WalkInForm {
  first: string;
  last: string;
  dob: string;
  sex: string;
  mobile: string;
}

export interface WalkInState {
  phase: 'search' | 'confirm' | 'study' | 'upload' | 'done';
  query: string;
  matchId: number | string | null;
  ef: WalkInForm;
  selType: string | null;
  part: string;
  uploadSource: 'computer' | 'cd';
  helpOpen: boolean;
  uploading: boolean;
  doneName: string;
}

export function freshWalkIn(): WalkInState {
  return {
    phase: 'search',
    query: '',
    matchId: null,
    ef: { first: '', last: '', dob: '', sex: '', mobile: '' },
    selType: null,
    part: '',
    uploadSource: 'computer',
    helpOpen: false,
    uploading: false,
    doneName: '',
  };
}

interface StaffState {
  testReqId: string | null;
  verified: boolean;
  selected: number | null;
  uploadHelpOpen: boolean;
  fulfillMethod: 'files' | 'link';
  uploadSource: 'computer' | 'cd';
  studyState: Record<number, StudyUploadState>;
  pacsDone: Record<number, boolean>;
  pacsUrlDraft: string;
  pacsProviderDraft: string;
  pacsCodeDraft: string;
  pacsExpiryDraft: string;
  expandedStudy: number | null;
  flagged: boolean;
  modal: 'text' | 'notOurPatient' | null;
  textMsgDraft: string;
  noteOpenIdx: number | null;
  noteDraft: string;
  dupConfirmIdx: number | null;
  cardHelpIdx: number | null;
  wi: WalkInState | null;

  patch: (patch: Partial<StaffState> | ((s: StaffState) => Partial<StaffState>)) => void;
  patchWi: (patch: Partial<WalkInState> | ((s: WalkInState) => Partial<WalkInState>)) => void;
  resetForRequest: (testReqId: string) => void;
  ensureWalkIn: () => void;
  resetWalkIn: () => void;
}

export const useStaffStore = create<StaffState>((set, get) => ({
  testReqId: null,
  verified: false,
  selected: null,
  uploadHelpOpen: false,
  fulfillMethod: 'files',
  uploadSource: 'computer',
  studyState: {},
  pacsDone: {},
  pacsUrlDraft: '',
  pacsProviderDraft: '',
  pacsCodeDraft: '',
  pacsExpiryDraft: '',
  expandedStudy: null,
  flagged: false,
  modal: null,
  textMsgDraft: '',
  noteOpenIdx: null,
  noteDraft: '',
  dupConfirmIdx: null,
  cardHelpIdx: null,
  wi: null,

  patch: (patch) => set((s) => (typeof patch === 'function' ? patch(s) : patch)),
  patchWi: (patch) =>
    set((s) => {
      const wi = s.wi ?? freshWalkIn();
      return { wi: { ...wi, ...(typeof patch === 'function' ? patch(wi) : patch) } };
    }),
  resetForRequest: (testReqId) =>
    set({
      testReqId,
      verified: false,
      flagged: false,
      selected: null,
      studyState: {},
      pacsDone: {},
      pacsUrlDraft: '',
      pacsProviderDraft: '',
      pacsCodeDraft: '',
      pacsExpiryDraft: '',
      fulfillMethod: 'files',
      uploadSource: 'computer',
      modal: null,
    }),
  ensureWalkIn: () => {
    if (!get().wi) set({ wi: freshWalkIn() });
  },
  resetWalkIn: () => set({ wi: freshWalkIn() }),
}));
