import { create } from 'zustand';
import { isUserAuthenticated } from '@/utils/authUtility';

type SignupStep = 'form' | 'otp' | 'done';

interface AuthState {
  loggedIn: boolean;
  loginTab: 'phone' | 'email';
  otp: boolean;
  authView: 'login' | 'signup';
  signupDone: boolean;

  // Cross-step context for the real auth flows.
  sessionId: string | null;
  pendingUsername: string | null;
  signupStep: SignupStep;
  otpHint: string | null;

  setLoginTab: (tab: 'phone' | 'email') => void;
  goOtp: () => void;
  backToLogin: () => void;
  signIn: () => void;
  signOut: () => void;
  goToSignUp: () => void;
  goToSignIn: () => void;
  completeSignup: () => void;

  setSessionId: (id: string | null) => void;
  setPendingUsername: (username: string | null) => void;
  setSignupStep: (step: SignupStep) => void;
  setOtpHint: (hint: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  loggedIn: isUserAuthenticated(),
  loginTab: 'phone',
  otp: false,
  authView: 'login',
  signupDone: false,

  sessionId: null,
  pendingUsername: null,
  signupStep: 'form',
  otpHint: null,

  setLoginTab: (loginTab) => set({ loginTab }),
  goOtp: () => set({ otp: true }),
  backToLogin: () => set({ otp: false, sessionId: null }),
  signIn: () => set({ loggedIn: true, otp: false }),
  signOut: () => set({ loggedIn: false, otp: false, sessionId: null, pendingUsername: null }),
  goToSignUp: () => set({ authView: 'signup', signupDone: false, signupStep: 'form' }),
  goToSignIn: () =>
    set({ authView: 'login', signupDone: false, signupStep: 'form', sessionId: null }),
  completeSignup: () => set({ signupDone: true, signupStep: 'done' }),

  setSessionId: (sessionId) => set({ sessionId }),
  setPendingUsername: (pendingUsername) => set({ pendingUsername }),
  setSignupStep: (signupStep) => set({ signupStep }),
  setOtpHint: (otpHint) => set({ otpHint }),
}));
