import { useEffect, useRef } from 'react';
import { Icon } from '@/components/common/Icon';
import { StudyIcon } from '@/components/common/StudyIcon';
import { useDomainData } from '@/hooks/useDomainData';
import { useStaffStore } from '@/store/dashboard/staffStore';
import { useDialogStore } from '@/store/dashboard/dialogStore';
import { statusMeta } from '@/utils/status';
import { fmtLong } from '@/utils/format';
import type { StudyTag } from '@/types';

function dateFromLabel(label: string): string {
  const parts = label.split(' · ');
  const tail = (parts[parts.length - 1] || '').trim();
  if (/^\d{4}$/.test(tail)) return tail;
  if (/^[A-Za-z]{3,9} \d{4}$/.test(tail)) return tail;
  if (/^[A-Za-z]{3,9} \d{1,2}, \d{4}$/.test(tail)) return tail;
  if (tail.includes(' – ')) return tail;
  return '';
}

function dateHelp(d: string): { label: string; body: string } {
  const str = (d || '').trim();
  if (!str || str === 'Not specified')
    return {
      label: 'No date given — how to search',
      body: "The patient didn't give a time period for this study. Search your full archive for this study type and body part, and use your best judgement on the closest match.",
    };
  if (/^Year \d{4}$/.test(str))
    return {
      label: 'Year only — how to match',
      body: `The patient only remembers the year. Search your records for any matching study performed at any point during ${str.replace('Year ', '')}.`,
    };
  if (/^[A-Za-z]{3,9} \d{1,2}, \d{4}$/.test(str))
    return {
      label: 'Exact date — how to match',
      body: `The patient gave an exact date: ${str}. Look for a study performed on this day; if nothing matches, check a day or two on either side.`,
    };
  if (/^[A-Za-z]{3,9} \d{4}$/.test(str))
    return {
      label: 'Month & year — how to match',
      body: `The patient remembers the month, not the exact day: ${str}. Search that full month.`,
    };
  if (str.includes(' – '))
    return {
      label: 'Date range — how to match',
      body: `The patient isn't sure of the exact date, only that it falls between ${str}. Check every study of this type across the full range.`,
    };
  return { label: 'How to match this study', body: 'Search your records for a study matching this type, body part and time period.' };
}

