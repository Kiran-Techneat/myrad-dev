import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import dayjs from 'dayjs';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import OTPInput from 'react-otp-input';
import { Icon } from '@/components/common/Icon';
import { Dropdown } from '@/components/common/Dropdown';
import { showAlert } from '@/components/common/showAlert';
import { useAuthStore } from '@/store/authStore';
import { useNavStore } from '@/store/navStore';
import { useDialogStore } from '@/store/dialogStore';
import { useAppDispatch } from '@/store/hook';
import { userRegister, VerifyRegisterOTP } from '@/redux/auth/action';
import type { IUserRegisterRequest } from '@/redux/auth/types/request';
import { formatUSPhone } from '@/utils/format';
import { applyServerFieldErrors, firstErrorListMessage } from './authErrors';
import { GoogleAuthButton } from './GoogleAuthButton';
import { FacebookAuthButton } from './FacebookAuthButton';

const muiTheme = createTheme({ palette: { primary: { main: '#345d55' } } });

const dobFieldSx = {
  '& .MuiOutlinedInput-root': {
    height: 58,
    borderRadius: '15px',
    fontFamily: 'inherit',
    fontSize: 17,
    color: 'var(--ink)',
    background: 'var(--surface)',
    paddingRight: '10px',
  },
  '& .MuiOutlinedInput-input': { padding: '0 0 0 18px', height: '100%' },
  '& .MuiOutlinedInput-notchedOutline': { border: '2px solid var(--line)' },
  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'var(--line)',
  },
  '& .MuiOutlinedInput-root.Mui-focused': { background: 'var(--card)' },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: 'var(--accent)',
    borderWidth: '2px',
  },
} as const;

interface SignupValues {
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

const schema: yup.ObjectSchema<SignupValues> = yup.object({
  first: yup.string().trim().required('First name is required'),
  last: yup.string().trim().required('Last name is required'),
  email: yup
    .string()
    .trim()
    .required('Email is required')
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address'),
  sex: yup.string().required('Please select an option'),
  dob: yup.string().required('Date of birth is required'),
  phone: yup.string().required('Phone number is required'),
  zip: yup
    .string()
    .required('ZIP code is required')
    .matches(/^\d{5}$/, 'Enter a valid 5-digit ZIP code'),
  pwd: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must include an uppercase letter')
    .matches(/[0-9]/, 'Password must include a number')
    .matches(/[^A-Za-z0-9]/, 'Password must include a special character'),
  pwd2: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('pwd')], "Passwords don't match"),
});

