import { create } from 'zustand';
import type { DateMode } from '@/utils/format';
import type { StudyTag } from '@/types';

/** Structured "when was it done" captured at add-study time, used to build the API payload. */
export interface StudyDate {
  mode: DateMode;
  month: string;
  year: string;
  exact: string;
  from: string;
  to: string;
}

export interface AddedStudy {
  typeLabel: string;
  partLabel: string;
  dateLabel: string;
  tag: StudyTag;
  label: string;
  date: StudyDate;
}

export type WizStepKey = 'person' | 'center' | 'studies' | 'review';

interface WizardState {
  step: WizStepKey;
  done: boolean;
  reqId: string | null;

  personId: number | string | null;
  mrn: string;

  centerSearch: string;
  centerId: string | null;

  selType: string | null;
  selPart: string | null;
  openGroupKey: string | null;
  freeText: string;
  addedStudies: AddedStudy[];
  justAdded: boolean;
  lastAddedLabel: string;

  dateMode: DateMode;
  dateMonth: string;
  dateYear: string;
  dateExact: string;
  dateFrom: string;
  dateTo: string;

  note: string;
  sigDrawn: boolean;
  /** Drawn signature as a base64 PNG data URL (sent to /create). */
  signature: string | null;
  /** Temporary HTTPS link to the stored signature, returned by /create. */
  signatureUrl: string | null;

  /** Month/year custom dropdown open flags (mobile). */
  dpMonthOpen: boolean;
  dpYearOpen: boolean;

  reset: () => void;
  patch: (patch: Partial<WizardState> | ((s: WizardState) => Partial<WizardState>)) => void;
}

function freshWizard(): Omit<WizardState, 'reset' | 'patch'> {
  return {
    step: 'person',
    done: false,
    reqId: null,
    personId: null,
    mrn: '',
    centerSearch: '',
    centerId: null,
    selType: null,
    selPart: null,
    openGroupKey: null,
    freeText: '',
    addedStudies: [],
    justAdded: false,
    lastAddedLabel: '',
    dateMode: 'my',
    dateMonth: '',
    dateYear: '',
    dateExact: '',
    dateFrom: '',
    dateTo: '',
    note: '',
    sigDrawn: false,
    signature: null,
    signatureUrl: null,
    dpMonthOpen: false,
    dpYearOpen: false,
  };
}

export const useWizardStore = create<WizardState>((set) => ({
  ...freshWizard(),
  reset: () => set(freshWizard()),
  patch: (patch) => set((s) => (typeof patch === 'function' ? patch(s) : patch)),
}));
