import { useState } from 'react';
import { Icon } from '@/components/common/Icon';
import { useAppNavigate } from '@/hooks/useAppNavigate';

const SHARE = {
  by: 'Mary Doe',
  sharedWith: 'Dr. Sarah Chen',
  sharedOn: 'June 23, 2026',
  expiresOn: 'July 23, 2026',
  patientNote: 'These are from my June 2026 sessions. Please review ahead of our appointment.',
  patient: { name: 'Mary Doe', dob: 'July 22, 1981', sex: 'Female', age: '44' },
  studies: [
    {
      tag: 'MRI' as const,
      t: 'MRI',
      part: 'Brain',
      center: 'City Imaging Center',
      date: 'June 3, 2026',
      note: null as string | null,
      tech: 'MRI of the brain was performed using a 3T scanner with multiplanar sequences.',
      find: 'Brain parenchyma shows normal signal intensity. No acute infarct, hemorrhage, or mass lesion.',
      imp: 'Normal MRI of the brain. No acute intracranial abnormality.',
    },
    {
      tag: 'CT' as const,
      t: 'CT Scan',
      part: 'Chest',
      center: 'HealthScan Labs',
      date: 'June 14, 2026',
      note: 'Requested by cardiologist — follow-up.',
      tech: 'Helical CT of the chest was performed following contrast administration.',
      find: 'The lungs are clear without focal consolidation or effusion.',
      imp: 'No acute cardiopulmonary abnormality.',
    },
  ],
};

export function StaffProvider() {
  const nav = useAppNavigate();
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <>
      <div className="help-strip" style={{ background: '#EBF2FF', borderColor: '#C5D8F7', marginBottom: 16 }}>
        <Icon name="lock" sw={1.8} style={{ color: '#3B6CC7' }} />
        <p style={{ color: '#2B5299' }}>
          This link was shared securely and will expire on <b>{SHARE.expiresOn}</b>. Imaging studies are
          shared for review purposes only.
        </p>
      </div>

      <div className="pv-infocard2">
        <div>
          <div className="ap-k">Patient</div>
          <div className="pvv">{SHARE.patient.name}</div>
        </div>
        <div>
          <div className="ap-k">Date of birth</div>
          <div className="pvv">
            {SHARE.patient.dob} · {SHARE.patient.sex} · {SHARE.patient.age} yrs
          </div>
        </div>
        <div>
          <div className="ap-k">Shared by</div>
          <div className="pvv">{SHARE.by} (Patient)</div>
        </div>
        <div>
          <div className="ap-k">Shared on</div>
          <div className="pvv">{SHARE.sharedOn}</div>
        </div>
        <div>
          <div className="ap-k">Shared with</div>
          <div className="pvv">{SHARE.sharedWith}</div>
        </div>
        <div>
          <div className="ap-k">Expires on</div>
          <div className="pvv">{SHARE.expiresOn}</div>
        </div>
      </div>

      <div className="help-strip" style={{ marginBottom: 16 }}>
        <Icon name="chat" sw={1.8} />
        <p>
          <b>Note from patient:</b> {SHARE.patientNote}
        </p>
      </div>

      <div className="added-strip-hd">Studies ({SHARE.studies.length})</div>
      {SHARE.studies.map((s, i) => (
        <div key={i}>
          <div className="pv-study2">
            <div className="study-ico">{s.tag}</div>
            <div className="pv-study2-bd">
              <div className="pv-study2-nm">{s.t}</div>
              <div className="pv-study2-pt">
                {s.part} · {s.center} · {s.date}
              </div>
              {s.note && (
                <div className="rev-sub" style={{ color: 'var(--accent-d)', fontStyle: 'italic' }}>
                  {s.note}
                </div>
              )}
            </div>
            <div className="pv-actions2">
              <button
                className="study-btn"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => nav.openViewer({ from: 'staff' })}
              >
                <Icon name="eye" sw={1.9} />
                View Images
              </button>
              <button
                className="study-btn"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <Icon name="doc" sw={1.9} />
                View Report
              </button>
            </div>
          </div>
          {expanded === i && (
            <div className="pv-report2">
              <div className="rep-sec">
                <h5>Technique</h5>
                <p>{s.tech}</p>
              </div>
              <div className="rep-sec">
                <h5>Findings</h5>
                <p>{s.find}</p>
              </div>
              <div className="rep-sec imp">
                <h5>Impression</h5>
                <p>{s.imp}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </>
  );
}
