import { useRef } from 'react';
import { Icon } from '@/components/common/Icon';
import { StudyIcon } from '@/components/common/StudyIcon';
import { useDomainData } from '@/hooks/useDomainData';
import { useStaffStore, freshWalkIn } from '@/store/staffStore';
import { useCreatePerson, useCreateSelfUpload } from '@/hooks/mutations';
import { STUDY_TYPES } from '@/constants/studyTypes';
import { fmtMDY, todayLabel } from '@/utils/format';
import type { Person, Study } from '@/types';

export function StaffWalkIn() {
  const { people, centers } = useDomainData();
  const sf = useStaffStore();
  const createPerson = useCreatePerson();
  const createSelfUpload = useCreateSelfUpload();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const wi = sf.wi ?? freshWalkIn();
  const wiMatch = people.find((p) => p.id === wi.matchId);
  const wiType = STUDY_TYPES.find((t) => t.id === wi.selType);
  const centerName = centers[0]?.name || 'This center';

  const step1Cls = wi.phase === 'search' || wi.phase === 'confirm' ? 'active' : 'done';
  const step2Cls = wi.phase === 'study' ? 'active' : wi.phase === 'upload' || wi.phase === 'done' ? 'done' : '';
  const step3Cls = wi.phase === 'upload' ? 'active' : wi.phase === 'done' ? 'done' : '';

  const search = () => {
    const q = (wi.query || '').replace(/\D/g, '');
    if (!q) return;
    const found = people.find((p) => (p.mobile || '').replace(/\D/g, '').slice(-7) === q.slice(-7));
    sf.patchWi({
      phase: 'confirm',
      matchId: found ? found.id : null,
      ef: found ? freshWalkIn().ef : { first: '', last: '', dob: '', sex: '', mobile: wi.query },
    });
  };

  const enroll = () => {
    const f = wi.ef;
    if (!f.first.trim() || !f.last.trim() || !f.dob || !f.mobile.trim()) return;
    const id = `wi-${Date.now()}`;
    const newPerson: Person = {
      id,
      name: `${f.first.trim()} ${f.last.trim()}`,
      role: 'Walk-in patient',
      initials: ((f.first[0] || '') + (f.last[0] || '')).toUpperCase(),
      sex: f.sex || '',
      dob: fmtMDY(f.dob) || f.dob,
      mobile: f.mobile.trim(),
    };
    createPerson.mutate(newPerson);
    sf.patchWi({ phase: 'study', matchId: id });
  };

  const doUpload = () => {
    sf.patchWi({ uploading: true });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const person = people.find((p) => p.id === wi.matchId);
      const newStudy: Study = {
        id: `wi-su-${Date.now()}`,
        tag: wiType ? wiType.abbr : 'OTH',
        name: `${wiType ? wiType.label : 'Study'} · ${wi.part.trim()}`,
        place: centerName,
        date: todayLabel(),
        status: 'ready',
        reportStatus: 'pending',
        patient: person?.name || '',
        walkIn: true,
        hasImages: true,
      };
      createSelfUpload.mutate(newStudy);
      sf.patchWi({ uploading: false, phase: 'done', doneName: person?.name || '' });
    }, 1400);
  };

  return (
    <>
      <div className="kicker">myrad.us/walk-in</div>
      <div className="h1" style={{ fontSize: 26, marginBottom: 6 }}>
        Walk-in enrollment
      </div>
      <p style={{ color: 'var(--ink2)', fontSize: 14.5, marginBottom: 24 }}>
        Enroll the patient and upload their images now — no request needed.
      </p>

      <div className="su-steps">
        <div className={`su-step ${step1Cls}`}>
          <div className="su-step-dot">1</div>
          <div className="su-step-lbl">Patient</div>
        </div>
        <div className={`su-step ${step2Cls}`}>
          <div className="su-step-dot">2</div>
          <div className="su-step-lbl">Study</div>
        </div>
        <div className={`su-step ${step3Cls}`}>
          <div className="su-step-dot">3</div>
          <div className="su-step-lbl">Upload</div>
        </div>
      </div>

      {wi.phase === 'search' && (
        <div className="su-card" style={{ maxWidth: 560 }}>
          <h2>Find or enroll this patient</h2>
          <p style={{ color: 'var(--ink2)', fontSize: 14, marginBottom: 18 }}>
            Search by the mobile number they give you at the counter. New patient? We&apos;ll enroll
            them on the spot.
          </p>
          <div className="field" style={{ marginBottom: 12 }}>
            <label>Mobile number</label>
            <input
              className="inp"
              type="tel"
              placeholder="e.g. (248) 555-0101"
              value={wi.query}
              onChange={(e) => sf.patchWi({ query: e.target.value })}
            />
          </div>
          <button className="btn btn-primary btn-block" disabled={!wi.query.trim()} onClick={search}>
            Search
          </button>
        </div>
      )}

      {wi.phase === 'confirm' && (
        <div className="su-card" style={{ maxWidth: 560 }}>
          {wiMatch ? (
            <>
              <h2>Patient found</h2>
              <div className="su-person-chip" style={{ borderRadius: 16, padding: '14px 18px', cursor: 'default', marginBottom: 18 }}>
                <div className="p-av">{wiMatch.initials}</div>
                <div>
                  <div className="su-person-chip-nm">{wiMatch.name}</div>
                  <div className="su-person-chip-sub">
                    DOB {wiMatch.dob} · {wiMatch.sex} · {wiMatch.mobile}
                  </div>
                </div>
              </div>
              <div className="af-btns">
                <button className="btn btn-ghost" onClick={() => sf.patchWi({ phase: 'search', matchId: null, query: '' })}>
                  Not them? Search again
                </button>
                <button className="btn btn-primary" onClick={() => sf.patchWi({ phase: 'study' })}>
                  Confirm &amp; continue
                </button>
              </div>
            </>
          ) : (
            <>
              <h2>No match — enroll new patient</h2>
              <p style={{ color: 'var(--ink2)', fontSize: 14, marginBottom: 18 }}>
                This mobile number isn&apos;t on file yet. Enter their details to enroll them.
              </p>
              <div className="af-row">
                <div className="af-field">
                  <label>First name</label>
                  <input className="af-inp" type="text" placeholder="e.g. Sarah" value={wi.ef.first} onChange={(e) => sf.patchWi((c) => ({ ef: { ...c.ef, first: e.target.value } }))} />
                </div>
                <div className="af-field">
                  <label>Last name</label>
                  <input className="af-inp" type="text" placeholder="e.g. Doe" value={wi.ef.last} onChange={(e) => sf.patchWi((c) => ({ ef: { ...c.ef, last: e.target.value } }))} />
                </div>
              </div>
              <div className="af-row">
                <div className="af-field">
                  <label>Date of birth</label>
                  <input className="af-inp" type="date" value={wi.ef.dob} onChange={(e) => sf.patchWi((c) => ({ ef: { ...c.ef, dob: e.target.value } }))} />
                </div>
                <div className="af-field">
                  <label>Sex</label>
                  <select className="af-inp" value={wi.ef.sex} onChange={(e) => sf.patchWi((c) => ({ ef: { ...c.ef, sex: e.target.value } }))}>
                    <option value="">Select</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="af-field">
                <label>Mobile number</label>
                <input className="af-inp" type="tel" placeholder="e.g. (248) 555-0101" value={wi.ef.mobile} onChange={(e) => sf.patchWi((c) => ({ ef: { ...c.ef, mobile: e.target.value } }))} />
              </div>
              <div className="af-btns" style={{ marginTop: 16 }}>
                <button className="btn btn-ghost" onClick={() => sf.patchWi({ phase: 'search', matchId: null, query: '' })}>
                  Back
                </button>
                <button
                  className="btn btn-primary"
                  disabled={!wi.ef.first.trim() || !wi.ef.last.trim() || !wi.ef.dob || !wi.ef.mobile.trim()}
                  onClick={enroll}
                >
                  Enroll &amp; continue
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {wi.phase === 'study' && (
        <div className="su-card" style={{ maxWidth: 640 }}>
          <div className="su-person-chip" style={{ borderRadius: 16, padding: '12px 18px', cursor: 'default', marginBottom: 20 }}>
            <div className="p-av">{wiMatch?.initials}</div>
            <div>
              <div className="su-person-chip-nm">{wiMatch?.name}</div>
              <div className="su-person-chip-sub">{wiMatch?.mobile}</div>
            </div>
            <button className="urow2-link" style={{ marginLeft: 'auto' }} onClick={() => sf.patchWi({ phase: 'search', matchId: null, query: '' })}>
              Change
            </button>
          </div>
          <h2>What&apos;s being done today?</h2>
          <div className="type-grid">
            {STUDY_TYPES.map((t) => (
              <button
                key={t.id}
                className={`type-card ${t.id === wi.selType ? 'on' : ''}`}
                onClick={() => sf.patchWi({ selType: t.id })}
              >
                <div className="type-card-ico">
                  <StudyIcon tag={t.abbr} />
                </div>
                <div className="type-card-nm">{t.label}</div>
              </button>
            ))}
          </div>
          <div className="field">
            <label>Body part / area scanned</label>
            <input
              className="inp"
              type="text"
              placeholder="e.g. Chest, Left knee, Brain"
              value={wi.part}
              onChange={(e) => sf.patchWi({ part: e.target.value })}
            />
          </div>
          <button
            className="btn btn-primary btn-block"
            disabled={!wi.selType || !wi.part.trim()}
            onClick={() => sf.patchWi({ phase: 'upload' })}
          >
            Continue to upload
          </button>
        </div>
      )}

      {wi.phase === 'upload' && (
        <div className="su-card" style={{ maxWidth: 640 }}>
          <div className="su-person-chip" style={{ borderRadius: 16, padding: '12px 18px', cursor: 'default', marginBottom: 20 }}>
            <div className="p-av">{wiMatch?.initials}</div>
            <div>
              <div className="su-person-chip-nm">{wiMatch?.name}</div>
              <div className="su-person-chip-sub">
                {(wiType?.label ?? '') + (wi.part ? ` · ${wi.part}` : '')}
              </div>
            </div>
          </div>
          <h2>Upload the images</h2>
          <div className="umethod-seg">
            <button className={wi.uploadSource === 'computer' ? 'on' : ''} onClick={() => sf.patchWi({ uploadSource: 'computer' })}>
              This computer
            </button>
            <button className={wi.uploadSource === 'cd' ? 'on' : ''} onClick={() => sf.patchWi({ uploadSource: 'cd' })}>
              CD / DVD
            </button>
          </div>
          {!wi.uploading ? (
            <>
              <div className="umethod-drop" style={{ marginTop: 0 }}>
                <Icon name="upload" sw={1.6} />
                <p>Only DICOM image files are uploaded from the selected folder.</p>
              </div>
              <button className="btn btn-primary btn-block" onClick={doUpload}>
                {wi.uploadSource === 'cd' ? 'Open disc & select folder' : 'Select folder from computer'}
              </button>
            </>
          ) : (
            <div className="su-prog">
              <div className="su-prog-lbl">
                <span className="su-spin" />
                Transferring files securely…
              </div>
              <div className="su-prog-bar">
                <i />
              </div>
            </div>
          )}
        </div>
      )}

      {wi.phase === 'done' && (
        <div className="su-card share-confirm-card" style={{ maxWidth: 560, margin: '0 auto' }}>
          <div className="share-confirm-check">
            <Icon name="checkThick" sw={2.6} />
          </div>
          <h2>{wi.doneName}&apos;s images are uploaded</h2>
          <p style={{ color: 'var(--ink2)', fontSize: 14.5, marginBottom: 0 }}>
            They can view them anytime on MyRad Images by signing up with this mobile number and date
            of birth — no request, no follow-up call needed.
          </p>
          <div className="af-btns" style={{ marginTop: 22 }}>
            <button className="btn btn-primary btn-block" onClick={() => sf.resetWalkIn()}>
              Enroll another walk-in
            </button>
          </div>
        </div>
      )}
    </>
  );
}
