import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import OTPInput from 'react-otp-input';
import { Icon } from '@/components/common/Icon';
import { showAlert } from '@/components/common/showAlert';
import { useAuthStore } from '@/store/authStore';
import { useNavStore } from '@/store/navStore';
import { useDialogStore } from '@/store/dialogStore';
import { useAppDispatch } from '@/store/hook';
import { userLogin, userphonelogin, userLoginVerification } from '@/redux/auth/action';
import { formatUSPhone } from '@/utils/format';
import { applyServerFieldErrors, firstErrorListMessage } from './authErrors';
import { SignupForm } from './SignupForm';
import { GoogleAuthButton } from './GoogleAuthButton';
import { FacebookAuthButton } from './FacebookAuthButton';

function SocialAuthRow() {
  return (
    <>
      <div className="auth-divider">
        <span>OR</span>
      </div>
      <div className="auth-social-row">
        <GoogleAuthButton />
        <FacebookAuthButton />
      </div>
    </>
  );
}

function TrustBar() {
  return (
    <div
      className="trust-bar"
      style={{ justifyContent: 'center', background: 'none', border: 'none', padding: '16px 0 0' }}
    >
      <span className="tbadge">
        <Icon name="shield" />
        HIPAA Compliant
      </span>
      <span className="tbadge">
        <Icon name="checkCircle" />
        SOC 2 Type II
      </span>
      <span className="tbadge">
        <Icon name="lock" />
        256-bit Encrypted
      </span>
    </div>
  );
}

