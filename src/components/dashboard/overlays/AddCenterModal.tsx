import { useState } from 'react';
import { useFormsStore } from '@/store/dashboard/formsStore';
import { useWizardStore } from '@/store/dashboard/wizardStore';
import { useDomainData } from '@/hooks/useDomainData';
import { useCreateCenter } from '@/hooks/mutations';
import { useAppDispatch } from '@/store/hook';
import { addImageCenter, getAllImageCenterList } from '@/redux/request/action';
import { showAlert } from '@/components/common/showAlert';
import { formatUSPhone, isValidEmail } from '@/utils/format';
import type { Center } from '@/types';

export function AddCenterModal() {
  const { addCenterOpen, addCenterCtx, acForm, patchCenter, closeAddCenter, resetCenter } = useFormsStore();
  const patchWizard = useWizardStore((s) => s.patch);
  const { centers } = useDomainData();
  const createCenter = useCreateCenter();
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);

  if (!addCenterOpen) return null;

  const emailOk = !acForm.email || isValidEmail(acForm.email);
  const faxOk = !acForm.fax || acForm.fax.replace(/\D/g, '').length >= 10;
  const valid =
    acForm.name.trim() && acForm.addr.trim() && (acForm.email.trim() || acForm.fax.trim()) && emailOk && faxOk;

  const submit = async () => {
    if (!valid || saving) return;
    const name = acForm.name.trim();
    const addr = acForm.addr.trim();

    // ── Wizard context → real lab-center API ─────────────────────────────────
    if (addCenterCtx === 'wizard') {
      setSaving(true);
      try {
        await dispatch(
          addImageCenter({
            name,
            email: acForm.email.trim(),
            phoneNumber: acForm.phone.replace(/\D/g, ''),
            faxNumber: acForm.fax.replace(/\D/g, '') || undefined,
            phoneCode: '+1',
            location: addr,
            address: addr,
            streetAddress: addr,
            city: '',
            state: '',
            zipCode: '',
          }),
        ).unwrap();
        showAlert({ message: 'Center added successfully', status: 'success', autoClose: 6000 });
        // Refresh and surface the new center so the user can select it.
        await dispatch(
          getAllImageCenterList({ name: '', email: '', city: '', state: '', searchString: name, page: 1, size: 100 }),
        );
        patchWizard({ centerSearch: name });
        resetCenter();
        closeAddCenter();
      } catch (error: any) {
        const message = error?.headers?.message || error?.message || 'Something went wrong';
        showAlert({ message, status: 'error', autoClose: 6000 });
      } finally {
        setSaving(false);
      }
      return;
    }

    // ── Other contexts → existing mock domain data path ──────────────────────
    const id = Math.max(...centers.map((c) => c.id)) + 1;
    const center: Center = {
      id,
      name,
      address: addr,
      phone: acForm.phone.trim(),
      email: acForm.email.trim(),
      fax: acForm.fax.trim(),
    };
    await createCenter.mutateAsync(center);
    resetCenter();
    closeAddCenter();
  };

  return (
    <div className="getsheet-scrim" onClick={closeAddCenter}>
      <div className="getsheet-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="serif">Add an imaging center</h3>
        <p>Enter the hospital or imaging center&apos;s details. We&apos;ll save it and select it for this request.</p>

        <div className="af-field">
          <label>
            Center / Facility name <span style={{ color: 'var(--rose)' }}>*</span>
          </label>
          <input
            className="af-inp"
            type="text"
            placeholder="e.g. Riverside Imaging, hospital or clinic name"
            value={acForm.name}
            onChange={(e) => patchCenter({ name: e.target.value })}
          />
        </div>
        <div className="af-field">
          <label>
            Address <span style={{ color: 'var(--rose)' }}>*</span>
          </label>
          <input
            className="af-inp"
            type="text"
            placeholder="Street, city, state, ZIP"
            value={acForm.addr}
            onChange={(e) => patchCenter({ addr: e.target.value })}
          />
        </div>
        <div className="af-field">
          <label>Phone</label>
          <input
            className="af-inp"
            type="text"
            placeholder="+1 (555) 123-4567"
            value={acForm.phone}
            onChange={(e) => patchCenter({ phone: formatUSPhone(e.target.value) })}
          />
        </div>
        <div className="af-field">
          <label>
            Email <span className="ac-note">at least one of email or fax required</span>
          </label>
          <input
            className="af-inp"
            type="text"
            placeholder="records@center.com"
            value={acForm.email}
            onChange={(e) => patchCenter({ email: e.target.value })}
          />
          {acForm.email && !emailOk && (
            <div className="ac-note" style={{ color: 'var(--rose)', marginTop: 6 }}>
              Enter a valid email address
            </div>
          )}
        </div>
        <div className="af-field" style={{ marginBottom: 0 }}>
          <label>
            Fax <span className="ac-note">at least one of email or fax required</span>
          </label>
          <input
            className="af-inp"
            type="text"
            placeholder="+1 (555) 123-4568"
            value={acForm.fax}
            onChange={(e) => patchCenter({ fax: formatUSPhone(e.target.value) })}
          />
          {acForm.fax && !faxOk && (
            <div className="ac-note" style={{ color: 'var(--rose)', marginTop: 6 }}>
              Enter a valid fax number
            </div>
          )}
        </div>
        <div className="af-btns">
          <button className="btn btn-ghost" onClick={closeAddCenter} disabled={saving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={submit} disabled={!valid || saving}>
            {saving ? 'Saving…' : addCenterCtx === 'wizard' ? 'Add & select this center' : 'Add center'}
          </button>
        </div>
      </div>
    </div>
  );
}