export function SignupForm() {
  const auth = useAuthStore();
  const { goToSignIn } = auth;
  const dispatch = useAppDispatch();
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: yupResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      first: '',
      last: '',
      email: '',
      sex: '',
      dob: '',
      phone: '',
      zip: '',
      pwd: '',
      pwd2: '',
    },
  });

  const pwd = watch('pwd') || '';
  const ruleLen = pwd.length >= 8;
  const ruleUpper = /[A-Z]/.test(pwd);
  const ruleNum = /[0-9]/.test(pwd);
  const ruleSpecial = /[^A-Za-z0-9]/.test(pwd);

  const phoneReg = register('phone');
  const zipReg = register('zip');

  const onSubmit = async (values: SignupValues) => {
    const digits = values.phone.replace(/\D/g, '');
    const payload: IUserRegisterRequest = {
      firstName: values.first.trim(),
      lastName: values.last.trim(),
      gender: values.sex,
      email: values.email.trim().toLowerCase(),
      phoneCode: '+1',
      phoneNo: digits.length > 10 ? digits.slice(-10) : digits,
      zipCode: values.zip,
      dateOfBirth: values.dob,
      password: values.pwd,
      confirmPassword: values.pwd2,
    };
    setBusy(true);
    try {
      const res = await dispatch(userRegister(payload)).unwrap();
      auth.setSessionId(res.sessionId);
      auth.setOtpHint(res.otp ?? null);
      auth.setSignupStep('otp');
    } catch (err: any) {
      const applied = applyServerFieldErrors<SignupValues>(
        err?.errorlist,
        {
          firstName: 'first',
          lastName: 'last',
          gender: 'sex',
          dateOfBirth: 'dob',
          email: 'email',
          zipCode: 'zip',
          phoneNo: 'phone',
          phoneCode: 'phone',
          password: 'pwd',
          confirmPassword: 'pwd2',
        },
        setError,
      );
      if (!applied) {
        showAlert({
          message:
            err?.headers?.message ||
            firstErrorListMessage(err?.errorlist) ||
            err?.message ||
            'Could not create your account.',
          status: 'error',
        });
      }
    } finally {
      setBusy(false);
    }
  };

  if (auth.signupStep === 'otp') {
    return <RegisterOtpStep />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="lbrand">
        <h1 className="serif">Create your account</h1>
        <p>A few details to set up secure access to your images.</p>
      </div>

      <div className="signup-grid">
        <div className="field">
          <label>First name</label>
          <input className="inp" type="text" placeholder="John" {...register('first')} />
          {errors.first && (
            <div className="ac-note" style={{ color: 'var(--rose)', marginTop: 6 }}>
              {errors.first.message}
            </div>
          )}
        </div>
        <div className="field">
          <label>Last name</label>
          <input className="inp" type="text" placeholder="Doe" {...register('last')} />
          {errors.last && (
            <div className="ac-note" style={{ color: 'var(--rose)', marginTop: 6 }}>
              {errors.last.message}
            </div>
          )}
        </div>
      </div>

      <div className="field">
        <label>Email</label>
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

      <div className="signup-grid">
        <div className="field">
          <label>Sex assigned at birth</label>
          <Controller
            control={control}
            name="sex"
            render={({ field }) => (
              <Dropdown
                ddKey="signupSex"
                value={field.value}
                placeholder="Select…"
                size="h58"
                options={['Male', 'Female', 'Others'].map((v) => ({ value: v, label: v }))}
                onPick={(sex) => field.onChange(sex)}
              />
            )}
          />
          {errors.sex && (
            <div className="ac-note" style={{ color: 'var(--rose)', marginTop: 6 }}>
              {errors.sex.message}
            </div>
          )}
        </div>
        <div className="field">
          <label>Date of birth</label>
          <Controller
            control={control}
            name="dob"
            render={({ field }) => (
              <ThemeProvider theme={muiTheme}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(d) =>
                      field.onChange(d && d.isValid() ? d.format('YYYY-MM-DD') : '')
                    }
                    disableFuture
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        onBlur: field.onBlur,
                        error: !!errors.dob,
                        sx: dobFieldSx,
                      },
                    }}
                  />
                </LocalizationProvider>
              </ThemeProvider>
            )}
          />
          {errors.dob && (
            <div className="ac-note" style={{ color: 'var(--rose)', marginTop: 6 }}>
              {errors.dob.message}
            </div>
          )}
        </div>
      </div>

      <div className="signup-grid">
        <div className="field">
          <label>Phone number</label>
          <input
            className="inp"
            type="tel"
            placeholder="+1 (555) 123-4567"
            {...phoneReg}
            onChange={(e) => setValue('phone', formatUSPhone(e.target.value), { shouldValidate: true })}
          />
          {errors.phone && (
            <div className="ac-note" style={{ color: 'var(--rose)', marginTop: 6 }}>
              {errors.phone.message}
            </div>
          )}
        </div>
        <div className="field">
          <label>ZIP code</label>
          <input
            className="inp"
            type="text"
            placeholder="10001"
            maxLength={5}
            {...zipReg}
            onChange={(e) =>
              setValue('zip', e.target.value.replace(/\D/g, '').slice(0, 5), {
                shouldValidate: true,
              })
            }
          />
          {errors.zip && (
            <div className="ac-note" style={{ color: 'var(--rose)', marginTop: 6 }}>
              {errors.zip.message}
            </div>
          )}
        </div>
      </div>

      <div className="field">
        <label>Password</label>
        <input
          className="inp"
          type="password"
          placeholder="Create a password"
          {...register('pwd')}
        />
      </div>

      <div className="pwd-guide">
        <div className={`pwd-rule ${ruleLen ? 'ok' : ''}`}>
          <Icon name="check" sw={2.6} />
          At least 8 characters
        </div>
        <div className={`pwd-rule ${ruleUpper ? 'ok' : ''}`}>
          <Icon name="check" sw={2.6} />
          One uppercase letter
        </div>
        <div className={`pwd-rule ${ruleNum ? 'ok' : ''}`}>
          <Icon name="check" sw={2.6} />
          One number
        </div>
        <div className={`pwd-rule ${ruleSpecial ? 'ok' : ''}`}>
          <Icon name="check" sw={2.6} />
          One special character
        </div>
      </div>

      <div className="field">
        <label>Confirm password</label>
        <input
          className="inp"
          type="password"
          placeholder="Re-enter your password"
          {...register('pwd2')}
        />
        {errors.pwd2 && (
          <div className="ac-note" style={{ color: 'var(--rose)', marginTop: 6 }}>
            {errors.pwd2.message}
          </div>
        )}
      </div>

      <button
        className="btn btn-primary btn-block btn-lg"
        type="submit"
        disabled={busy}
        style={{ marginTop: 6 }}
      >
        {busy ? 'Creating account…' : 'Create account'}
      </button>

      <div className="auth-divider">
        <span>OR</span>
      </div>
      <div className="auth-social-row">
        <GoogleAuthButton />
        <FacebookAuthButton />
      </div>

      <div className="foot">
        Already have an account? <a onClick={goToSignIn}>Sign in</a>
      </div>
    </form>
  );
}

