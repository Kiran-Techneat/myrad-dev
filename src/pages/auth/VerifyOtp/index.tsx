import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import OTPInput from 'react-otp-input';
import { Navigate, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common/Icon';
import { showAlert } from '@/components/common/showAlert';
import { useAuthStore } from '@/store/auth/authStore';
import { useDialogStore } from '@/store/dashboard/dialogStore';
import { useAppDispatch } from '@/store/hook';
import { userphonelogin, userLoginVerification } from '@/redux/auth/action';
import { formatUSPhone } from '@/utils/format';
import { firstErrorListMessage } from '@/components/auth/authErrors';
import styles from '../auth.module.scss';

/** `/verify-otp` — login 2FA step. Direct visits without an active session bounce to /login. */
export function OtpRoute() {
    const auth = useAuthStore();
    const navigate = useNavigate();
    const closeDropdown = useDialogStore((s) => s.closeDropdown);

    if (!auth.sessionId || !auth.pendingUsername) {
        return <Navigate to="/login" replace />;
    }

    const onVerify = () => {
        closeDropdown();
        auth.signIn();
        navigate('/dashboard');
    };

    return <OtpView onVerify={onVerify} />;
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
    const navigate = useNavigate();
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
            <button type="button" className="backbtn" onClick={() => { auth.backToLogin(); navigate('/login'); }}>
                <Icon name="chevronLeft" />
                Back
            </button>
            <div className={styles.lbrand} style={{ marginTop: 16 }}>
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
                        containerStyle={styles['otp-row']}
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