export function StaffUpload() {
  const { requests, centers, people } = useDomainData();
  const sf = useStaffStore();
  const dialog = useDialogStore();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const testReqs = requests.filter((r) => r.items.some((it) => it.status === 'pending'));
  const hasTestReq = testReqs.length > 0;
  const testReq =
    testReqs.find((r) => r.id === sf.testReqId) ?? testReqs[0] ?? { id: '', center: '', patient: '', items: [] as never[] };

  useEffect(() => {
    if (hasTestReq && !testReqs.find((r) => r.id === sf.testReqId)) {
      sf.resetForRequest(testReqs[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTestReq, testReq.id]);

  const person = people.find((p) => p.name === testReq.patient);
  const centerFallback = centers.find((c) => c.name === testReq.center);
  const liveItems = testReq.items.filter((it) => it.status === 'pending');

  const yearLabel = (d: string) => (/^\d{4}$/.test((d || '').trim()) ? `Year ${d.trim()}` : d);

  const studies = liveItems.map((it, i) => {
    const rawDate = it.dateLabel || dateFromLabel(it.label) || '';
    const typeOnly = rawDate && it.label.endsWith(` · ${rawDate}`) ? it.label.slice(0, -` · ${rawDate}`.length) : it.label;
    const origIdx = testReq.items.indexOf(it);
    const stt = sf.studyState[i] || 'await';
    const isDone = stt === 'done' || !!sf.pacsDone[i];
    return {
      i,
      origIdx,
      tag: it.tag as StudyTag,
      name: typeOnly,
      date: yearLabel(rawDate || 'Not specified'),
      notFound: !!it.notFound,
      centerNote: it.centerNote || '',
      isDone,
      isUploading: stt === 'uploading',
    };
  });

  const allReceived = studies.length > 0 && studies.every((s) => s.isDone);
  const isFilesMethod = sf.fulfillMethod === 'files';

  const doUpload = () => {
    const sel = sf.selected;
    if (sel == null) return;
    sf.patch({ studyState: { ...sf.studyState, [sel]: 'uploading' } });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      sf.patch((cur) => ({ studyState: { ...cur.studyState, [sel]: 'done' }, selected: null }));
    }, 1500);
  };

  const submitPacs = () => {
    const sel = sf.selected;
    if (sel == null || !sf.pacsUrlDraft.trim()) return;
    sf.patch({ pacsDone: { ...sf.pacsDone, [sel]: true }, selected: null, pacsUrlDraft: '', pacsCodeDraft: '' });
  };

  return (
    <>
      <div className="field" style={{ maxWidth: 460 }}>
        <label>Testing: choose a request to preview</label>
        <select
          className="inp"
          style={{ height: 50, fontSize: 14.5 }}
          value={testReq.id}
          onChange={(e) => sf.resetForRequest(e.target.value)}
        >
          {testReqs.map((r) => (
            <option key={r.id} value={r.id}>
              {`${r.id} — ${r.center} · ${r.patient} (${statusMeta(r.status).label})`}
            </option>
          ))}
        </select>
      </div>

      {!hasTestReq && (
        <div className="help-strip">
          <Icon name="info" sw={1.8} />
          <p>
            No requests are currently waiting on this center — every study has already been fulfilled
            or cancelled.
          </p>
        </div>
      )}

      {hasTestReq && (
        <>
          <div className="centerbar2">
            <div className="cb-nm">
              <span>{testReq.center}</span>
              <span className="cb-req2">{testReq.id}</span>
            </div>
            <div className="cb-contacts2b">
              <span className="cb-c">
                <Icon name="mapPin" sw={1.8} />
                {testReq.centerAddr || centerFallback?.address}
              </span>
              <span className="cb-c">
                <Icon name="phone" sw={1.8} />
                {testReq.centerPhone || centerFallback?.phone}
              </span>
              <span className="cb-c">
                <Icon name="fax" sw={1.8} />
                {testReq.centerFax || centerFallback?.fax}
              </span>
              <span className="cb-c">
                <Icon name="mail" sw={1.8} />
                {testReq.centerEmail || centerFallback?.email}
              </span>
            </div>
          </div>

          <div className="ptbar2">
            <div className="ptbar2-top">
              <div className="p-av">{person?.initials || '?'}</div>
              <div className="ptnm">{testReq.patient}</div>
              <div className="ptbar2-meta">
                <span className="ptm">
                  <span className="k">DOB</span>
                  <span className="v">{person?.dob ? fmtLong(person.dob) : '—'}</span>
                </span>
                <span className="ptm">
                  <span className="k">Sex</span>
                  <span className="v">{person?.sex || '—'}</span>
                </span>
                <span className="ptm">
                  <span className="k">MRN</span>
                  <span className="v">{testReq.mrn || 'Not provided'}</span>
                </span>
                <span className="ptm">
                  <span className="k">Mobile</span>
                  <span className="v">+1 (248) 737-6695</span>
                </span>
              </div>
            </div>
            <div className="ptbar2-acts">
              <button className="pt-actbtn" onClick={() => sf.patch({ modal: 'text', textMsgDraft: '' })}>
                <Icon name="chat" sw={1.8} />
                Text patient
              </button>
              <button className="pt-actbtn danger" onClick={() => sf.patch({ modal: 'notOurPatient' })}>
                <Icon name="alert" sw={1.8} />
                Not our patient
              </button>
              <button
                className={`verify-btn2 ${sf.verified ? 'ok' : ''}`}
                onClick={() => sf.patch({ verified: !sf.verified })}
              >
                <Icon name="checkCircle" sw={2} />
                {sf.verified ? 'Patient confirmed' : 'Confirm patient'}
              </button>
            </div>
          </div>

          {testReq.note && sf.verified && (
            <div className="note-box" style={{ marginBottom: 16 }}>
              <div className="nb-lbl">Note from patient</div>
              <div className="nb-txt">{testReq.note}</div>
            </div>
          )}

          {sf.flagged && (
            <div className="help-strip" style={{ background: '#F6ECEB', borderColor: '#E4CECB', marginBottom: 16 }}>
              <Icon name="alert" sw={1.8} style={{ color: 'var(--rose)' }} />
              <p style={{ color: '#7A3530' }}>
                <b>Marked as Not Our Patient.</b> {testReq.patient} has been notified. This request is
                locked.{' '}
                <a
                  onClick={() => sf.patch({ flagged: false })}
                  style={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 700 }}
                >
                  Undo
                </a>
              </p>
            </div>
          )}

          {!sf.verified && (
            <div className="help-strip" style={{ marginBottom: 16 }}>
              <Icon name="bulb" sw={1.8} />
              <p>
                <b>Confirm the patient first.</b> Check that these details match your records, then tap
                Confirm patient above.
              </p>
            </div>
          )}

          {sf.verified && !sf.flagged && (
            <div className="ulist2 single">
              {studies.map((s) => {
                const isSel = sf.selected === s.i;
                const expanded = isSel && !s.isDone && sf.noteOpenIdx !== s.origIdx && sf.dupConfirmIdx !== s.origIdx;
                const help = dateHelp(s.date);
                const helpOpen = sf.cardHelpIdx === s.origIdx;
                const stop = (e: React.MouseEvent) => e.stopPropagation();
                return (
                  <div key={s.i} className={expanded ? 'wide' : ''}>
                    <div className="uhelp-wrap">
                      <button
                        className="uhelp-btn"
                        onClick={(e) => {
                          stop(e);
                          sf.patch({ cardHelpIdx: helpOpen ? null : s.origIdx });
                        }}
                      >
                        <Icon name="bulb" sw={1.8} />
                        {help.label}
                      </button>
                    </div>

                    {helpOpen && (
                      <div className="getsheet-scrim" onClick={() => sf.patch({ cardHelpIdx: null })}>
                        <div className="getsheet-card notice-card" onClick={stop}>
                          <h3 className="serif">{help.label}</h3>
                          <p style={{ marginBottom: 0 }}>{help.body}</p>
                          <button
                            className="btn btn-primary btn-block"
                            style={{ marginTop: 18 }}
                            onClick={() => sf.patch({ cardHelpIdx: null })}
                          >
                            Got it
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="urow2-card">
                      <div
                        className={`urow2 ${isSel ? 'sel' : ''} ${s.notFound ? 'notfound' : ''}`}
                        onClick={() => {
                          if (!sf.verified || s.isDone || s.notFound) return;
                          sf.patch({ selected: isSel ? null : s.i, pacsUrlDraft: '' });
                        }}
                      >
                        <div className="study-ico">
                          <StudyIcon tag={s.tag} />
                        </div>
                        <div className="urow-bd">
                          <div className="urow2-nm">{s.name}</div>
                          <div className="urow2-mt">Study date: {s.date}</div>
                        </div>
                        {s.isDone && <span className="chip ready">Received</span>}
                        {s.isUploading && <span className="chip pending">Uploading…</span>}
                        {s.notFound && <span className="chip cancelled">Not found</span>}
                        {!s.isDone && !s.isUploading && !s.notFound && (
                          <>
                            <span className={`radio3 ${isSel ? 'on' : ''}`}>{isSel && <span className="dot3" />}</span>
                            <span className="sellbl2">{isSel ? 'Selected' : 'Select'}</span>
                          </>
                        )}
                      </div>

                      {s.notFound && (
                        <div className="urow2-flag">
                          <Icon name="info" sw={1.8} />
                          <span>The patient has been told this study wasn&apos;t found for this period.</span>
                        </div>
                      )}

                      <div className="urow2-secacts">
                        {!s.isDone && sf.noteOpenIdx !== s.origIdx && (
                          <button
                            className="urow2-link"
                            onClick={(e) => {
                              stop(e);
                              sf.patch({ noteOpenIdx: s.origIdx, noteDraft: s.centerNote, dupConfirmIdx: null });
                            }}
                          >
                            <Icon name="search" sw={2} />
                            {s.notFound ? 'Edit note to patient' : "Couldn't find this study?"}
                          </button>
                        )}
                        {s.isDone && sf.dupConfirmIdx !== s.origIdx && (
                          <button
                            className="urow2-link"
                            onClick={(e) => {
                              stop(e);
                              sf.patch({ dupConfirmIdx: s.origIdx, noteOpenIdx: null, noteDraft: '' });
                            }}
                          >
                            <Icon name="plus" sw={2.4} />
                            Found more than one?
                          </button>
                        )}
                      </div>

                      {sf.noteOpenIdx === s.origIdx && (
                        <div className="urow2-noteedit" onClick={stop}>
                          <p className="urow2-editintro">
                            This note is sent straight to the patient, letting them know you searched
                            your records and couldn&apos;t find a matching study for this period.
                          </p>
                          <textarea
                            className="inp"
                            style={{ height: 70, padding: '12px 14px', resize: 'none', fontSize: 14 }}
                            placeholder="e.g. No CT of the head/brain was performed for this patient in 2022."
                            value={sf.noteDraft}
                            onChange={(e) => sf.patch({ noteDraft: e.target.value })}
                          />
                          <div className="af-btns" style={{ marginTop: 10 }}>
                            <button className="btn btn-ghost" onClick={() => sf.patch({ noteOpenIdx: null, noteDraft: '' })}>
                              Cancel
                            </button>
                            <button
                              className="btn btn-primary"
                              onClick={() => {
                                sf.patch({ noteOpenIdx: null, noteDraft: '' });
                                dialog.showNotice(
                                  'Note sent',
                                  'The patient has been notified that this study could not be found.',
                                );
                              }}
                            >
                              Send note to patient
                            </button>
                          </div>
                        </div>
                      )}

                      {sf.dupConfirmIdx === s.origIdx && (
                        <div className="urow2-noteedit" onClick={stop}>
                          <p className="urow2-editintro">
                            Found a second (or third) {s.name} scan performed in this same period? Add it
                            as its own entry below.
                          </p>
                          <div className="af-btns" style={{ marginTop: 2 }}>
                            <button className="btn btn-ghost" onClick={() => sf.patch({ dupConfirmIdx: null })}>
                              Cancel
                            </button>
                            <button className="btn btn-primary" onClick={() => sf.patch({ dupConfirmIdx: null })}>
                              Yes, add another entry
                            </button>
                          </div>
                        </div>
                      )}

                      {expanded && (
                        <div className="uexpand" onClick={stop}>
                          <div className="uexpand-tabs">
                            <button
                              className={isFilesMethod ? 'on' : ''}
                              onClick={() => sf.patch({ fulfillMethod: 'files' })}
                            >
                              Upload files
                            </button>
                            <button
                              className={!isFilesMethod ? 'on' : ''}
                              onClick={() => sf.patch({ fulfillMethod: 'link' })}
                            >
                              Provide viewer link
                            </button>
                          </div>
                          <div className="uexpand-body">
                            {isFilesMethod && !s.isUploading && (
                              <>
                                <div className="umethod-seg">
                                  <button
                                    className={sf.uploadSource === 'computer' ? 'on' : ''}
                                    onClick={() => sf.patch({ uploadSource: 'computer' })}
                                  >
                                    This computer
                                  </button>
                                  <button
                                    className={sf.uploadSource === 'cd' ? 'on' : ''}
                                    onClick={() => sf.patch({ uploadSource: 'cd' })}
                                  >
                                    CD / DVD
                                  </button>
                                </div>
                                <div className="umethod-drop">
                                  <Icon name="upload" sw={1.6} />
                                  <p>Only DICOM image files are uploaded from the selected folder.</p>
                                </div>
                                <button className="btn btn-primary btn-block" onClick={doUpload}>
                                  {sf.uploadSource === 'cd' ? 'Open disc & select folder' : 'Select folder from computer'}
                                </button>
                              </>
                            )}
                            {s.isUploading && (
                              <>
                                <div className="su-prog">
                                  <div className="su-prog-lbl">
                                    <span className="su-spin" />
                                    Transferring files securely…
                                  </div>
                                  <div className="su-prog-bar">
                                    <i />
                                  </div>
                                </div>
                                <button
                                  className="btn btn-ghost btn-block"
                                  onClick={() => {
                                    if (timer.current) clearTimeout(timer.current);
                                    sf.patch({ selected: null });
                                  }}
                                >
                                  Cancel upload
                                </button>
                              </>
                            )}
                            {!isFilesMethod && !s.isDone && (
                              <>
                                <div className="field">
                                  <label>Direct image viewer link</label>
                                  <textarea
                                    className="inp"
                                    style={{ height: 70, resize: 'none' }}
                                    placeholder="https://yourpacs.example.com/viewer?..."
                                    value={sf.pacsUrlDraft}
                                    onChange={(e) => sf.patch({ pacsUrlDraft: e.target.value })}
                                  />
                                </div>
                                <div className="field">
                                  <label>PACS system (optional)</label>
                                  <input
                                    className="inp"
                                    placeholder="e.g. Sectra, Ambra"
                                    value={sf.pacsProviderDraft}
                                    onChange={(e) => sf.patch({ pacsProviderDraft: e.target.value })}
                                  />
                                </div>
                                <button
                                  className="btn btn-primary btn-block"
                                  disabled={!sf.pacsUrlDraft.trim()}
                                  onClick={submitPacs}
                                >
                                  Save link &amp; notify patient
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {allReceived && (
                <div
                  className="help-strip"
                  style={{ margin: '0 16px 16px', background: 'var(--accent-t)', borderColor: '#CFE0DA' }}
                >
                  <Icon name="check" sw={2.4} />
                  <p style={{ color: 'var(--accent-d)', fontWeight: 700 }}>All studies received — patient notified</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {sf.modal === 'text' && (
        <div className="getsheet-scrim" onClick={() => sf.patch({ modal: null })}>
          <div className="getsheet-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="serif">Text {testReq.patient}</h3>
            <p>Send a quick text message to +1 (248) 737-6695 about this request.</p>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Message</label>
              <textarea
                className="inp"
                style={{ height: 100, resize: 'none' }}
                placeholder="e.g. Hi John, we need a clearer photo ID."
                value={sf.textMsgDraft}
                onChange={(e) => sf.patch({ textMsgDraft: e.target.value })}
              />
            </div>
            <div className="af-btns">
              <button className="btn btn-ghost" onClick={() => sf.patch({ modal: null })}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                disabled={!sf.textMsgDraft.trim()}
                onClick={() => {
                  sf.patch({ modal: null });
                  dialog.showNotice('Text sent', `A text message was sent to ${testReq.patient}.`);
                }}
              >
                Send text
              </button>
            </div>
          </div>
        </div>
      )}

      {sf.modal === 'notOurPatient' && (
        <div className="getsheet-scrim" onClick={() => sf.patch({ modal: null })}>
          <div className="getsheet-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="serif">Mark as Not Our Patient?</h3>
            <p>
              {testReq.patient} doesn&apos;t match your records for this imaging center. Confirming will
              lock this request and let the patient know they may have sent it to the wrong center.
            </p>
            <div className="af-btns">
              <button className="btn btn-ghost" onClick={() => sf.patch({ modal: null })}>
                Cancel
              </button>
              <button
                className="btn btn-ghost"
                style={{ flex: 1, color: 'var(--rose)', borderColor: '#E4CECB' }}
                onClick={() => sf.patch({ flagged: true, modal: null })}
              >
                Confirm — not our patient
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