const otpSchema: yup.ObjectSchema<{ otp: string }> = yup.object({
  otp: yup
    .string()
    .required('Enter the 6-digit code')
    .matches(/^\d{6}$/, 'Enter the 6-digit code'),
});

function RegisterOtpStep() {
  const auth = useAuthStore();
  const go = useNavStore((s) => s.go);
  const closeDropdown = useDialogStore((s) => s.closeDropdown);
  const dispatch = useAppDispatch();
  const [busy, setBusy] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<{ otp: string }>({
    resolver: yupResolver(otpSchema),
    mode: 'onTouched',
    defaultValues: { otp: '' },
  });

  const onSubmit = async (values: { otp: string }) => {
    if (!auth.sessionId) {
      showAlert({ message: 'Your session expired. Please start again.', status: 'error' });
      return;
    }
    setBusy(true);
    try {
      await dispatch(VerifyRegisterOTP({ sessionId: auth.sessionId, otp: values.otp })).unwrap();
      auth.setOtpHint(null);
      // VerifyRegisterOTP already persisted the session (accessToken + refreshKey), so
      // log the user straight in and go to the dashboard instead of the sign-in screen.
      closeDropdown();
      auth.signIn();
      go('home');
    } catch (err: any) {
      const applied = applyServerFieldErrors<{ otp: string }>(
        err?.errorlist,
        { otp: 'otp' },
        setError,
      );
      if (!applied) {
        showAlert({
          message:
            err?.headers?.message ||
            firstErrorListMessage(err?.errorlist) ||
            err?.message ||
            'Invalid or expired code.',
          status: 'error',
        });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <button type="button" className="backbtn" onClick={() => auth.setSignupStep('form')}>
        <Icon name="chevronLeft" />
        Back
      </button>
      <div className="lbrand" style={{ marginTop: 16 }}>
        <h1 className="serif">Verify your identity</h1>
        <p>Enter the 6-digit code we sent to your email and phone to finish creating your account.</p>
      </div>
      {auth.otpHint && (
        <div className="help-strip">
          <Icon name="info" sw={1.8} />
          <p>
            Your verification code is <b>{auth.otpHint}</b>
          </p>
        </div>
      )}
      <div className="field">
        <label>Verification code</label>
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
            {errors.otp.message}
          </div>
        )}
      </div>
      <button
        className="btn btn-primary btn-block btn-lg"
        type="submit"
        disabled={busy}
        style={{ marginTop: 6 }}
      >
        {busy ? 'Verifying…' : 'Verify & continue'}
      </button>
    </form>
  );
}
