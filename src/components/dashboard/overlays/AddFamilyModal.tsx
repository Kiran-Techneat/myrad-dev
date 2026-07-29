import { useState } from 'react';
import { Dropdown } from '@/components/common/Dropdown';
import { useFormsStore } from '@/store/dashboard/formsStore';
import { useWizardStore } from '@/store/dashboard/wizardStore';
import { useDomainData } from '@/hooks/useDomainData';
import { useCreatePerson } from '@/hooks/mutations';
import { fmtMDY, isValidEmail } from '@/utils/format';
import type { Person } from '@/types';
import { useAppDispatch } from '@/store/hook';
import { addFamilyMember, updateFamilyMember, getUserProfile } from '@/redux/user/action';
import { showAlert } from '@/components/common/showAlert';

const REL_OPTIONS = ['Spouse', 'Parent', 'Child', 'Sibling', 'Grandparent', 'Grandchild', 'Guardian', 'Other'];

export function AddFamilyModal() {
  const { addFamilyOpen, addFamilyCtx, afForm, patchFamily, closeAddFamily, resetFamily } = useFormsStore();
  const patchWizard = useWizardStore((s) => s.patch);
  const { people } = useDomainData();
  const createPerson = useCreatePerson();
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);

  if (!addFamilyOpen) return null;

  const isProfile = addFamilyCtx === 'profile';
  // Profile and wizard both persist through the real user-service family API.
  const isReal = addFamilyCtx === 'profile' || addFamilyCtx === 'wizard';
  const isEdit = isProfile && !!afForm.memberId;

  const relation =
    afForm.rel === 'Other' ? afForm.relOther.trim() || 'Other' : afForm.rel || 'Family member';

  // Real contexts need a valid email + 10-digit phone; any mock path only needs names.
  const valid =
    afForm.first.trim() &&
    afForm.last.trim() &&
    (!isReal || (isValidEmail(afForm.email) && afForm.phone.replace(/\D/g, '').length === 10));

  const closeAndReset = () => {
    resetFamily();
    closeAddFamily();
  };

  const submit = async () => {
    if (!valid || saving) return;
    const first = afForm.first.trim();
    const last = afForm.last.trim();

    // ── Profile / wizard context → real user-service family API ─────────────
    if (isReal) {
      setSaving(true);
      const base = {
        firstName: first,
        lastName: last,
        relationship: relation,
        dateOfBirth: afForm.dob,
        gender: afForm.sex || '',
        phone: afForm.phone.replace(/\D/g, ''),
        email: afForm.email.trim(),
      };
      try {
        let newMemberId: string | undefined;
        if (isEdit) {
          await dispatch(updateFamilyMember({ memberId: afForm.memberId!, ...base })).unwrap();
        } else {
          const res: any = await dispatch(addFamilyMember(base)).unwrap();
          newMemberId = res?.memberId ?? res?.recordInfo?.memberId;
        }
        showAlert({
          message: isEdit ? 'Family member updated successfully' : 'Family member added successfully',
          status: 'success',
          autoClose: 6000,
        });
        await dispatch(getUserProfile());
        // Auto-select the freshly added member in the wizard when the id is known.
        if (addFamilyCtx === 'wizard' && newMemberId) patchWizard({ personId: newMemberId });
        closeAndReset();
      } catch (error: any) {
        const message = error?.headers?.message || error?.message || 'Something went wrong';
        showAlert({ message, status: 'error', autoClose: 6000 });
      } finally {
        setSaving(false);
      }
      return;
    }

    // ── Other (mock) contexts → existing mock domain data path ──────────────
    const id = Math.max(...people.map((p) => Number(p.id) || 0)) + 1;
    const person: Person = {
      id,
      name: `${first} ${last}`,
      role: relation,
      initials: (first[0] + last[0]).toUpperCase(),
      sex: afForm.sex || '',
      dob: fmtMDY(afForm.dob) || '',
    };
    await createPerson.mutateAsync(person);
    closeAndReset();
  };

  return (
    <div className="getsheet-scrim" onClick={closeAndReset}>
      <div className="getsheet-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="serif">{isEdit ? 'Edit family member' : 'Add a family member'}</h3>
        <p>Their details stay private and are reused for your future requests.</p>

        <div className="af-row">
          <div className="af-field">
            <label>
              First name <span style={{ color: 'var(--rose)' }}>*</span>
            </label>
            <input
              className="af-inp"
              type="text"
              placeholder="e.g. Sarah"
              value={afForm.first}
              onChange={(e) => patchFamily({ first: e.target.value })}
            />
          </div>
          <div className="af-field">
            <label>
              Last name <span style={{ color: 'var(--rose)' }}>*</span>
            </label>
            <input
              className="af-inp"
              type="text"
              placeholder="e.g. Doe"
              value={afForm.last}
              onChange={(e) => patchFamily({ last: e.target.value })}
            />
          </div>
        </div>

        <div className="af-field">
          <label>Relationship</label>
          <Dropdown
            ddKey="afRel"
            value={afForm.rel}
            placeholder="Select relationship"
            size="h52"
            options={REL_OPTIONS.map((v) => ({ value: v, label: v }))}
            onPick={(rel) => patchFamily({ rel })}
          />
        </div>

        {afForm.rel === 'Other' && (
          <div className="af-field">
            <label>Please specify</label>
            <input
              className="af-inp"
              type="text"
              placeholder="e.g. Cousin"
              value={afForm.relOther}
              onChange={(e) => patchFamily({ relOther: e.target.value })}
            />
          </div>
        )}

        <div className="af-field">
          <label>Date of birth</label>
          <div className="datepick">
            <input
              className="af-inp"
              type="date"
              value={afForm.dob}
              onChange={(e) => patchFamily({ dob: e.target.value })}
            />
            <span className={`datepick-txt ${afForm.dob ? '' : 'ph'}`}>
              {fmtMDY(afForm.dob) || 'MM/DD/YYYY'}
            </span>
          </div>
        </div>

        <div className="af-field">
          <label>Sex at birth</label>
          <Dropdown
            ddKey="afSex"
            value={afForm.sex}
            placeholder="Select"
            size="h52"
            options={['Male', 'Female', 'Other'].map((v) => ({ value: v, label: v }))}
            onPick={(sex) => patchFamily({ sex })}
          />
        </div>

        {isReal && (
          <div className="af-row">
            <div className="af-field" style={{ marginBottom: 0 }}>
              <label>
                Email <span style={{ color: 'var(--rose)' }}>*</span>
              </label>
              <input
                className="af-inp"
                type="email"
                placeholder="e.g. sarah@example.com"
                value={afForm.email}
                onChange={(e) => patchFamily({ email: e.target.value })}
              />
            </div>
            <div className="af-field" style={{ marginBottom: 0 }}>
              <label>
                Phone <span style={{ color: 'var(--rose)' }}>*</span>
              </label>
              <input
                className="af-inp"
                type="tel"
                placeholder="10-digit number"
                value={afForm.phone}
                onChange={(e) => patchFamily({ phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              />
            </div>
          </div>
        )}

        <div className="af-btns">
          <button className="btn btn-ghost" onClick={closeAndReset} disabled={saving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={submit} disabled={!valid || saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add family member'}
          </button>
        </div>
      </div>
    </div>
  );
}
