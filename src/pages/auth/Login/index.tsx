import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common/Icon';
import { showAlert } from '@/components/common/showAlert';
import { useAuthStore } from '@/store/auth/authStore';
import { useAppDispatch } from '@/store/hook';
import { userLogin, userphonelogin } from '@/redux/auth/action';
import { formatUSPhone } from '@/utils/format';
import { cx } from '@/utils/cx';
import { applyServerFieldErrors, firstErrorListMessage } from '@/components/auth/authErrors';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { FacebookAuthButton } from '@/components/auth/FacebookAuthButton';
import styles from '../auth.module.scss';

function SocialAuthRow() {

    return (
        <>
            <div className={styles['auth-divider']}>
                <span>OR</span>
            </div>
            <div className={styles['auth-social-row']}>
                <GoogleAuthButton />
                
                <FacebookAuthButton />
            </div>
        </>
    );
}

function TrustBar() {
    return (
        <div
            className={styles['trust-bar']}
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

/** `/login` */
export function LoginRoute() {
    return <LoginView />;
}

function LoginView() {
    const auth = useAuthStore();
    const navigate = useNavigate();
    return (
        <>
            <div className={styles.lbrand}>
                <h1 className="serif">Welcome</h1>
                <p>Sign in to view and manage your medical images.</p>
            </div>
            <div className={styles.seg}>
                <button
                    className={cx(styles['seg-btn'], auth.loginTab === 'phone' && styles.on)}
                    onClick={() => auth.setLoginTab('phone')}
                >
                    Phone
                </button>
                <button
                    className={cx(styles['seg-btn'], auth.loginTab === 'email' && styles.on)}
                    onClick={() => auth.setLoginTab('email')}
                >
                    Email
                </button>
            </div>

            {auth.loginTab === 'phone' ? <PhoneLoginForm /> : <EmailLoginForm />}

            <SocialAuthRow />

            <div className="foot">
                New to MyRad? <a onClick={() => { auth.goToSignUp(); navigate('/signup'); }}>Create an account</a>
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
    const navigate = useNavigate();
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
            navigate('/verify-otp');
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
    const navigate = useNavigate();
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
            navigate('/verify-otp');
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
