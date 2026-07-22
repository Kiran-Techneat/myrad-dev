import { create } from 'zustand';

export interface ShareItem {
  id: number | string;
  name: string;
  patient: string;
  images: boolean;
  report: boolean;
  reportAvailable: boolean;
}

export interface ShareConfirmData {
  person: string;
  studies: { name: string; contents: string }[];
  recipients: { name: string; spec: string; init: string; method: string; methodDetail: string }[];
}

interface ShareState {
  shareOpen: boolean;
  shareStudyName: string;
  shareMeta: string;
  shareItems: ShareItem[];
  shareProviderIds: number[];
  shareSearch: string;

  shareConfirmOpen: boolean;
  shareConfirmData: ShareConfirmData | null;

  noticeOpen: boolean;
  noticeTitle: string;
  noticeMsg: string;

  openShare: (opts: { studyName: string; meta: string; items: ShareItem[] }) => void;
  closeShare: () => void;
  setSearch: (v: string) => void;
  toggleProvider: (idx: number) => void;
  addProviderId: (idx: number) => void;
  toggleItemImg: (idx: number) => void;
  toggleItemRep: (idx: number) => void;
  removeItem: (idx: number) => void;
  openConfirm: (data: ShareConfirmData) => void;
  closeConfirm: () => void;
  reset: () => void;
}

export const useShareStore = create<ShareState>((set) => ({
  shareOpen: false,
  shareStudyName: '',
  shareMeta: '',
  shareItems: [],
  shareProviderIds: [],
  shareSearch: '',
  shareConfirmOpen: false,
  shareConfirmData: null,
  noticeOpen: false,
  noticeTitle: '',
  noticeMsg: '',

  openShare: ({ studyName, meta, items }) =>
    set({
      shareOpen: true,
      shareStudyName: studyName,
      shareMeta: meta,
      shareItems: items,
      shareProviderIds: [],
      shareSearch: '',
    }),
  closeShare: () => set({ shareOpen: false, shareSearch: '', shareProviderIds: [] }),
  setSearch: (shareSearch) => set({ shareSearch }),
  toggleProvider: (idx) =>
    set((s) => ({
      shareProviderIds: s.shareProviderIds.includes(idx)
        ? s.shareProviderIds.filter((x) => x !== idx)
        : [...s.shareProviderIds, idx],
    })),
  addProviderId: (idx) =>
    set((s) => ({ shareProviderIds: [...s.shareProviderIds, idx] })),
  toggleItemImg: (idx) =>
    set((s) => {
      const arr = [...s.shareItems];
      const cur = arr[idx];
      if (!cur || (cur.images && !cur.report)) return {};
      arr[idx] = { ...cur, images: !cur.images };
      return { shareItems: arr };
    }),
  toggleItemRep: (idx) =>
    set((s) => {
      const arr = [...s.shareItems];
      const cur = arr[idx];
      if (!cur || (cur.report && !cur.images)) return {};
      arr[idx] = { ...cur, report: !cur.report };
      return { shareItems: arr };
    }),
  removeItem: (idx) => set((s) => ({ shareItems: s.shareItems.filter((_, i) => i !== idx) })),
  openConfirm: (shareConfirmData) => set({ shareConfirmOpen: true, shareConfirmData }),
  closeConfirm: () => set({ shareConfirmOpen: false, shareConfirmData: null }),
  reset: () => set({ shareOpen: false, shareItems: [], shareProviderIds: [], shareSearch: '' }),
}));
