import { create } from 'zustand';
import type { FormContext } from './dialogStore';

export interface FamilyForm {
  first: string;
  last: string;
  rel: string;
  relOther: string;
  dob: string;
  sex: string;
  email: string;
  phone: string;
  /** Set when editing an existing family member (from the profile API). */
  memberId: string | null;
}

export interface CenterForm {
  name: string;
  addr: string;
  phone: string;
  email: string;
  fax: string;
}

export interface ProviderForm {
  name: string;
  email: string;
  phone: string;
  fax: string;
  spec: string;
}

interface FormsState {
  addFamilyOpen: boolean;
  addFamilyCtx: FormContext;
  afForm: FamilyForm;

  addCenterOpen: boolean;
  addCenterCtx: FormContext;
  acForm: CenterForm;

  addProviderOpen: boolean;
  apForm: ProviderForm;

  openAddFamily: (ctx: FormContext) => void;
  openEditFamily: (member: Partial<FamilyForm>, ctx?: FormContext) => void;
  closeAddFamily: () => void;
  patchFamily: (patch: Partial<FamilyForm>) => void;
  resetFamily: () => void;

  openAddCenter: (ctx: FormContext) => void;
  closeAddCenter: () => void;
  patchCenter: (patch: Partial<CenterForm>) => void;
  resetCenter: () => void;

  openAddProvider: () => void;
  closeAddProvider: () => void;
  patchProvider: (patch: Partial<ProviderForm>) => void;
  resetProvider: () => void;
}

const emptyFamily: FamilyForm = { first: '', last: '', rel: '', relOther: '', dob: '', sex: '', email: '', phone: '', memberId: null };
const emptyCenter: CenterForm = { name: '', addr: '', phone: '', email: '', fax: '' };
const emptyProvider: ProviderForm = { name: '', email: '', phone: '', fax: '', spec: '' };

export const useFormsStore = create<FormsState>((set) => ({
  addFamilyOpen: false,
  addFamilyCtx: null,
  afForm: { ...emptyFamily },
  addCenterOpen: false,
  addCenterCtx: null,
  acForm: { ...emptyCenter },
  addProviderOpen: false,
  apForm: { ...emptyProvider },

  openAddFamily: (ctx) => set({ addFamilyOpen: true, addFamilyCtx: ctx, afForm: { ...emptyFamily } }),
  openEditFamily: (member, ctx = 'profile') =>
    set({ addFamilyOpen: true, addFamilyCtx: ctx, afForm: { ...emptyFamily, ...member } }),
  closeAddFamily: () => set({ addFamilyOpen: false }),
  patchFamily: (patch) => set((s) => ({ afForm: { ...s.afForm, ...patch } })),
  resetFamily: () => set({ afForm: { ...emptyFamily } }),

  openAddCenter: (ctx) => set({ addCenterOpen: true, addCenterCtx: ctx }),
  closeAddCenter: () => set({ addCenterOpen: false }),
  patchCenter: (patch) => set((s) => ({ acForm: { ...s.acForm, ...patch } })),
  resetCenter: () => set({ acForm: { ...emptyCenter } }),

  openAddProvider: () => set({ addProviderOpen: true }),
  closeAddProvider: () => set({ addProviderOpen: false }),
  patchProvider: (patch) => set((s) => ({ apForm: { ...s.apForm, ...patch } })),
  resetProvider: () => set({ apForm: { ...emptyProvider } }),
}));
