import { create } from 'zustand';
import type { Study } from '@/types';

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
  | 'selfUpload'
  | 'staff';

export type StaffView = 'upload' | 'walkin' | 'provider';
export type ActivePatient = 'all' | number | string;

interface NavState {
  screen: Screen;
  userMenuOpen: boolean;
  patientMenuOpen: boolean;
  activePatient: ActivePatient;

  /** Request detail */
  selectedReqId: string | null;

  /** Viewer */
  viewerFrom: Screen;
  viewerStudyId: Study['id'] | null;
  viewerTab: 'images' | 'report';

  /** Notify preview */
  notifyChannel: 'email' | 'fax';
  notifyKind: 'request' | 'wizardRequest' | 'share' | null;
  notifyFrom: Screen | 'requestSent' | null;
  notifyShareData: { provider: string; person: string; study: string; date: string } | null;

  /** Staff sub-view is driven here so nav highlights stay in sync. */
  staffView: StaffView;

  go: (screen: Screen) => void;
  goStaff: (view: StaffView) => void;
  toggleUserMenu: () => void;
  togglePatientMenu: () => void;
  setActivePatient: (p: ActivePatient) => void;
  openRequestDetail: (id: string) => void;
  openViewer: (opts: { from: Screen; studyId?: Study['id'] | null; tab?: 'images' | 'report' }) => void;
  setViewerTab: (tab: 'images' | 'report') => void;
  goViewerBack: () => void;
  openNotify: (opts: {
    kind: NavState['notifyKind'];
    from: NavState['notifyFrom'];
    shareData?: NavState['notifyShareData'];
  }) => void;
  setNotifyChannel: (c: 'email' | 'fax') => void;
  closeNotify: () => void;
}

export const useNavStore = create<NavState>((set, get) => ({
  screen: 'home',
  userMenuOpen: false,
  patientMenuOpen: false,
  activePatient: 'all',
  selectedReqId: null,
  viewerFrom: 'requestDetail',
  viewerStudyId: null,
  viewerTab: 'images',
  notifyChannel: 'email',
  notifyKind: null,
  notifyFrom: null,
  notifyShareData: null,
  staffView: 'upload',

  go: (screen) => set({ screen, userMenuOpen: false, patientMenuOpen: false }),
  goStaff: (view) => set({ screen: 'staff', staffView: view, userMenuOpen: false }),
  toggleUserMenu: () => set((s) => ({ userMenuOpen: !s.userMenuOpen, patientMenuOpen: false })),
  togglePatientMenu: () =>
    set((s) => ({ patientMenuOpen: !s.patientMenuOpen, userMenuOpen: false })),
  setActivePatient: (activePatient) => set({ activePatient, patientMenuOpen: false }),
  openRequestDetail: (id) => set({ screen: 'requestDetail', selectedReqId: id }),
  openViewer: ({ from, studyId = null, tab = 'images' }) =>
    set({ screen: 'viewer', viewerFrom: from, viewerStudyId: studyId, viewerTab: tab }),
  setViewerTab: (viewerTab) => set({ viewerTab }),
  goViewerBack: () => set({ screen: get().viewerFrom || 'requestDetail' }),
  openNotify: ({ kind, from, shareData = null }) =>
    set({ screen: 'notify', notifyKind: kind, notifyFrom: from, notifyShareData: shareData }),
  setNotifyChannel: (notifyChannel) => set({ notifyChannel }),
  closeNotify: () =>
    set((s) => ({ screen: s.notifyFrom === 'requestSent' ? 'wizard' : (s.notifyFrom as Screen) || 'requestDetail' })),
}));
