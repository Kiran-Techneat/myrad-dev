import { useState } from 'react';
import { isValidEmail, formatUSPhone } from '@/utils/format';
import { useAppDispatch } from '@/store/hook';
import { initiateContactChange, verifyContactChange, getUserProfile } from '@/redux/user/action';
import { showAlert } from '@/components/common/showAlert';

interface Props {
  open: boolean;
  type: 'email' | 'phone';
  onClose: () => void;
}

/** Two-step OTP dialog to change email or phone, styled in the app design system. */
export function ContactChangeModal({ open, type, onClose }: Props) {
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<1 | 2>(1);
  const [newEmail, setNewEmail] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [otp, setOtp] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [shownOtp, setShownOtp] = useState<string | null>(null);
  const [inputError, setInputError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const label = type === 'email' ? 'Email' : 'Phone Number';

  const handleClose = () => {
    setStep(1);
    setNewEmail('');
    setPhoneNo('');
    setOtp('');
    setSessionId('');
    setShownOtp(null);
    setInputError('');
    setOtpError('');
    setBusy(false);
    onClose();
  };

  const initiate = async () => {
    setInputError('');
    if (type === 'email') {
      if (!isValidEmail(newEmail)) {
        setInputError('Please enter a valid email address');
        return;
      }
    } else if (phoneNo.length !== 10) {
      setInputError('Please enter a valid 10-digit phone number');
      return;
    }
    setBusy(true);
    try {
      const payload =
        type === 'email'
          ? { type: 'email' as const, newValue: newEmail.trim() }
          : { type: 'phoneno' as const, newValue: phoneNo, phoneCode: '+1' };
      const data = await dispatch(initiateContactChange(payload)).unwrap();
      setSessionId(data.sessionId);
      if (data.otp) setShownOtp(data.otp);
      setStep(2);
    } catch (error: any) {
      setInputError(error?.headers?.message || error?.message || 'Failed to send OTP');
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setOtpError('');
    if (otp.length < 4) {
      setOtpError('Please enter the OTP');
      return;
    }
    setBusy(true);
    try {
      await dispatch(verifyContactChange({ sessionId, otp })).unwrap();
      showAlert({ message: `${label} updated successfully`, status: 'success', autoClose: 5000 });
      dispatch(getUserProfile());
      handleClose();
    } catch (error: any) {
      setOtpError(error?.headers?.message || error?.message || 'Invalid or expired OTP');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="getsheet-scrim" onClick={handleClose}>
      <div className="getsheet-card notice-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="serif">Change {label}</h3>

        {step === 1 ? (
          <>
            {type === 'email' ? (
              <div className="af-field">
                <label>New email address</label>
                <input
                  className="af-inp"
                  type="email"
                  autoFocus
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
            ) : (
              <div className="af-field">
                <label>New phone number</label>
                <input
                  className="af-inp"
                  type="tel"
                  autoFocus
                  placeholder="+1 (___) ___-____"
                  value={phoneNo ? formatUSPhone(phoneNo) : ''}
                  onChange={(e) =>
                    setPhoneNo(e.target.value.replace(/^\+1\s*/, '').replace(/\D/g, '').slice(0, 10))
                  }
                />
              </div>
            )}
            {inputError ? (
              <p style={{ color: 'var(--rose)', fontSize: 12, marginTop: 4 }}>{inputError}</p>
            ) : (
              <p style={{ fontSize: 12, marginTop: 4 }}>
                An OTP will be sent to confirm this change.
              </p>
            )}
          </>
        ) : (
          <>
            {shownOtp ? (
              <p style={{ marginBottom: 8 }}>
                Since SMS is not available, your verification OTP is: <strong>{shownOtp}</strong>
              </p>
            ) : (
              <p style={{ marginBottom: 8 }}>An OTP has been sent. Please enter it below.</p>
            )}
            <div className="af-field">
              <label>Enter OTP</label>
              <input
                className="af-inp"
                type="text"
                inputMode="numeric"
                autoFocus
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </div>
            {otpError ? (
              <p style={{ color: 'var(--rose)', fontSize: 12, marginTop: 4 }}>{otpError}</p>
            ) : (
              <p style={{ fontSize: 12, marginTop: 4 }}>OTP expires in 3 minutes.</p>
            )}
          </>
        )}

        <div className="af-btns">
          <button className="btn btn-ghost" onClick={handleClose} disabled={busy}>
            Cancel
          </button>
          {step === 1 ? (
            <button className="btn btn-primary" onClick={initiate} disabled={busy}>
              {busy ? 'Sending…' : 'Send OTP'}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={verify} disabled={busy}>
              {busy ? 'Verifying…' : 'Verify & update'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
