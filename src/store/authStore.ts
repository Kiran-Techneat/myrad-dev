import { create } from 'zustand';

export interface SignupForm {
  first: string;
  last: string;
  email: string;
  sex: string;
  dob: string;
  phone: string;
  zip: string;
  pwd: string;
  pwd2: string;
}

const emptySignup: SignupForm = {
  first: '', last: '', email: '', sex: '', dob: '', phone: '', zip: '', pwd: '', pwd2: '',
};

interface AuthState {
  loggedIn: boolean;
  loginTab: 'phone' | 'email';
  otp: boolean;
  authView: 'login' | 'signup';
  signupDone: boolean;
  signup: SignupForm;

  setLoginTab: (tab: 'phone' | 'email') => void;
  goOtp: () => void;
  backToLogin: () => void;
  signIn: () => void;
  signOut: () => void;
  goToSignUp: () => void;
  goToSignIn: () => void;
  patchSignup: (patch: Partial<SignupForm>) => void;
  completeSignup: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  loggedIn: false,
  loginTab: 'phone',
  otp: false,
  authView: 'login',
  signupDone: false,
  signup: { ...emptySignup },

  setLoginTab: (loginTab) => set({ loginTab }),
  goOtp: () => set({ otp: true }),
  backToLogin: () => set({ otp: false }),
  signIn: () => set({ loggedIn: true, otp: false }),
  signOut: () => set({ loggedIn: false, otp: false }),
  goToSignUp: () => set({ authView: 'signup', signupDone: false }),
  goToSignIn: () => set({ authView: 'login', signupDone: false }),
  patchSignup: (patch) => set((s) => ({ signup: { ...s.signup, ...patch } })),
  completeSignup: () => set({ signupDone: true }),
}));
