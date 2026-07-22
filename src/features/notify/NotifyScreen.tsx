import { Icon } from '@/components/common/Icon';
import { useDomainData } from '@/hooks/useDomainData';
import { useNavStore } from '@/store/navStore';
import { useWizardStore } from '@/store/wizardStore';
import { ageOf, fmtLong } from '@/utils/format';

interface NotifyModel {
  headline: string;
  subhead: string;
  to: string;
  phone?: string;
  subject: string;
  reSubject: string;
  greeting: string;
  body: string;
  patient: string;
  dob: string;
  sex: string;
  age: string;
  mrn: string;
  note: string;
  ref: string;
  refShort: string;
  ctaLabel: string;
  studies: { name: string; statusTxt: string }[];
}

const TrustBadges = () => (
  <div className="trust-bar">
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

export function NotifyScreen() {
  const { people, centers, requests } = useDomainData();
  const nav = useNavStore();
  const w = useWizardStore();

  const sigDate = 'June 30, 2026';
  const isEmail = nav.notifyChannel === 'email';

  let m: NotifyModel;

  if (nav.notifyKind === 'wizardRequest') {
    const person = people.find((p) => p.id === w.personId) ?? ({} as (typeof people)[number]);
    const center = centers.find((c) => c.id === w.centerId) ?? ({} as (typeof centers)[number]);
    const age = ageOf(person.dob ?? '');
    m = {
      headline: 'What the center receives',
      subhead: `This is exactly what ${center.name || 'the center'} receives by email or fax — with the full patient and study details.`,
      to: center.name || '',
      phone: center.phone || '',
      subject: `Imaging request for ${person.name || ''} — action required`,
      reSubject: `Imaging request for ${person.name || ''}`,
      greeting: `Dear ${center.name || 'center'} team,`,
      body: 'Your patient has authorized the secure release of their imaging through MyRad Images. Please verify the patient below, then upload the requested studies and the signed radiology report using the secure link.',
      patient: person.name || '',
      dob: fmtLong(person.dob ?? '') || '—',
      sex: person.sex || '—',
      age: age != null ? `${age} yrs` : '—',
      mrn: w.mrn || '',
      note: w.note || '',
      ref: w.reqId || '',
      refShort: String(w.reqId || '').replace(/^REQ-/, ''),
      ctaLabel: 'Open secure upload link',
      studies: w.addedStudies.map((a) => ({
        name: a.typeLabel + (a.partLabel ? ` · ${a.partLabel}` : ''),
        statusTxt: `Period requested: ${a.dateLabel || '—'}`,
      })),
    };
  } else if (nav.notifyKind === 'share') {
    const sd = nav.notifyShareData!;
    const person = people.find((p) => p.name === sd.person) ?? ({} as (typeof people)[number]);
    const age = ageOf(person.dob ?? '');
    const short = sd.study.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() + '-92';
    m = {
      headline: 'What your doctor receives',
      subhead: `This is exactly what ${sd.provider} receives — with the full patient & study details.`,
      to: sd.provider,
      phone: '+1 (248) 737-6695',
      subject: `${sd.person} imaging shared for your review`,
      reSubject: `${sd.person} imaging shared for your review`,
      greeting: `Dear ${sd.provider},`,
      body: `${sd.person} has securely shared the following imaging study with you for review. Open the secure link below to view the images and the signed radiology report.`,
      patient: sd.person,
      dob: fmtLong(person.dob ?? '') || '—',
      sex: person.sex || '—',
      age: age != null ? `${age} yrs` : '—',
      mrn: '',
      note: '',
      ref: `SHR-${short}`,
      refShort: short,
      ctaLabel: 'Open secure link to view',
      studies: [{ name: sd.study, statusTxt: 'Shared' }],
    };
  } else {
    const selReq = requests.find((r) => r.id === nav.selectedReqId) ?? requests[1];
    const person = people.find((p) => p.name === selReq.patient) ?? ({} as (typeof people)[number]);
    const age = ageOf(person.dob ?? '');
    m = {
      headline: 'What the center receives',
      subhead: `This is exactly what ${selReq.center} receives by email or fax — with the full patient and study details.`,
      to: selReq.center,
      phone: '+1 (248) 737-6695',
      subject: `Imaging request for ${selReq.patient} — action required`,
      reSubject: `Imaging request for ${selReq.patient}`,
      greeting: `Dear ${selReq.center} team,`,
      body: 'Your patient has authorized the secure release of their imaging through MyRad Images. Please verify the patient below, then upload the requested studies and the signed radiology report using the secure link.',
      patient: selReq.patient,
      dob: fmtLong(person.dob ?? '') || '—',
      sex: person.sex || '—',
      age: age != null ? `${age} yrs` : '—',
      mrn: selReq.mrn || '',
      note: selReq.note || '',
      ref: selReq.id,
      refShort: String(selReq.id).replace(/^REQ-/, ''),
      ctaLabel: 'Open secure upload link',
      studies: selReq.items.map((it) => ({
        name: it.label,
        statusTxt: `Period requested: ${it.dateLabel || selReq.date}`,
      })),
    };
  }

  return (
    <div className="wrap" style={{ maxWidth: 760 }}>
      <button className="backbtn" onClick={nav.closeNotify}>
        <Icon name="chevronLeft" />
        Back
      </button>
      <div className="pagehd">
        <div>
          <div className="kicker">Secure preview</div>
          <div className="h1 serif" style={{ fontSize: 26 }}>
            {m.headline}
          </div>
        </div>
      </div>
      <p style={{ color: 'var(--ink2)', fontSize: 15, margin: '-14px 0 20px' }}>{m.subhead}</p>

      <div className="notify-seg" style={{ maxWidth: 280 }}>
        <button
          className={`notify-seg-btn ${isEmail ? 'on' : ''}`}
          onClick={() => nav.setNotifyChannel('email')}
        >
          Email
        </button>
        <button
          className={`notify-seg-btn ${!isEmail ? 'on' : ''}`}
          onClick={() => nav.setNotifyChannel('fax')}
        >
          Fax
        </button>
      </div>

      {isEmail ? (
        <div className="mail-preview">
          <div className="mail-hd">
            <div className="mail-row">
              <span className="k">From</span>
              <span>MyRad Images · secure@myradimages.com</span>
            </div>
            <div className="mail-row">
              <span className="k">To</span>
              <span>{m.to}</span>
            </div>
            <div className="mail-subj">{m.subject}</div>
          </div>
          <div className="mail-bd">
            <p>{m.greeting}</p>
            <p>{m.body}</p>
            <div className="detbox">
              <div className="dl"><span className="k">Patient</span><span className="v">{m.patient}</span></div>
              <div className="dl"><span className="k">Phone</span><span className="v">{m.phone}</span></div>
              <div className="dl"><span className="k">Date of birth</span><span className="v">{m.dob}</span></div>
              <div className="dl"><span className="k">Sex</span><span className="v">{m.sex}</span></div>
              <div className="dl"><span className="k">Age</span><span className="v">{m.age}</span></div>
              {m.mrn && <div className="dl"><span className="k">MRN / Patient ID</span><span className="v">{m.mrn}</span></div>}
              <div className="dl"><span className="k">Reference</span><span className="v">{m.ref}</span></div>
              {m.studies.map((st, i) => (
                <div key={i} className="dl"><span className="k">{st.name}</span><span className="v">{st.statusTxt}</span></div>
              ))}
            </div>
            {m.note && (
              <div className="note-box">
                <div className="nb-lbl">Note from patient</div>
                <div className="nb-txt">{m.note}</div>
              </div>
            )}
            <a className="mail-cta" href="#" onClick={(e) => e.preventDefault()}>
              {m.ctaLabel} →
            </a>
            <div className="mail-url">secure.myradimages.com/u/{m.refShort}</div>
            <div className="link-edu">
              <div className="lhd">How to use this secure link</div>
              <ul>
                <li>Click the button above — or open any browser and type the URL into the address bar</li>
                <li>The link is <b>not case-sensitive</b> — uppercase and lowercase are identical</li>
                <li>Works in Chrome, Safari, Firefox, Edge or any modern browser</li>
                <li>No login or account needed — this link is for this request only</li>
                <li>Link expires in 7 days — please act promptly</li>
              </ul>
            </div>
            <div className="mail-note">Tip: open this on the computer that holds the CD/DVD or the study folder.</div>
            <div className="sig-block2">
              <div className="sb-lbl">Patient Authorization</div>
              <div className="sig-auth-txt">{m.patient}</div>
              <div className="sb-meta">Signed {sigDate} · Authorized via MyRad Images Secure Platform</div>
            </div>
            <div className="mail-foot">
              This message contains confidential health information intended only for {m.to}. The secure
              link expires in 7 days.
            </div>
            <TrustBadges />
          </div>
        </div>
      ) : (
        <div className="fax-view">
          <div className="fax-hd">
            <h3>Fax Transmission</h3>
            <div className="sub">MyRad Images · Secure Imaging Exchange</div>
          </div>
          <div className="fax-grid">
            <div><div className="k">To</div><div className="v">{m.to}</div></div>
            <div><div className="k">From</div><div className="v">MyRad Images</div></div>
            <div><div className="k">Date</div><div className="v">{sigDate}</div></div>
            <div><div className="k">Pages</div><div className="v">1 of 1</div></div>
          </div>
          <div className="fax-re">RE: {m.reSubject}</div>
          <div className="fax-tbl">
            <div className="r"><span>Patient</span><span className="v">{m.patient}</span></div>
            <div className="r"><span>Phone</span><span className="v">{m.phone}</span></div>
            <div className="r"><span>Date of birth</span><span className="v">{m.dob}</span></div>
            <div className="r"><span>Sex</span><span className="v">{m.sex}</span></div>
            <div className="r"><span>Age</span><span className="v">{m.age}</span></div>
            {m.mrn && <div className="r"><span>MRN / Patient ID</span><span className="v">{m.mrn}</span></div>}
            <div className="r"><span>Reference</span><span className="v">{m.ref}</span></div>
            {m.studies.map((st, i) => (
              <div key={i} className="r"><span>{st.name}</span><span className="v">{st.statusTxt}</span></div>
            ))}
          </div>
          {m.note && (
            <div className="note-box">
              <div className="nb-lbl">Note from patient</div>
              <div className="nb-txt">{m.note}</div>
            </div>
          )}
          <div className="fax-link">secure.myradimages.com/u/{m.refShort}</div>
          <div className="link-edu">
            <div className="lhd">How to access this secure link</div>
            <ul>
              <li>Open any browser and type or copy the URL above into the address bar</li>
              <li>The URL is <b>not case-sensitive</b> — uppercase and lowercase are the same</li>
              <li>Works in Chrome, Safari, Firefox or Edge on any computer, tablet or phone</li>
              <li>No login required — this link is for this request only</li>
              <li>Link expires 7 days from the date of this fax</li>
            </ul>
          </div>
          <a className="mail-cta" href="#" onClick={(e) => e.preventDefault()}>
            {m.ctaLabel} →
          </a>
          <div className="sig-block2">
            <div className="sb-lbl">Patient Authorization</div>
            <div className="sig-auth-txt">{m.patient}</div>
            <div className="sb-meta">Signed {sigDate} · Authorized via MyRad Images</div>
          </div>
          <div className="fax-conf">
            Confidential — this transmission contains protected health information intended solely for
            the named recipient. The secure link expires in 7 days.
          </div>
          <TrustBadges />
        </div>
      )}

      <div className="af-btns">
        <button className="btn btn-primary btn-block" onClick={nav.closeNotify}>
          Close
        </button>
      </div>
    </div>
  );
}
