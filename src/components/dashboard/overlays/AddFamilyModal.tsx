import { Dropdown } from '@/components/common/Dropdown';
import { useFormsStore } from '@/store/dashboard/formsStore';
import { useWizardStore } from '@/store/dashboard/wizardStore';
import { useDomainData } from '@/hooks/useDomainData';
import { useCreatePerson } from '@/hooks/mutations';
import { fmtMDY } from '@/utils/format';
import type { Person } from '@/types';

const REL_OPTIONS = ['Spouse', 'Parent', 'Child', 'Sibling', 'Grandparent', 'Grandchild', 'Guardian', 'Other'];

export function AddFamilyModal() {
  const { addFamilyOpen, addFamilyCtx, afForm, patchFamily, closeAddFamily, resetFamily } = useFormsStore();
  const patchWizard = useWizardStore((s) => s.patch);
  const { people } = useDomainData();
  const createPerson = useCreatePerson();

  if (!addFamilyOpen) return null;

  const valid = afForm.first.trim() && afForm.last.trim();

  const submit = async () => {
    if (!valid) return;
    const first = afForm.first.trim();
    const last = afForm.last.trim();
    const id = Math.max(...people.map((p) => Number(p.id) || 0)) + 1;
    const relation =
      afForm.rel === 'Other' ? afForm.relOther.trim() || 'Other' : afForm.rel || 'Family member';
    const person: Person = {
      id,
      name: `${first} ${last}`,
      role: relation,
      initials: (first[0] + last[0]).toUpperCase(),
      sex: afForm.sex || '',
      dob: fmtMDY(afForm.dob) || '',
    };
    await createPerson.mutateAsync(person);
    if (addFamilyCtx === 'wizard') patchWizard({ personId: id });
    resetFamily();
    closeAddFamily();
  };

  return (
    <div className="getsheet-scrim" onClick={closeAddFamily}>
      <div className="getsheet-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="serif">Add a family member</h3>
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

        <div className="af-field" style={{ marginBottom: 0 }}>
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

        <div className="af-btns">
          <button className="btn btn-ghost" onClick={closeAddFamily}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={submit} disabled={!valid}>
            Add family member
          </button>
        </div>
      </div>
    </div>
  );
}
