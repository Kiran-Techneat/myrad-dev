import { create } from 'zustand';

export type Screen =
  | 'home'
  | 'images'
  | 'requests'
  | 'requestDetail'
  | 'shared'
  | 'viewer'
  | 'profile'
  | 'billing'
  | 'wizard'
  | 'upload'
  | 'centers'
  | 'notify'
  | 'selfUpload';

export type ActivePatient = 'all' | number | string;

export type NotifyKind = 'request' | 'wizardRequest' | 'share' | null;
export type NotifyShareData = { provider: string; person: string; study: string; date: string } | null;

/**
 * Real request payload passed from the request-detail page to the Notify preview
 * via react-router navigate state. When absent on `/notify` (direct access /
 * refresh), the preview renders a Page Not Found instead of mock data.
 */
export interface NotifyRequestData {
  center: string;
  patient: string;
  phone: string;
  sex: string;
  age: string;
  mrn: string;
  note: string;
  ref: string;
  studies: { name: string; statusTxt: string }[];
}

/**
 * UI state that is NOT part of the URL: open menus, the selected patient, and the
 * ephemeral payloads the Notify preview needs. The *current screen* is owned by the
 * router (react-router), not this store — navigate via `useAppNavigate`.
 */
interface NavState {
  userMenuOpen: boolean;
  patientMenuOpen: boolean;
  activePatient: ActivePatient;

  /** Remembered so the Notify preview can look up the request it was opened from. */
  selectedReqId: string | null;

  /** Notify preview payload (set by `useAppNavigate().openNotify`). */
  notifyChannel: 'email' | 'fax';
  notifyKind: NotifyKind;
  notifyShareData: NotifyShareData;

  toggleUserMenu: () => void;
  togglePatientMenu: () => void;
  closeMenus: () => void;
  setActivePatient: (p: ActivePatient) => void;
  setSelectedReqId: (id: string | null) => void;
  setNotify: (kind: NotifyKind, shareData?: NotifyShareData) => void;
  setNotifyChannel: (c: 'email' | 'fax') => void;
}

export const useNavStore = create<NavState>((set) => ({
  userMenuOpen: false,
  patientMenuOpen: false,
  activePatient: 'all',
  selectedReqId: null,
  notifyChannel: 'email',
  notifyKind: null,
  notifyShareData: null,

  toggleUserMenu: () => set((s) => ({ userMenuOpen: !s.userMenuOpen, patientMenuOpen: false })),
  togglePatientMenu: () =>
    set((s) => ({ patientMenuOpen: !s.patientMenuOpen, userMenuOpen: false })),
  closeMenus: () => set({ userMenuOpen: false, patientMenuOpen: false }),
  setActivePatient: (activePatient) => set({ activePatient, patientMenuOpen: false }),
  setSelectedReqId: (selectedReqId) => set({ selectedReqId }),
  setNotify: (notifyKind, notifyShareData = null) => set({ notifyKind, notifyShareData }),
  setNotifyChannel: (notifyChannel) => set({ notifyChannel }),
}));
