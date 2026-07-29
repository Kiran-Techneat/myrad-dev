import { create } from 'zustand';
import type { Study } from '@/types';

export interface ConfirmData {
  title: string;
  msg: string;
  confirmLabel: string;
  noticeTitle?: string;
  noticeMsg?: string;
  run?: () => void;
}

export type FormContext = 'wizard' | 'profile' | 'management' | 'share' | null;

export interface ChatMessage {
  who: 'support' | 'me';
  text: string;
}

interface HelpState {
  view: 'hub' | 'chat' | 'feedback' | 'contact';
  chatInput: string;
  chatLog: ChatMessage[];
  feedbackMsg: string;
  feedbackFileName: string;
  contactEmail: string;
  contactMsg: string;
}

interface DialogState {
  getSheetOpen: boolean;

  noticeOpen: boolean;
  noticeTitle: string;
  noticeMsg: string;

  confirmOpen: boolean;
  confirmData: ConfirmData | null;

  imgDetailOpen: boolean;
  imgDetailId: Study['id'] | null;

  /** Report preview modal (per-study PDF at `reportUrl`). */
  reportModalOpen: boolean;
  reportModalUrl: string | null;

  helpOpen: boolean;
  help: HelpState;

  /** Which dropdown (custom select) is currently open, keyed by id. */
  openDropdown: string | null;

  /** Report file uploads keyed by a stable string (reqitem-…, img-…). */
  reportUploads: Record<string, string>;
  /** Reminder sent flags keyed by study id. */
  reminderSentIds: Record<string, boolean>;

  openGetSheet: () => void;
  closeGetSheet: () => void;
  showNotice: (title: string, msg: string) => void;
  closeNotice: () => void;
  askConfirm: (data: ConfirmData) => void;
  confirmNo: () => void;
  confirmYes: () => void;
  openImgDetail: (id: Study['id']) => void;
  closeImgDetail: () => void;
  openReportModal: (url: string) => void;
  closeReportModal: () => void;
  toggleHelp: () => void;
  closeHelp: () => void;
  setHelp: (patch: Partial<HelpState>) => void;
  setHelpView: (view: HelpState['view']) => void;
  sendChat: () => void;
  toggleDropdown: (key: string) => void;
  closeDropdown: () => void;
  setReportUpload: (key: string, name: string) => void;
  markReminderSent: (id: Study['id']) => void;
}

const initialHelp: HelpState = {
  view: 'hub',
  chatInput: '',
  chatLog: [{ who: 'support', text: "Hi! I'm here to help with MyRad — what's up?" }],
  feedbackMsg: '',
  feedbackFileName: '',
  contactEmail: '',
  contactMsg: '',
};

export const useDialogStore = create<DialogState>((set, get) => ({
  getSheetOpen: false,
  noticeOpen: false,
  noticeTitle: '',
  noticeMsg: '',
  confirmOpen: false,
  confirmData: null,
  imgDetailOpen: false,
  imgDetailId: null,
  reportModalOpen: false,
  reportModalUrl: null,
  helpOpen: false,
  help: { ...initialHelp },
  openDropdown: null,
  reportUploads: {},
  reminderSentIds: {},

  openGetSheet: () => set({ getSheetOpen: true }),
  closeGetSheet: () => set({ getSheetOpen: false }),
  showNotice: (noticeTitle, noticeMsg) => set({ noticeOpen: true, noticeTitle, noticeMsg }),
  closeNotice: () => set({ noticeOpen: false, noticeTitle: '', noticeMsg: '' }),
  askConfirm: (confirmData) => set({ confirmOpen: true, confirmData }),
  confirmNo: () => set({ confirmOpen: false, confirmData: null }),
  confirmYes: () => {
    const cd = get().confirmData;
    set({ confirmOpen: false, confirmData: null });
    cd?.run?.();
    if (cd)
      set({ noticeOpen: true, noticeTitle: cd.noticeTitle || 'Done', noticeMsg: cd.noticeMsg || '' });
  },
  openImgDetail: (id) => set({ imgDetailOpen: true, imgDetailId: id }),
  closeImgDetail: () => set({ imgDetailOpen: false }),
  openReportModal: (reportModalUrl) => set({ reportModalOpen: true, reportModalUrl }),
  closeReportModal: () => set({ reportModalOpen: false, reportModalUrl: null }),
  toggleHelp: () =>
    set((s) => ({ helpOpen: !s.helpOpen, help: { ...s.help, view: 'hub' } })),
  closeHelp: () => set({ helpOpen: false }),
  setHelp: (patch) => set((s) => ({ help: { ...s.help, ...patch } })),
  setHelpView: (view) => set((s) => ({ help: { ...s.help, view } })),
  sendChat: () => {
    const msg = get().help.chatInput.trim();
    if (!msg) return;
    set((s) => ({
      help: {
        ...s.help,
        chatInput: '',
        chatLog: [
          ...s.help.chatLog,
          { who: 'me', text: msg },
          { who: 'support', text: 'Thanks — a MyRad specialist will be with you shortly.' },
        ],
      },
    }));
  },
  toggleDropdown: (key) =>
    set((s) => ({ openDropdown: s.openDropdown === key ? null : key })),
  closeDropdown: () => set({ openDropdown: null }),
  setReportUpload: (key, name) =>
    set((s) => ({ reportUploads: { ...s.reportUploads, [key]: name } })),
  markReminderSent: (id) =>
    set((s) => ({ reminderSentIds: { ...s.reminderSentIds, [String(id)]: true } })),
}));
