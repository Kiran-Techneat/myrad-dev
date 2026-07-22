import { useFormsStore } from '@/store/formsStore';
import { useShareStore } from '@/store/shareStore';
import { useDomainData } from '@/hooks/useDomainData';
import { useCreateProvider } from '@/hooks/mutations';
import { initialsFromName, isValidEmail } from '@/utils/format';
import { formatUSPhone } from '@/utils/format';

export function AddProviderModal() {
  const { addProviderOpen, apForm, patchProvider, closeAddProvider, resetProvider } = useFormsStore();
  const addProviderId = useShareStore((s) => s.addProviderId);
  const { providers } = useDomainData();
  const createProvider = useCreateProvider();

  if (!addProviderOpen) return null;

  const emailOk = !apForm.email || isValidEmail(apForm.email);
  const faxOk = !apForm.fax || apForm.fax.replace(/\D/g, '').length >= 10;
  const valid =
    apForm.name.trim() && (apForm.email.trim() || apForm.fax.trim()) && emailOk && faxOk;

  const submit = async () => {
    if (!valid) return;
    const name = apForm.name.trim();
    const newProvider = {
      name,
      spec: apForm.spec.trim() || 'General practice',
      init: initialsFromName(name),
      email: apForm.email.trim(),
      phone: apForm.phone.trim(),
      fax: apForm.fax.trim(),
    };
    const newIndex = providers.length; // appended at the end
    await createProvider.mutateAsync(newProvider);
    addProviderId(newIndex);
    resetProvider();
    closeAddProvider();
  };

  return (
    <div className="getsheet-scrim" onClick={closeAddProvider}>
      <div className="getsheet-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="serif">Add a new Healthcare Provider, Family or Friend</h3>
        <p>Enter their contact details. We&apos;ll save them here, ready to select and share studies with anytime.</p>

        <div className="af-field">
          <label>
            Full name <span style={{ color: 'var(--rose)' }}>*</span>
          </label>
          <input
            className="af-inp"
            type="text"
            placeholder="e.g. Dr. Sarah Chen"
            value={apForm.name}
            onChange={(e) => patchProvider({ name: e.target.value })}
          />
        </div>
        <div className="af-field">
          <label>
            Email <span className="ac-note">at least one of email or fax required</span>
          </label>
          <input
            className="af-inp"
            type="text"
            placeholder="doctor@practice.com"
            value={apForm.email}
            onChange={(e) => patchProvider({ email: e.target.value })}
          />
          {apForm.email && !emailOk && (
            <div className="ac-note" style={{ color: 'var(--rose)', marginTop: 6 }}>
              Enter a valid email address
            </div>
          )}
        </div>
        <div className="af-field">
          <label>Phone</label>
          <input
            className="af-inp"
            type="text"
            placeholder="+1 (555) 123-4567"
            value={apForm.phone}
            onChange={(e) => patchProvider({ phone: formatUSPhone(e.target.value) })}
          />
        </div>
        <div className="af-field">
          <label>
            Fax <span className="ac-note">at least one of email or fax required</span>
          </label>
          <input
            className="af-inp"
            type="text"
            placeholder="+1 (555) 123-4568"
            value={apForm.fax}
            onChange={(e) => patchProvider({ fax: formatUSPhone(e.target.value) })}
          />
          {apForm.fax && !faxOk && (
            <div className="ac-note" style={{ color: 'var(--rose)', marginTop: 6 }}>
              Enter a valid fax number
            </div>
          )}
        </div>
        <div className="af-field" style={{ marginBottom: 0 }}>
          <label>
            Specialty <span className="ac-note">optional</span>
          </label>
          <input
            className="af-inp"
            type="text"
            placeholder="e.g. Cardiology"
            value={apForm.spec}
            onChange={(e) => patchProvider({ spec: e.target.value })}
          />
        </div>
        <div className="af-btns">
          <button className="btn btn-ghost" onClick={closeAddProvider}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={submit} disabled={!valid}>
            Add and Share
          </button>
        </div>
      </div>
    </div>
  );
}
