import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/components/common/Icon';
import { StudyIcon } from '@/components/common/StudyIcon';
import { Dropdown } from '@/components/common/Dropdown';
import { SignaturePad } from '@/components/common/SignaturePad';
import { useAppNavigate } from '@/hooks/useAppNavigate';
import { useWizardStore } from '@/store/dashboard/wizardStore';
import { useNavGuardStore } from '@/store/dashboard/navGuardStore';
import { useFormsStore } from '@/store/dashboard/formsStore';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { createNewRequest, getAllImageCenterList } from '@/redux/request/action';
import { showAlert } from '@/components/common/showAlert';
import { STUDY_TYPES, PART_GROUPS, WIZ_STEPS } from '@/constants/studyTypes';
import { MONTHS, ageOf, fmtLong, fmtMDY, formatUSPhone, resolveStudyDate, todayIso, yearRange } from '@/utils/format';
import type { INewRequestFormRequest } from '@/redux/request/types/request';
import type { StudyTag } from '@/types';

/** UI-friendly imaging center adapted from the redux IImageCenterResponse. */
interface WizCenter {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  fax: string;
}

const initialsOf = (first?: string, last?: string) =>
  `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || 'U';

/** Profile stores ISO dates; the wizard's ageOf/fmtLong expect MM/DD/YYYY. */
const toMDY = (v?: string) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? fmtMDY(v) : v ?? '');

const DATE_MODES: [string, string][] = [
  ['my', 'Month & Year'],
  ['yr', 'Year only'],
  ['ex', 'Exact date'],
  ['rg', 'Date range'],
];

export function WizardScreen() {
  const nav = useAppNavigate();
  const w = useWizardStore();
  const openAddFamily = useFormsStore((s) => s.openAddFamily);
  const openAddCenter = useFormsStore((s) => s.openAddCenter);
  const dispatch = useAppDispatch();
  const userProfile = useAppSelector((s) => s.user.userProfile);
  const allImageCenterList = useAppSelector((s) => s.request.allImageCenterList);
  const [sigClearKey, setSigClearKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [pickedCenter, setPickedCenter] = useState<WizCenter | null>(null);
  const [debouncedCenterSearch, setDebouncedCenterSearch] = useState('');

  const stepOrder = WIZ_STEPS.map((x) => x.key);
  const curIdx = stepOrder.indexOf(w.step);

  // ---- Patients (self + family) from the logged-in profile -------------------
  const people = useMemo(() => {
    if (!userProfile) return [];
    const self = {
      id: userProfile.selfPatientId ?? 'self',
      name: `${userProfile.firstName ?? ''} ${userProfile.lastName ?? ''}`.trim(),
      initials: initialsOf(userProfile.firstName, userProfile.lastName),
      sex: userProfile.gender ?? '',
      dob: toMDY(userProfile.dateOfBirth),
      isSelf: true,
      role: 'You',
    };
    const family = (userProfile.familyMembers ?? []).map((m) => ({
      id: m.memberId,
      name: `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim(),
      initials: initialsOf(m.firstName, m.lastName),
      sex: m.gender ?? '',
      dob: toMDY(m.dateOfBirth),
      isSelf: false,
      role: m.relationship ?? '',
    }));
    return [self, ...family];
  }, [userProfile]);

  // ---- Centers from redux (master + user), adapted to the card shape ---------
  const centers = useMemo<WizCenter[]>(() => {
    const sr = allImageCenterList?.searchResult;
    const raw = [...(sr?.userCenters ?? []), ...(sr?.masterCenters ?? [])];
    const seen = new Set<string>();
    return raw
      .filter((c) => {
        if (seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
      })
      .map((c) => ({
        id: c.id,
        name: c.name,
        address: c.location || [c.streetAddress, c.city, c.state, c.zipCode].filter(Boolean).join(', '),
        phone: c.phoneNumber ? formatUSPhone(c.phoneNumber) : '',
        email: c.email ?? '',
        fax: c.faxNumber ? formatUSPhone(c.faxNumber) : '',
      }));
  }, [allImageCenterList]);

  // Debounce the center search box before hitting the server.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedCenterSearch(w.centerSearch), 400);
    return () => clearTimeout(t);
  }, [w.centerSearch]);

  // Fetch centers on mount and whenever the debounced search changes.
  useEffect(() => {
    dispatch(
      getAllImageCenterList({
        name: '',
        email: '',
        city: '',
        state: '',
        searchString: debouncedCenterSearch,
        page: 1,
        size: 100,
      }),
    );
  }, [dispatch, debouncedCenterSearch]);

  // "Dirty" = there is in-progress work that a stray navigation/refresh would lose.
  const dirty = w.addedStudies.length > 0 && !w.done;

  // Guard in-app navigation (routed through useAppNavigate) with a confirm modal
  // while the wizard has unsaved studies. Reads live store state so the predicate
  // stays accurate without re-registering.
  useEffect(() => {
    useNavGuardStore.getState().setGuard(() => {
      const s = useWizardStore.getState();
      return s.addedStudies.length > 0 && !s.done;
    });
    return () => useNavGuardStore.getState().clearGuard();
  }, []);

  // Guard a browser refresh/close/tab-change with the native prompt while dirty.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const years = yearRange();
  const selType = STUDY_TYPES.find((t) => t.id === w.selType);
  const selCenter =
    pickedCenter && pickedCenter.id === w.centerId
      ? pickedCenter
      : centers.find((c) => c.id === w.centerId) ?? null;
  const selPerson = people.find((p) => p.id === w.personId);

  const dateResolved = resolveStudyDate(w.dateMode, w.dateMonth, w.dateYear, w.dateExact, w.dateFrom, w.dateTo);
  const dateRangeTooLong =
    w.dateMode === 'rg' &&
    !!w.dateFrom &&
    !!w.dateTo &&
    (new Date(`${w.dateTo}T00:00:00`).getTime() - new Date(`${w.dateFrom}T00:00:00`).getTime()) / 86400000 > 183;

  // ---- Body-part groups -----------------------------------------------------
  let groupsRaw = selType && selType.groupKey ? PART_GROUPS[selType.groupKey] ?? [] : [];
  if (selType?.filterFree) groupsRaw = groupsRaw.filter((g) => !g.free);
  const setPart = (val: string) => w.patch({ selPart: val, openGroupKey: null });

  const groups = groupsRaw.map((g) => {
    const prefix = `${g.short || g.l} — `;
    const isOpen = w.openGroupKey === g.k;
    const hasChildren = !!(g.ch && g.ch.length);
    const isFree = !!g.free;
    const expandable = hasChildren || isFree;
    const selMatch = expandable
      ? hasChildren
        ? (w.selPart || '').startsWith(prefix)
        : (w.selPart || '').startsWith(`${g.l} — `)
      : w.selPart === g.l;
    return { g, prefix, isOpen, hasChildren, isFree, expandable, selMatch };
  });
  const openGroup = groups.find((r) => r.isOpen) ?? null;

  // ---- Centers list (search is server-driven; only show once searching) -----
  const selCenterPin = selCenter;
  const centersToShow = w.centerSearch ? centers : [];
  const centersFiltered = selCenterPin
    ? [selCenterPin, ...centersToShow.filter((c) => c.id !== w.centerId)]
    : centersToShow;

  const addDisabled = !w.selType || (groups.length > 0 && !w.selPart) || !dateResolved;

  const addStudy = () => {
    if (addDisabled || !selType) return;
    const label = selType.label + (w.selPart ? ` · ${w.selPart}` : '') + ` · ${dateResolved}`;
    w.patch((cur) => ({
      addedStudies: [
        ...cur.addedStudies,
        {
          typeLabel: selType.label,
          partLabel: w.selPart || '',
          dateLabel: dateResolved,
          tag: selType.abbr,
          label,
          date: {
            mode: w.dateMode,
            month: w.dateMonth,
            year: w.dateYear,
            exact: w.dateExact,
            from: w.dateFrom,
            to: w.dateTo,
          },
        },
      ],
      selType: null,
      selPart: null,
      openGroupKey: null,
      freeText: '',
      dateMode: 'my',
      dateMonth: '',
      dateYear: '',
      dateExact: '',
      dateFrom: '',
      dateTo: '',
      justAdded: true,
      lastAddedLabel: label,
    }));
  };

  const next = () => {
    if (w.step === 'person' && !w.personId) return;
    if (curIdx < stepOrder.length - 1) w.patch({ step: stepOrder[curIdx + 1] as typeof w.step });
  };
  const back = () => {
    if (curIdx > 0) w.patch({ step: stepOrder[curIdx - 1] as typeof w.step });
  };

  const submit = async () => {
    if (!w.sigDrawn || w.addedStudies.length === 0 || submitting) return;
    if (!w.centerId) {
      showAlert({ message: 'Please select an imaging center.', status: 'error', autoClose: 6000 });
      return;
    }
    if (!selPerson) {
      showAlert({ message: 'Please select a patient.', status: 'error', autoClose: 6000 });
      return;
    }

    // Exact/range dates ride on each study; approximate month/year go to the
    // request-level studyPreference (single slot — derived from the first approx study).
    const scanItems = w.addedStudies.map((a) => ({
      scanType: a.typeLabel,
      bodyPoint: a.partLabel,
      scanDate: a.date.mode === 'ex' ? a.date.exact || null : a.date.mode === 'rg' ? a.date.from || null : null,
    }));

    const approx = w.addedStudies.find((a) => a.date.mode === 'my' || a.date.mode === 'yr' || a.date.mode === 'rg');
    let studyPreference: INewRequestFormRequest['studyPreference'] = null;
    if (approx) {
      const d = approx.date;
      if (d.mode === 'rg') {
        studyPreference = { periodFrom: d.from || null, periodTo: d.to || null, scanMonth: null, scanYear: null };
      } else if (d.mode === 'my') {
        studyPreference = { periodFrom: null, periodTo: null, scanMonth: d.month || null, scanYear: d.year || null };
      } else if (d.mode === 'yr') {
        studyPreference = { periodFrom: null, periodTo: null, scanMonth: null, scanYear: d.year || null };
      }
    }

    const payload: INewRequestFormRequest = {
      fullName: selPerson.name,
      age: ageOf(selPerson.dob) ?? 0,
      gender: selPerson.sex,
      patientId: String(w.personId),
      patientMrnNumber: w.mrn || undefined,
      labCenterId: w.centerId,
      scanItems,
      activeDays: 28,
      remarks: w.note || null,
      studyPreference,
      notifyByEmail: true,
      signature: w.signature ?? undefined,
    };

    try {
      setSubmitting(true);
      const res = await dispatch(createNewRequest(payload)).unwrap();
      w.patch({ done: true, reqId: res.requestId, signatureUrl: res.signatureUrl });
    } catch (error: any) {
      const message = error?.headers?.message || error?.message || 'Something went wrong';
      showAlert({ message, status: 'error', autoClose: 6000 });
    } finally {
      setSubmitting(false);
    }
  };

  // The nav guard shows the confirm modal when there are unsaved studies; when
  // there's nothing to lose it navigates straight through.
  const cancelWizard = () => nav.go('home');

  const typeTag = (id: string): StudyTag => STUDY_TYPES.find((t) => t.id === id)!.abbr;
  // ---- Success --------------------------------------------------------------
  if (w.done) {
    return (
      <div className="wrap" style={{ maxWidth: 1180 }}>
        <div className="success-wrap">
          <div className="success-ico">
            <Icon name="checkBig" />
          </div>
          <h2 className="serif">Request sent</h2>
          <p>
            We&apos;ve securely contacted <b style={{ color: 'var(--ink)' }}>{selCenter?.name}</b> with{' '}
            {selPerson?.name}&apos;s study details.
          </p>
          <span className="reqid">{w.reqId}</span>
          <div className="next-card">
            <h5>What happens next</h5>
            <div className="next-step">
              <div className="next-num">1</div>
              <div className="next-tx">The center verifies your request and uploads your studies &amp; radiology report.</div>
            </div>
            <div className="next-step">
              <div className="next-num">2</div>
              <div className="next-tx">You&apos;ll get a notification the moment they&apos;re ready to view.</div>
            </div>
            <div className="next-step">
              <div className="next-num">3</div>
              <div className="next-tx">Open them here anytime, or share it with a provider, family, or friend in a tap.</div>
            </div>
          </div>
          <div className="success-btns">
            <button className="btn btn-primary" onClick={() => nav.go('requests')}>
              Track this request
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => nav.openNotify({ kind: 'wizardRequest', from: 'requestSent' })}
            >
              See what the center receives
            </button>
            <button className="btn btn-ghost" onClick={() => nav.go('home')}>
              Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap" style={{ maxWidth: 1180 }}>
      <div className="wiz-hd">
        <div>
          <div className="kicker">New request</div>
          <div className="h1 serif" style={{ fontSize: 26 }}>
            {WIZ_STEPS.find((x) => x.key === w.step)?.label}
          </div>
        </div>
        <div className="stepper">
          {WIZ_STEPS.map((st, i) => (
            <span key={st.key} style={{ display: 'contents' }}>
              <div className={`step-circ ${i < curIdx ? 'done' : i === curIdx ? 'cur' : ''}`}>{st.n}</div>
              <span className={`step-lbl ${i === curIdx ? 'cur' : ''}`}>{st.label}</span>
              {i < WIZ_STEPS.length - 1 && <div className="step-line" />}
            </span>
          ))}
        </div>
      </div>

      <div className="wiz-card">
        {/* ---- Step 1: person ---- */}
        {w.step === 'person' && (
          <>
            <div className="wiz-hd-top" style={{ marginBottom: 6 }}>
              <div>
                <div className="wiz-ttl serif" style={{ marginBottom: 4 }}>
                  Who is this study for?
                </div>
                <div className="wiz-sub" style={{ marginBottom: 0 }}>
                  Choose yourself or a family member on your account.
                </div>
              </div>
              <button className="add-family-btn" onClick={() => openAddFamily('wizard')}>
                + Add family member
              </button>
            </div>
            <div className="person-cards" style={{ marginTop: 20 }}>
              {people.map((p) => (
                <button
                  key={p.id}
                  className={`p-card ${p.id === w.personId ? 'on' : ''}`}
                  onClick={() => w.patch({ personId: p.id })}
                >
                  <div className="p-av">{p.initials}</div>
                  <div>
                    <div className="p-nm">{p.name}</div>
                    <div className="p-rl">{p.isSelf ? 'You' : [p.role, p.sex].filter(Boolean).join(' · ')}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="wiz-nav">
              <button className="wiz-back-mini" onClick={cancelWizard}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: '0 0 auto', marginLeft: 'auto' }}
                onClick={next}
                disabled={!w.personId}
              >
                Next →
              </button>
            </div>
          </>
        )}

        {/* ---- Step 2: center ---- */}
        {w.step === 'center' && (
          <>
            <div className="wiz-hd-top" style={{ marginBottom: 6 }}>
              <div>
                <div className="wiz-ttl serif" style={{ marginBottom: 4 }}>
                  Which imaging center?
                </div>
                <div className="wiz-sub" style={{ marginBottom: 0 }}>
                  Where the study was done — or where it will be taken.
                </div>
              </div>
              <button className="add-family-btn add-center-desktop" onClick={() => openAddCenter('wizard')}>
                <Icon name="plus" sw={2.4} />
                Didn&apos;t find your center? Add it
              </button>
            </div>

            {selCenterPin ? (
              <>
                <div className="sel-type-row" style={{ alignItems: 'flex-start' }}>
                  <div className="sel-type-ico">
                    <Icon name="building" sw={1.7} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span className="sel-type-lbl">Imaging center selected</span>
                    <span className="sel-type-nm">{selCenterPin.name}</span>
                    <div style={{ fontSize: 13, color: 'var(--accent-d)', opacity: 0.85, marginTop: 3 }}>
                      {selCenterPin.address}
                    </div>
                    <div className="center-contacts" style={{ marginTop: 6 }}>
                      <div className="cb-contacts-row">
                        {selCenterPin.phone && (
                          <span className="center-contact">
                            <Icon name="phone" />
                            {selCenterPin.phone}
                          </span>
                        )}
                        {selCenterPin.fax && (
                          <span className="center-contact">
                            <Icon name="fax" />
                            {selCenterPin.fax}
                          </span>
                        )}
                      </div>
                      {selCenterPin.email && (
                        <span className="center-contact" style={{ width: '100%' }}>
                          <Icon name="mail" />
                          {selCenterPin.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className="sel-type-chg"
                    onClick={() => {
                      setPickedCenter(null);
                      w.patch({ centerId: null, centerSearch: '' });
                    }}
                  >
                    Change
                  </button>
                </div>
                <div className="field" style={{ marginTop: 16 }}>
                  <label>
                    Medical Record Number (MRN) / Patient ID <span className="ac-note">optional</span>
                  </label>
                  <input
                    className="inp"
                    type="text"
                    placeholder="e.g. 00482913"
                    value={w.mrn}
                    onChange={(e) => w.patch({ mrn: e.target.value })}
                  />
                </div>
                <div className="help-strip">
                  <Icon name="shield" sw={1.8} />
                  <p>
                    Your MRN is unique to this imaging center — you&apos;ll have a different one at each
                    hospital or clinic. Giving the right MRN lets the center match you instantly.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="search" style={{ marginTop: 16 }}>
                  <Icon name="search" />
                  <input
                    type="text"
                    placeholder="Search by name, city, zip or location"
                    value={w.centerSearch}
                    onChange={(e) => w.patch({ centerSearch: e.target.value })}
                  />
                  {w.centerSearch && (
                    <button className="search-clear" onClick={() => w.patch({ centerSearch: '' })}>
                      <Icon name="x" sw={2.4} />
                    </button>
                  )}
                </div>

                {!w.centerSearch && (
                  <div className="center-empty" style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--ink2)' }}>
                    <div className="center-empty-title" style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)', marginBottom: 6 }}>
                      Search for your imaging center
                    </div>
                    <div>Try a name, city, ZIP, or location — like &quot;Metro Radiology&quot; or &quot;Chicago&quot;.</div>
                  </div>
                )}
                {w.centerSearch && centersFiltered.length === 0 && (
                  <div className="center-empty" style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--ink2)' }}>
                    <div className="center-empty-title" style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)', marginBottom: 6 }}>
                      No matches for &quot;{w.centerSearch}&quot;
                    </div>
                    <div>Double-check the spelling, or add it as a new center above.</div>
                  </div>
                )}

                {centersFiltered.map((c) => (
                  <button
                    key={c.id}
                    className={`center-card ${c.id === w.centerId ? 'on' : ''}`}
                    onClick={() => {
                      setPickedCenter(c);
                      w.patch({ centerId: c.id });
                    }}
                  >
                    <div className="center-ico">
                      <Icon name="building" />
                    </div>
                    <div className="study-bd">
                      <div className="center-nm">{c.name}</div>
                      <div className="center-sub">{c.address}</div>
                      <div className="center-contacts">
                        <div className="cb-contacts-row">
                          {c.phone && (
                            <span className="center-contact">
                              <Icon name="phone" />
                              {c.phone}
                            </span>
                          )}
                          {c.fax && (
                            <span className="center-contact">
                              <Icon name="fax" />
                              {c.fax}
                            </span>
                          )}
                        </div>
                        {c.email && (
                          <span className="center-contact" style={{ width: '100%' }}>
                            <Icon name="mail" />
                            {c.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}

                <button className="add-family-btn add-center-mobile" onClick={() => openAddCenter('wizard')}>
                  <Icon name="plus" sw={2.4} />
                  Didn&apos;t find your center? Add it
                </button>
              </>
            )}

            <div className="wiz-nav" style={{ marginTop: 20 }}>
              <button className="wiz-back-mini" onClick={back}>
                ← Back
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: '0 0 auto', marginLeft: 'auto' }}
                onClick={next}
                disabled={!w.centerId}
              >
                Next →
              </button>
            </div>
          </>
        )}

        {/* ---- Step 3: studies ---- */}
        {w.step === 'studies' && (
          <>
            <div className="wiz-hd-top" style={{ marginBottom: 16 }}>
              <div>
                <div className="wiz-ttl serif" style={{ marginBottom: 4 }}>
                  Add studies
                </div>
                <div className="wiz-sub" style={{ marginBottom: 0 }}>
                  Choose type, body parts and date — add as many as you need in one request.
                </div>
              </div>
              {w.addedStudies.length > 0 && !w.justAdded && (
                <button className="btn btn-primary btn-mini" onClick={() => w.patch({ step: 'review', justAdded: false })}>
                  Review, Sign &amp; Send
                </button>
              )}
            </div>

            {w.addedStudies.length > 0 && (
              <div className="added-strip">
                <div className="added-strip-hd">Added to this request</div>
                {w.addedStudies.map((a, i) => (
                  <div key={i} className="added-row">
                    <div className="added-row-ico">{a.tag}</div>
                    <div className="added-row-bd">
                      <div className="added-row-type">{a.typeLabel}</div>
                      <div className="added-row-part">
                        {a.partLabel && `${a.partLabel} · `}
                        {a.dateLabel}
                      </div>
                    </div>
                    <button
                      className="added-row-rm"
                      onClick={() => w.patch((cur) => ({ addedStudies: cur.addedStudies.filter((_, idx) => idx !== i) }))}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {w.justAdded ? (
              <div className="added-panel">
                <div className="added-panel-ck">
                  <Icon name="check" sw={3} />
                </div>
                <div className="added-panel-ttl">Study added to your request</div>
                <div className="added-panel-sub">{w.lastAddedLabel}</div>
                <div className="added-panel-btns">
                  <button className="btn btn-ghost" onClick={() => w.patch({ justAdded: false })}>
                    + Add another study
                  </button>
                  <button className="btn btn-primary" onClick={() => w.patch({ step: 'review', justAdded: false })}>
                    Review, Sign &amp; Send Request
                  </button>
                </div>
              </div>
            ) : (
              <>
                {!w.selType ? (
                  <>
                    <div className="added-strip-hd" style={{ marginTop: 4 }}>
                      Study type
                    </div>
                    <div className="help-strip help-strip-sm" style={{ marginBottom: 14 }}>
                      <Icon name="bulb" sw={1.8} />
                      <p>Not sure which one? Pick the closest match — you can change it later.</p>
                    </div>
                    <div className="type-grid">
                      {STUDY_TYPES.map((t) => (
                        <button
                          key={t.id}
                          className={`type-card ${t.id === w.selType ? 'on' : ''}`}
                          onClick={() => w.patch({ selType: t.id, selPart: null, openGroupKey: null, freeText: '' })}
                        >
                          <div className="type-card-ico">
                            <StudyIcon tag={typeTag(t.id)} />
                          </div>
                          <div className="type-card-nm">{t.label}</div>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="sel-type-row">
                      <div className="sel-type-ico">
                        <StudyIcon tag={selType!.abbr} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span className="sel-type-lbl">Study type selected</span>
                        <span className="sel-type-nm">{selType!.label}</span>
                      </div>
                      <button
                        className="sel-type-chg"
                        onClick={() => w.patch({ selType: null, selPart: null, openGroupKey: null, freeText: '' })}
                      >
                        Change
                      </button>
                    </div>

                    {groups.length > 0 && (
                      <div className="part-grid">
                        <div className="added-strip-hd">Body part</div>
                        <div className="help-strip help-strip-sm" style={{ marginBottom: 14 }}>
                          <Icon name="bulb" sw={1.8} />
                          <p>Choose the one area that was scanned for this study.</p>
                        </div>
                        <div className="pg-chips">
                          {groups.map(({ g, isOpen, expandable, selMatch }) => (
                            <button
                              key={g.k}
                              className={`pg-chip ${selMatch ? 'sel' : ''}`}
                              onClick={() =>
                                expandable
                                  ? w.patch({ openGroupKey: isOpen ? null : g.k, freeText: '' })
                                  : setPart(g.l)
                              }
                            >
                              <span>{g.l}</span>
                              {expandable && <Icon name="chevronDown" className={`ic pg-chev ${isOpen ? 'open' : ''}`} sw={2.6} />}
                            </button>
                          ))}
                        </div>

                        {openGroup && (
                          <div className="pg-sub">
                            {openGroup.hasChildren && (
                              <>
                                <div className="pg-sub-lbl">{openGroup.g.l} — choose one</div>
                                <div className="pg-children">
                                  {openGroup.g.ch!.map((c) => (
                                    <button
                                      key={c}
                                      className={`pg-child ${w.selPart === openGroup.prefix + c ? 'sel' : ''}`}
                                      onClick={() => setPart(openGroup.prefix + c)}
                                    >
                                      {c}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                            {openGroup.isFree && (
                              <>
                                <div className="pg-sub-lbl">{openGroup.g.l} — please specify</div>
                                <div className="pg-free">
                                  <input
                                    type="text"
                                    placeholder="Describe the body part"
                                    value={w.freeText}
                                    onChange={(e) => w.patch({ freeText: e.target.value })}
                                  />
                                  <button
                                    disabled={!w.freeText.trim()}
                                    onClick={() => w.freeText.trim() && setPart(`${openGroup.g.l} — ${w.freeText.trim()}`)}
                                  >
                                    Add
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}

                        {w.selPart && (
                          <div className="selpart-banner">
                            <div className="selpart-banner-ic">
                              <Icon name="check" sw={2.6} />
                            </div>
                            <div className="selpart-banner-bd">
                              <div className="selpart-banner-lbl">Body part selected</div>
                              <div className="selpart-banner-val">{w.selPart}</div>
                            </div>
                            <button className="selpart-banner-chg" onClick={() => w.patch({ selPart: null })}>
                              Change
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="added-strip-hd" style={{ marginTop: 4 }}>
                      When was it done?
                    </div>
                    <div className="help-strip help-strip-sm" style={{ marginBottom: 14 }}>
                      <Icon name="bulb" sw={1.8} />
                      <p>Not sure of the exact date? An approximate timeframe is perfectly fine.</p>
                    </div>
                    <div className="date-seg">
                      {DATE_MODES.map(([k, l]) => (
                        <button
                          key={k}
                          className={`date-seg-btn ${w.dateMode === k ? 'on' : ''}`}
                          onClick={() => w.patch({ dateMode: k as typeof w.dateMode })}
                        >
                          {l}
                        </button>
                      ))}
                    </div>

                    {w.dateMode === 'my' && (
                      <div className="date-mobile">
                        <div className="dgrid">
                          <Dropdown
                            ddKey="wizMonth"
                            value={w.dateMonth}
                            placeholder="Month"
                            scrim={false}
                            options={MONTHS.map((m) => ({ value: m, label: m }))}
                            onPick={(dateMonth) => w.patch({ dateMonth })}
                          />
                          <Dropdown
                            ddKey="wizYear"
                            value={w.dateYear}
                            placeholder="Year"
                            scrim={false}
                            options={years.map((y) => ({ value: y, label: y }))}
                            onPick={(dateYear) => w.patch({ dateYear })}
                          />
                        </div>
                      </div>
                    )}

                    {w.dateMode === 'yr' && (
                      <div className="date-mobile">
                        <Dropdown
                          ddKey="wizYearOnly"
                          value={w.dateYear}
                          placeholder="Year"
                          scrim={false}
                          options={years.map((y) => ({ value: y, label: y }))}
                          onPick={(dateYear) => w.patch({ dateYear })}
                        />
                      </div>
                    )}

                    {w.dateMode === 'ex' && (
                      <div className="date-row">
                        <div className="datepick" style={{ flex: 1 }}>
                          <input
                            className="inp"
                            type="date"
                            max={todayIso()}
                            value={w.dateExact}
                            onChange={(e) => w.patch({ dateExact: e.target.value })}
                          />
                          <span className={`datepick-txt ${w.dateExact ? '' : 'ph'}`}>
                            {fmtMDY(w.dateExact) || 'MM/DD/YYYY'}
                          </span>
                        </div>
                      </div>
                    )}

                    {w.dateMode === 'rg' && (
                      <>
                        <div className="daterange-grid">
                          <div className="field" style={{ marginBottom: 0 }}>
                            <label>From date</label>
                            <div className="datepick">
                              <input
                                className="inp"
                                type="date"
                                max={todayIso()}
                                value={w.dateFrom}
                                onChange={(e) => w.patch({ dateFrom: e.target.value })}
                              />
                              <span className={`datepick-txt ${w.dateFrom ? '' : 'ph'}`}>
                                {fmtMDY(w.dateFrom) || 'MM/DD/YYYY'}
                              </span>
                            </div>
                          </div>
                          <div className="field" style={{ marginBottom: 0 }}>
                            <label>To date</label>
                            <div className="datepick">
                              <input
                                className="inp"
                                type="date"
                                max={todayIso()}
                                value={w.dateTo}
                                onChange={(e) => w.patch({ dateTo: e.target.value })}
                              />
                              <span className={`datepick-txt ${w.dateTo ? '' : 'ph'}`}>
                                {fmtMDY(w.dateTo) || 'MM/DD/YYYY'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="date-tip" style={dateRangeTooLong ? { color: 'var(--rose)' } : undefined}>
                          <Icon name="info" sw={1.8} />
                          {dateRangeTooLong
                            ? 'Range can span up to 6 months — adjust your dates.'
                            : 'Range can span up to 6 months — pick a from date first.'}
                        </div>
                      </>
                    )}

                    {dateResolved && (
                      <div className="date-summary">
                        <Icon name="checkBig" sw={2.6} />
                        Study date set to {dateResolved}
                      </div>
                    )}

                    <div className="wiz-nav" style={{ marginTop: 14 }}>
                      <button className="wiz-back-mini" onClick={back}>
                        ← Back
                      </button>
                      <button
                        className="add-study-btn"
                        style={{ marginBottom: 0, marginLeft: 'auto' }}
                        onClick={addStudy}
                        disabled={addDisabled}
                      >
                        + Add this study to the request
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* ---- Step 4: review ---- */}
        {w.step === 'review' && (
          <>
            <div className="wiz-ttl serif">Review &amp; sign</div>
            <div className="wiz-sub">Check the details, sign below, then send your request.</div>

            <div className="rev-block">
              <div className="rev-row">
                <div className="rev-ic">
                  <Icon name="user" sw={1.8} />
                </div>
                <div className="rev-bd">
                  <div className="rev-k">Patient</div>
                  <div className="rev-v">{selPerson?.name}</div>
                  <div className="rev-sub">
                    {selPerson
                      ? [
                          selPerson.sex,
                          ageOf(selPerson.dob) != null ? `${ageOf(selPerson.dob)} yrs` : null,
                          selPerson.dob ? `DOB ${fmtLong(selPerson.dob)}` : null,
                          w.mrn ? `MRN ${w.mrn}` : null,
                        ]
                          .filter(Boolean)
                          .join('  ·  ')
                      : ''}
                  </div>
                </div>
                <button className="rev-edit" onClick={() => w.patch({ step: 'person' })}>
                  Edit
                </button>
              </div>
              <div className="rev-row">
                <div className="rev-ic">
                  <Icon name="building" sw={1.7} />
                </div>
                <div className="rev-bd">
                  <div className="rev-k">Imaging center</div>
                  <div className="rev-v">{selCenter?.name}</div>
                  <div className="rev-sub">{selCenter?.address}</div>
                </div>
                <button className="rev-edit" onClick={() => w.patch({ step: 'center' })}>
                  Edit
                </button>
              </div>
              <div className="rev-row">
                <div className="rev-ic">
                  <Icon name="clipboard" sw={1.8} />
                </div>
                <div className="rev-bd">
                  <div className="rev-k">Studies</div>
                  <div className="rev-v">
                    {w.addedStudies.length
                      ? `${w.addedStudies.length} ${w.addedStudies.length === 1 ? 'study' : 'studies'}: ${[
                          ...new Set(w.addedStudies.map((a) => a.typeLabel)),
                        ].join(', ')}`
                      : '—'}
                  </div>
                </div>
                <button className="rev-edit" onClick={() => w.patch({ step: 'studies' })}>
                  Edit
                </button>
              </div>
            </div>

            <div className="added-strip-hd" style={{ marginTop: 20 }}>
              Studies requested ({w.addedStudies.length})
            </div>
            <div className="rev-block">
              {w.addedStudies.map((a, i) => (
                <div key={i} className="studline">
                  <div className="study-ico">{a.tag}</div>
                  <div className="study-bd">
                    <div className="studline-nm">
                      {a.typeLabel}
                      {a.partLabel && ` · ${a.partLabel}`}
                    </div>
                    <div className="studline-sub">{a.dateLabel}</div>
                  </div>
                  <button
                    className="added-row-rm"
                    onClick={() => w.patch((cur) => ({ addedStudies: cur.addedStudies.filter((_, idx) => idx !== i) }))}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="added-strip-hd" style={{ marginTop: 20 }}>
              Note to imaging center <span className="ac-note">optional</span>
            </div>
            <textarea
              className="remarks-ta"
              placeholder="e.g. Please prioritize — needed before my appointment on Friday."
              value={w.note}
              onChange={(e) => w.patch({ note: e.target.value.slice(0, 240) })}
              maxLength={240}
            />
            <div className="date-tip">
              <Icon name="shield" sw={1.8} />
              Keep it short and specific — this is sent to the center along with your request.
            </div>

            <div className="added-strip-hd" style={{ marginTop: 20 }}>
              Sign to authorize
            </div>
            {w.addedStudies.length > 0 && (
              <div className="sign-box">
                <SignaturePad
                  clearKey={sigClearKey}
                  onDrawn={(dataUrl) => w.patch({ sigDrawn: true, signature: dataUrl })}
                />
                {!w.sigDrawn && <div className="sig-ph">Sign here with your mouse or finger</div>}
                <div className="sig-meta">
                  {w.sigDrawn ? (
                    <span>
                      Signed by <b>{selPerson?.name}</b> · July 17, 2026
                    </span>
                  ) : (
                    <span />
                  )}
                  <button
                    className="sig-clear"
                    onClick={() => {
                      setSigClearKey((k) => k + 1);
                      w.patch({ sigDrawn: false, signature: null });
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
            {w.addedStudies.length === 0 && (
              <div className="sig-warn">Add at least one study above before you can sign and send this request.</div>
            )}
            {!w.sigDrawn && (
              <div className="sig-warn">
                <Icon name="alert" sw={2} />
                Signature required — sign above to send your request
              </div>
            )}

            <div className="help-strip" style={{ marginTop: 14 }}>
              <Icon name="shield" sw={1.8} />
              <p>Your signed request includes the full patient &amp; study details and is sent securely.</p>
            </div>

            <div className="wiz-nav">
              <button className="wiz-back-mini" onClick={back}>
                ← Back
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: '0 0 auto', marginLeft: 'auto' }}
                onClick={submit}
                disabled={!w.sigDrawn || w.addedStudies.length === 0 || submitting}
              >
                {submitting ? 'Sending…' : '✓ Confirm & send'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
