import { create } from 'zustand';

export type SelfUploadType = 'images' | 'report';
export type SelfUploadSrc = 'cd' | 'folder' | 'link';

interface SelfUploadState {
  step: 1 | 2 | 3;
  selPerson: number | string | null;
  uploadType: SelfUploadType;
  desc: string;
  when: string;
  notes: string;
  reportNotes: string;
  src: SelfUploadSrc;
  linkUrl: string;
  linkProvider: string;
  linkExpiry: string;
  linkNote: string;
  uploading: boolean;
  done: boolean;
  /** Files captured from the folder / file picker for a real upload. */
  files: File[];

  reset: () => void;
  patch: (patch: Partial<SelfUploadState>) => void;
}

function fresh(): Omit<SelfUploadState, 'reset' | 'patch'> {
  return {
    step: 1,
    selPerson: null,
    uploadType: 'images',
    desc: '',
    when: '',
    notes: '',
    reportNotes: '',
    src: 'cd',
    linkUrl: '',
    linkProvider: '',
    linkExpiry: '',
    linkNote: '',
    uploading: false,
    done: false,
    files: [],
  };
}

export const useSelfUploadStore = create<SelfUploadState>((set) => ({
  ...fresh(),
  reset: () => set(fresh()),
  patch: (patch) => set(patch),
}));