export function AuthScreen() {
  const auth = useAuthStore();
  const go = useNavStore((s) => s.go);
  const openDropdownReset = useDialogStore((s) => s.closeDropdown);

  const signIn = () => {
    openDropdownReset();
    auth.signIn();
    go('home');
  };

  const isSignup = auth.authView === 'signup';

  return (
    <div className="app">
      <div className="loginwrap">
        <div className="loginside">
          <div className="loginside-lockup">
            <div className="loginside-ic">
              <Icon name="grid" />
            </div>
            <span className="loginside-wordmark serif">MyRad Images</span>
          </div>
          <h1 className="serif">Your medical images, all in one place.</h1>
          <div className="loginside-feats">
            <div className="loginside-feat">
              <Icon name="clipboard" />
              Request studies or images from any imaging center
            </div>
            <div className="loginside-feat">
              <Icon name="clipboard" />
              See your reports as soon as they&apos;re ready
            </div>
            <div className="loginside-feat">
              <Icon name="share" />
              Share securely with family, friends, or healthcare provider
            </div>
          </div>
          <div className="loginside-bg">
            <Icon name="grid" />
          </div>
        </div>

        <div className="loginform-wrap">
          <div className={`logincard ${isSignup ? 'wide' : ''}`}>
            {isSignup ? (
              auth.signupDone ? (
                <>
                  <div className="lbrand" style={{ textAlign: 'center', alignItems: 'center' }}>
                    <div className="su-done-ic" style={{ margin: '0 auto 8px' }}>
                      <Icon name="check" sw={2.2} />
                    </div>
                    <h1 className="serif">Account created</h1>
                    <p>
                      Your account is ready. Sign in with the email and password you just created to
                      get started.
                    </p>
                  </div>
                  <button className="btn btn-primary btn-block btn-lg" onClick={auth.goToSignIn}>
                    Go to sign in
                  </button>
                </>
              ) : (
                <SignupForm />
              )
            ) : auth.otp ? (
              <OtpView onVerify={signIn} />
            ) : (
              <LoginView />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginView() {
  const auth = useAuthStore();
  return (
    <>
      <div className="lbrand">
        <h1 className="serif">Welcome</h1>
        <p>Sign in to view and manage your medical images.</p>
      </div>
      <div className="seg">
        <button
          className={`seg-btn ${auth.loginTab === 'phone' ? 'on' : ''}`}
          onClick={() => auth.setLoginTab('phone')}
        >
          Phone
        </button>
        <button
          className={`seg-btn ${auth.loginTab === 'email' ? 'on' : ''}`}
          onClick={() => auth.setLoginTab('email')}
        >
          Email
        </button>
      </div>

      {auth.loginTab === 'phone' ? <PhoneLoginForm /> : <EmailLoginForm />}

      <SocialAuthRow />

      <div className="foot">
        New to MyRad? <a onClick={auth.goToSignUp}>Create an account</a>
      </div>
      <TrustBar />
    </>
  );
}

interface PhoneValues {
  phone: string;
}

const phoneSchema: yup.ObjectSchema<PhoneValues> = yup.object({
  phone: yup
    .string()
    .required('Mobile number is required')
    .test('len', 'Enter a valid mobile number', (v) => (v || '').replace(/\D/g, '').length >= 10),
});

function PhoneLoginForm() {
  const auth = useAuthStore();
  const dispatch = useAppDispatch();
  const [busy, setBusy] = useState(false);
  const {
    handleSubmit,
    setValue,
    setError,
    watch,
    register,
    formState: { errors },
  } = useForm<PhoneValues>({
    resolver: yupResolver(phoneSchema),
    mode: 'onTouched',
    defaultValues: { phone: '' },
  });
  const phoneReg = register('phone');

  const onSubmit = async (values: PhoneValues) => {
    const phoneNo = values.phone.replace(/\D/g, '').slice(-10);
    setBusy(true);
    try {
      const res = await dispatch(userphonelogin({ phoneNo })).unwrap();
      auth.setSessionId(res.sessionId);
      auth.setPendingUsername(phoneNo);
      auth.setOtpHint(res.otp ?? null);
      auth.goOtp();
    } catch (err: any) {
      const applied = applyServerFieldErrors<PhoneValues>(
        err?.errorlist,
        { phoneNo: 'phone', phone: 'phone' },
        setError,
      );
      if (!applied) {
        showAlert({
          message:
            err?.headers?.message ||
            firstErrorListMessage(err?.errorlist) ||
            err?.message ||
            'Unable to send code. Please try again.',
          status: 'error',
        });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="field">
        <label>Mobile number</label>
        <input
          className="inp"
          type="tel"
          placeholder="+1 (248) 737-6695"
          value={watch('phone')}
          name={phoneReg.name}
          ref={phoneReg.ref}
          onBlur={phoneReg.onBlur}
          onChange={(e) => setValue('phone', formatUSPhone(e.target.value), { shouldValidate: true })}
        />
        {errors.phone && (
          <div className="ac-note" style={{ color: 'var(--rose)', marginTop: 6 }}>
            {errors.phone.message}
          </div>
        )}
      </div>
      <div className="help-strip">
        <Icon name="bulb" sw={1.8} />
        <p>
          No password needed. We text you a <b>6-digit code</b> to sign in safely.
        </p>
      </div>
      <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={busy}>
        {busy ? 'Sending…' : 'Send my code'}
      </button>
    </form>
  );
}

interface EmailValues {
  email: string;
  pwd: string;
}

const emailSchema: yup.ObjectSchema<EmailValues> = yup.object({
  email: yup
    .string()
    .trim()
    .required('Email is required')
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address'),
  pwd: yup.string().required('Password is required'),
});

function EmailLoginForm() {
  const auth = useAuthStore();
  const dispatch = useAppDispatch();
  const [busy, setBusy] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<EmailValues>({
    resolver: yupResolver(emailSchema),
    mode: 'onTouched',
    defaultValues: { email: '', pwd: '' },
  });

  const onSubmit = async (values: EmailValues) => {
    const username = values.email.trim().toLowerCase();
    setBusy(true);
    try {
      const res = await dispatch(userLogin({ username, password: values.pwd })).unwrap();
      auth.setSessionId(res.sessionId);
      auth.setPendingUsername(username);
      auth.setOtpHint(res.otp ?? null);
      auth.goOtp();
    } catch (err: any) {
      const applied = applyServerFieldErrors<EmailValues>(
        err?.errorlist,
        { username: 'email', email: 'email', password: 'pwd', pwd: 'pwd' },
        setError,
      );
      if (!applied) {
        showAlert({
          message:
            err?.headers?.message ||
            firstErrorListMessage(err?.errorlist) ||
            err?.message ||
            'Invalid email or password.',
          status: 'error',
        });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="field">
        <label>Email address</label>
        <input
          className="inp"
          type="email"
          placeholder="john.doe@example.com"
          {...register('email')}
        />
        {errors.email && (
          <div className="ac-note" style={{ color: 'var(--rose)', marginTop: 6 }}>
            {errors.email.message}
          </div>
        )}
      </div>
      <div className="field">
        <label>Password</label>
        <input
          className="inp"
          type="password"
          placeholder="Enter your password"
          {...register('pwd')}
        />
        {errors.pwd && (
          <div className="ac-note" style={{ color: 'var(--rose)', marginTop: 6 }}>
            {errors.pwd.message}
          </div>
        )}
      </div>
      <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

interface OtpValues {
  otp: string;
}

const otpSchema: yup.ObjectSchema<OtpValues> = yup.object({
  otp: yup
    .string()
    .required('Enter the 6-digit code')
    .matches(/^\d{6}$/, 'Enter the 6-digit code'),
});

function OtpView({ onVerify }: { onVerify: () => void }) {
  const auth = useAuthStore();
  const dispatch = useAppDispatch();
  const [busy, setBusy] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpValues>({
    resolver: yupResolver(otpSchema),
    mode: 'onTouched',
    defaultValues: { otp: '' },
  });

  const isPhone = /^\d{10}$/.test(auth.pendingUsername || '');
  const destination = isPhone
    ? formatUSPhone(auth.pendingUsername || '')
    : auth.pendingUsername || 'your account';

  const onSubmit = async (values: OtpValues) => {
    const otp = values.otp;
    if (!auth.sessionId || !auth.pendingUsername) {
      showAlert({ message: 'Your session expired. Please start again.', status: 'error' });
      return;
    }
    setBusy(true);
    try {
      await dispatch(
        userLoginVerification({
          username: auth.pendingUsername,
          sessionId: auth.sessionId,
          otp,
        }),
      ).unwrap();
      auth.setOtpHint(null);
      onVerify();
    } catch (err: any) {
      showAlert({
        message:
          err?.headers?.message ||
          firstErrorListMessage(err?.errorlist) ||
          err?.message ||
          'Invalid or expired code.',
        status: 'error',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    if (!auth.pendingUsername) return;
    try {
      if (isPhone) {
        const res = await dispatch(userphonelogin({ phoneNo: auth.pendingUsername })).unwrap();
        auth.setSessionId(res.sessionId);
        auth.setOtpHint(res.otp ?? null);
        showAlert({ message: 'A new code has been sent.', status: 'success' });
      }
      // Email 2FA cannot be re-triggered without the password; user goes Back to retry.
    } catch (err: any) {
      showAlert({
        message:
          err?.headers?.message ||
          firstErrorListMessage(err?.errorlist) ||
          err?.message ||
          'Could not resend the code.',
        status: 'error',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <button type="button" className="backbtn" onClick={auth.backToLogin}>
        <Icon name="chevronLeft" />
        Back
      </button>
      <div className="lbrand" style={{ marginTop: 16 }}>
        <h1 className="serif">Enter your code</h1>
        <p>
          We sent a 6-digit code to <b style={{ color: 'var(--ink)' }}>{destination}</b>
        </p>
      </div>
      {auth.otpHint && (
        <div className="help-strip">
          <Icon name="info" sw={1.8} />
          <p>
            Your verification code is <b>{auth.otpHint}</b>
          </p>
        </div>
      )}
      <Controller
        control={control}
        name="otp"
        render={({ field }) => (
          <OTPInput
            value={field.value}
            onChange={(value) => field.onChange(value.replace(/\D/g, ''))}
            numInputs={6}
            inputType="tel"
            shouldAutoFocus
            skipDefaultStyles
            containerStyle="otp-row"
            renderSeparator={<span />}
            renderInput={(props) => <input {...props} className="inp" />}
          />
        )}
      />
      {errors.otp && (
        <div className="ac-note" style={{ color: 'var(--rose)', marginTop: 6 }}>
          {errors.otp.message || 'Enter all 6 digits of your code'}
        </div>
      )}
      <div className="foot" style={{ marginBottom: 20 }}>
        Didn&apos;t get it? <a onClick={() => void handleResend()}>Resend code</a>
      </div>
      <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={busy}>
        {busy ? 'Verifying…' : 'Verify & continue'}
      </button>
    </form>
  );
}
