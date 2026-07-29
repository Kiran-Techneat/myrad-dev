import { useState } from 'react';
import { Dropdown } from '@/components/common/Dropdown';
import { Icon } from '@/components/common/Icon';
import { fmtMDY, formatUSPhone } from '@/utils/format';
import { useAppDispatch } from '@/store/hook';
import { updateProfile, getUserProfile } from '@/redux/user/action';
import { showAlert } from '@/components/common/showAlert';
import type { IUserProfileResponse } from '@/redux/user/types/response';

interface Props {
  open: boolean;
  userProfile: IUserProfileResponse | null;
  onClose: () => void;
  onChangeContact: (type: 'email' | 'phone') => void;
}

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  zipCode?: string;
}

const GENDERS = ['Male', 'Female', 'Other'];

/** Age in whole years from a YYYY-MM-DD string. */
function ageFromIso(iso: string): number {
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return -1;
  const t = new Date();
  let age = t.getFullYear() - d.getFullYear();
  const m = t.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) age--;
  return age;
}

export function EditProfileModal({ open, userProfile, onClose, onChangeContact }: Props) {
  const dispatch = useAppDispatch();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  // Re-seed the form each time the modal opens.
  const [seededFor, setSeededFor] = useState<string | null>(null);

  if (!open) return null;

  const seedKey = userProfile?.id ?? 'none';
  if (seededFor !== seedKey && userProfile) {
    setFirstName(userProfile.firstName || '');
    setLastName(userProfile.lastName || '');
    setGender(userProfile.gender || 'Male');
    setDob(userProfile.dateOfBirth ? userProfile.dateOfBirth.slice(0, 10) : '');
    setZipCode(userProfile.zipCode || '');
    setErrors({});
    setSeededFor(seedKey);
  }

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!firstName.trim()) e.firstName = 'First name is required';
    else if (firstName.trim().length < 2) e.firstName = 'Must be at least 2 characters';
    if (!lastName.trim()) e.lastName = 'Last name is required';
    if (!gender) e.gender = 'Gender is required';
    if (!dob) e.dateOfBirth = 'Date of birth is required';
    else if (ageFromIso(dob) < 18) e.dateOfBirth = 'You must be at least 18 years old';
    if (!/^\d{5}$/.test(zipCode.trim())) e.zipCode = 'Zip code must be 5 numbers';
    return e;
  };

  const submit = async () => {
    if (saving) return;
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      await dispatch(
        updateProfile({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          gender,
          dateOfBirth: dob,
          zipCode: zipCode.trim(),
          phoneCode: userProfile?.phoneCode || '+1',
          phoneNo: userProfile?.phoneNo || '',
        }),
      ).unwrap();
      showAlert({ message: 'Profile updated successfully', status: 'success', autoClose: 6000 });
      dispatch(getUserProfile());
      handleClose();
    } catch (error: any) {
      const errorList = error?.errorlist;
      if (errorList && typeof errorList === 'object' && Object.keys(errorList).length > 0) {
        setErrors((prev) => ({ ...prev, ...errorList }));
      } else {
        const message = error?.headers?.message || error?.message || 'Something went wrong';
        showAlert({ message, status: 'error', autoClose: 6000 });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setSeededFor(null);
    onClose();
  };

  const errText = (msg?: string) =>
    msg ? <span style={{ color: 'var(--rose)', fontSize: 12 }}>{msg}</span> : null;

  return (
    <div className="getsheet-scrim" onClick={handleClose}>
      <div className="getsheet-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="serif">Edit profile</h3>
        <p>Update your personal details. Email and phone changes are verified separately.</p>

        <div className="af-row">
          <div className="af-field">
            <label>
              First name <span style={{ color: 'var(--rose)' }}>*</span>
            </label>
            <input
              className="af-inp"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            {errText(errors.firstName)}
          </div>
          <div className="af-field">
            <label>
              Last name <span style={{ color: 'var(--rose)' }}>*</span>
            </label>
            <input
              className="af-inp"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            {errText(errors.lastName)}
          </div>
        </div>

        <div className="af-row">
          <div className="af-field">
            <label>
              Gender assigned at birth <span style={{ color: 'var(--rose)' }}>*</span>
            </label>
            <Dropdown
              ddKey="epGender"
              value={gender}
              placeholder="Select"
              size="h52"
              options={GENDERS.map((v) => ({ value: v, label: v }))}
              onPick={(v) => setGender(v)}
            />
            {errText(errors.gender)}
          </div>
          <div className="af-field">
            <label>
              Date of birth <span style={{ color: 'var(--rose)' }}>*</span>
            </label>
            <div className="datepick">
              <input
                className="af-inp"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
              <span className={`datepick-txt ${dob ? '' : 'ph'}`}>{fmtMDY(dob) || 'MM/DD/YYYY'}</span>
            </div>
            {errText(errors.dateOfBirth)}
          </div>
        </div>

        <div className="af-field">
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Phone number
            <span
              onClick={() => onChangeContact('phone')}
              style={{ cursor: 'pointer', display: 'inline-flex', color: 'var(--accent)' }}
              title="Change phone number"
            >
              <Icon name="edit" sw={2} />
            </span>
          </label>
          <input
            className="af-inp"
            type="text"
            disabled
            value={formatUSPhone(userProfile?.phoneNo ?? '')}
          />
        </div>

        <div className="af-field">
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Email
            <span
              onClick={() => onChangeContact('email')}
              style={{ cursor: 'pointer', display: 'inline-flex', color: 'var(--accent)' }}
              title="Change email"
            >
              <Icon name="edit" sw={2} />
            </span>
          </label>
          <input className="af-inp" type="email" disabled value={userProfile?.email ?? ''} />
        </div>

        <div className="af-field">
          <label>
            Zip code <span style={{ color: 'var(--rose)' }}>*</span>
          </label>
          <input
            className="af-inp"
            type="text"
            inputMode="numeric"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
          />
          {errText(errors.zipCode)}
        </div>

        <div className="af-btns">
          <button className="btn btn-ghost" onClick={handleClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : 'Update profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
