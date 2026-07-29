import { create } from 'zustand';

/**
 * UI-only state for the scan-center screen — mirrors the old StaffUpload mock
 * store, but keyed by scanItem id (string) and holding no request/mock data.
 * The real upload/report state lives in `useUpload`; this is purely presentation
 * (patient-confirm gate, selected study, help popups, note/viewer-link drafts).
 */
interface ScanUiState {
  verified: boolean;
  flagged: boolean;
  selected: string | null;
  modal: 'text' | 'notOurPatient' | null;
  uploadHelpOpen: boolean;
  cardHelpIdx: string | null;
  noteOpenIdx: string | null;
  dupConfirmIdx: string | null;
  fulfillMethod: 'files' | 'link';
  uploadSource: 'computer' | 'cd';
  pacsUrlDraft: string;
  pacsProviderDraft: string;
  pacsCodeDraft: string;
  pacsExpiryDraft: string;
  textMsgDraft: string;
  noteDraft: string;

  patch: (patch: Partial<ScanUiState> | ((s: ScanUiState) => Partial<ScanUiState>)) => void;
  reset: () => void;
}

const initial = {
  verified: false,
  flagged: false,
  selected: null as string | null,
  modal: null as 'text' | 'notOurPatient' | null,
  uploadHelpOpen: false,
  cardHelpIdx: null as string | null,
  noteOpenIdx: null as string | null,
  dupConfirmIdx: null as string | null,
  fulfillMethod: 'files' as 'files' | 'link',
  uploadSource: 'computer' as 'computer' | 'cd',
  pacsUrlDraft: '',
  pacsProviderDraft: '',
  pacsCodeDraft: '',
  pacsExpiryDraft: '',
  textMsgDraft: '',
  noteDraft: '',
};

export const useScanUiStore = create<ScanUiState>((set) => ({
  ...initial,
  patch: (patch) => set((s) => (typeof patch === 'function' ? patch(s) : patch)),
  reset: () => set({ ...initial }),
}));
