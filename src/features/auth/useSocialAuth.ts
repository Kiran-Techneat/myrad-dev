import { useState } from 'react';
import { useAppDispatch } from '@/store/hook';
import { useAuthStore } from '@/store/authStore';
import { useNavStore } from '@/store/navStore';
import { useDialogStore } from '@/store/dialogStore';
import {
  userGoogleLogin,
  userGoogleLoginVerify,
  userFacebookLogin,
  userFacebookLoginVerify,
} from '@/redux/auth/action';
import type { IUserGoogleLoginResponse } from '@/redux/auth/types/response';
import { showAlert } from '@/components/common/showAlert';
import { firstErrorListMessage } from './authErrors';
import type { SocialCompleteValues } from './SocialCompleteModal';

type Provider = 'google' | 'facebook';

const socialErrorMessage = (err: any, fallback: string): string =>
  err?.headers?.message || firstErrorListMessage(err?.errorlist) || err?.message || fallback;

/** Split a formatted US phone ("+1 (555) 123-4567") into { phoneCode, phoneNo }. */
function splitPhone(formatted: string): { phoneCode: string; phoneNo: string } {
  const digits = (formatted || '').replace(/\D/g, '');
  const local = digits.length > 10 ? digits.slice(-10) : digits;
  return { phoneCode: '+1', phoneNo: local };
}

export function useSocialAuth(provider: Provider) {
  const dispatch = useAppDispatch();
  const auth = useAuthStore();
  const go = useNavStore((s) => s.go);
  const closeDropdown = useDialogStore((s) => s.closeDropdown);

  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  // Email carried from a Google id token; Facebook must collect it in the modal.
  const [prefEmail, setPrefEmail] = useState('');

  const finishLogin = () => {
    closeDropdown();
    auth.signIn();
    go('home');
  };

  // Given a first-step response, either finish (tokens present) or open the
  // completion modal (only a sessionId came back).
  const handleFirstStep = (res: IUserGoogleLoginResponse | undefined, email?: string) => {
    setSubmitting(false);
    if (!res) return;
    if (res.accessToken && res.refreshKey) {
      finishLogin();
      return;
    }
    if (res.sessionId) {
      setSessionId(res.sessionId);
      setPrefEmail(email || '');
      setModalOpen(true);
    }
  };

  const startGoogle = async (idToken: string, email?: string) => {
    setSubmitting(true);
    try {
      const res = await dispatch(userGoogleLogin({ idToken })).unwrap();
      handleFirstStep(res, email);
    } catch (err: any) {
      setSubmitting(false);
      showAlert({ message: socialErrorMessage(err, 'Google sign-in failed.'), status: 'error' });
    }
  };

  const startFacebook = async (accessToken: string) => {
    setSubmitting(true);
    try {
      const res = await dispatch(userFacebookLogin({ accessToken })).unwrap();
      handleFirstStep(res);
    } catch (err: any) {
      setSubmitting(false);
      showAlert({ message: socialErrorMessage(err, 'Facebook sign-in failed.'), status: 'error' });
    }
  };

  const submitComplete = async (values: SocialCompleteValues) => {
    if (!sessionId) return;
    setSubmitting(true);
    const { phoneCode, phoneNo } = splitPhone(values.phone);
    try {
      if (provider === 'google') {
        await dispatch(
          userGoogleLoginVerify({
            sessionId,
            phoneCode,
            phoneNo,
            dateOfBirth: values.dob,
            zipCode: values.zip,
          }),
        ).unwrap();
      } else {
        await dispatch(
          userFacebookLoginVerify({
            sessionId,
            email: values.email || prefEmail,
            phoneCode,
            phoneNo,
            dateOfBirth: values.dob,
            zipCode: values.zip,
          }),
        ).unwrap();
      }
      setModalOpen(false);
      finishLogin();
    } catch (err: any) {
      setSubmitting(false);
      showAlert({
        message: socialErrorMessage(err, 'Could not complete sign-in.'),
        status: 'error',
      });
    }
  };

  return {
    submitting,
    modalOpen,
    prefEmail,
    startGoogle,
    startFacebook,
    submitComplete,
    closeModal: () => setModalOpen(false),
  };
}
