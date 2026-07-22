import { useRef } from 'react';
import { Icon } from '@/components/common/Icon';
import { useDomainData } from '@/hooks/useDomainData';
import { useNavStore } from '@/store/navStore';
import { useSelfUploadStore } from '@/store/selfUploadStore';
import { useCreateSelfUpload } from '@/hooks/mutations';
import { fmtMDY, todayLabel } from '@/utils/format';
import type { Study } from '@/types';

export function SelfUploadScreen() {
  const { people } = useDomainData();
  const go = useNavStore((s) => s.go);
  const su = useSelfUploadStore();
  const createSelfUpload = useCreateSelfUpload();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selP = people.find((p) => p.id === su.selPerson);
  const wantImages = su.uploadType === 'images';
  const wantReport = su.uploadType === 'report';
  const isLink = su.src === 'link';
  const contentsLabel = wantReport ? 'Report only' : 'Images only';
  const srcLabel = su.src === 'cd' ? 'CD / DVD' : isLink ? 'a direct PACS link' : 'computer folder';
  const acceptDesc = wantReport ? 'the report file (PDF, JPG, or JPEG)' : 'all DICOM images';

  const step1Disabled = !su.selPerson || su.desc.trim().length <= 2;
  const linkReady = su.linkUrl.trim().length > 4;

  const startUpload = () => {
    su.patch({ uploading: true });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(
      () => {
        const dateLabel = su.when.trim() || todayLabel();
        const newStudy: Study = {
          id: `su-${Date.now()}`,
          tag: 'OTH',
          name: su.desc.trim() || 'Uploaded study',
          place: 'Self-uploaded',
          date: dateLabel,
          status: 'ready',
          reportStatus: wantReport ? 'ready' : 'pending',
          patient: selP ? selP.name : '',
          selfUploaded: true,
          hasImages: !wantReport,
          selfNotes: (wantReport ? su.reportNotes : su.notes) || '',
          selfKind: contentsLabel,
        };
        createSelfUpload.mutate(newStudy);
        su.patch({ uploading: false, done: true });
      },
      isLink ? 900 : 2200,
    );
  };

  return (
    <div className="su-wrap">
      <div className="su-page">
        {!su.done && !su.uploading && (
          <>
            <button className="backbtn" onClick={() => go('home')}>
              <Icon name="chevronLeft" />
              Back to home
            </button>
            <div className="pagehd" style={{ marginTop: 14 }}>
              <div>
                <div className="kicker">Self upload</div>
                <div className="h1 serif" style={{ fontSize: 26 }}>
                  Add your own images or reports
                </div>
              </div>
            </div>
          </>
        )}

        {su.done && (
          <div className="su-card su-done">
            <div className="su-done-ic">
              <Icon name="check" sw={2.2} />
            </div>
            <h2 className="serif">
              {isLink
                ? wantReport
                  ? 'Report link saved'
                  : 'Link saved'
                : wantReport
                  ? 'Report uploaded'
                  : 'Study uploaded'}
            </h2>
            <p>
              {isLink
                ? "Your imaging center's viewer link is now securely stored in MyRad."
                : wantReport
                  ? 'Your report is now securely stored in MyRad. Open the app to view or share it.'
                  : 'Your images are now securely stored in MyRad. Open the app to view, share or request reports.'}
            </p>
            <div className="su-done-meta">
              {selP ? selP.name : ''} · <span>{su.desc}</span>
              <br />
              {isLink
                ? `Linked via ${su.linkProvider || 'PACS'}`
                : `Uploaded via ${srcLabel} · ${contentsLabel}`}
            </div>
            <div className="su-done-btns">
              <button className="btn btn-primary" onClick={() => su.reset()}>
                + Upload another study
              </button>
              <button className="btn btn-ghost" onClick={() => go('home')}>
                Back to MyRad app
              </button>
            </div>
          </div>
        )}

        {su.uploading && (
          <div className="su-card">
            <h2 className="serif">Uploading…</h2>
            <p>Please keep this window open while your files are being transferred.</p>
            <div className="su-prog">
              <div className="su-prog-lbl">
                <span className="su-spin" />
                Securely transferring your files
              </div>
              <div className="su-prog-bar">
                <i />
              </div>
            </div>
            <div className="help-strip">
              <Icon name="bulb" sw={1.8} />
              <p>
                DICOM files from a CD or DVD can be large — a typical chest CT is 300 MB or more. This
                may take a few minutes.
              </p>
            </div>
            <button
              className="btn btn-ghost"
              style={{ maxWidth: 160, height: 44, marginTop: 16 }}
              onClick={() => {
                if (timer.current) clearTimeout(timer.current);
                su.patch({ uploading: false });
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {!su.done && !su.uploading && su.step === 1 && (
          <div className="su-card">
            <h2 className="serif">{wantReport ? 'Tell us about this report' : 'Tell us about this study'}</h2>
            <p>
              {wantReport
                ? "Choose who it's for, describe the report, then select the file from your computer."
                : "Choose who it's for and give it a short description so you can find it easily later."}
            </p>

            <div className="su-details-grid">
              <div>
                <div className="added-strip-hd">Who is this for?</div>
                <div className="su-person-row">
                  {people.map((p) => (
                    <button
                      key={p.id}
                      className={`su-person-chip ${su.selPerson === p.id ? 'sel' : ''}`}
                      onClick={() => su.patch({ selPerson: p.id })}
                    >
                      <div className="p-av">{p.initials}</div>
                      <div>
                        <div className="su-person-chip-nm">{p.name}</div>
                        <div className="su-person-chip-sub">
                          {p.isSelf ? 'You' : [p.role, p.sex].filter(Boolean).join(' · ')}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="added-strip-hd">What are you uploading?</div>
                <div className="sic-chip-row">
                  <button
                    className={`sic-chip ${wantImages ? 'on' : ''}`}
                    onClick={() => su.patch({ uploadType: 'images' })}
                  >
                    <Icon name="check" sw={3} />
                    Images
                  </button>
                  <button
                    className={`sic-chip ${wantReport ? 'on' : ''}`}
                    onClick={() => su.patch({ uploadType: 'report', src: su.src === 'cd' ? 'folder' : su.src })}
                  >
                    <Icon name="check" sw={3} />
                    Report
                  </button>
                </div>
                <div className="field">
                  <label>{wantReport ? 'Report name or description' : 'Study name or description'}</label>
                  <input
                    className="inp"
                    placeholder={wantReport ? 'e.g. Bloodwork Results — June 2026' : 'e.g. MRI Brain — May 2026'}
                    value={su.desc}
                    onChange={(e) => su.patch({ desc: e.target.value })}
                  />
                </div>
                {wantImages && (
                  <>
                    <div className="field">
                      <label>When was this study done? (optional)</label>
                      <input
                        className="inp"
                        placeholder="e.g. June 2026 or about a year ago"
                        value={su.when}
                        onChange={(e) => su.patch({ when: e.target.value })}
                      />
                    </div>
                    <div className="field" style={{ marginBottom: 0 }}>
                      <label>Any notes? (optional)</label>
                      <textarea
                        className="inp"
                        style={{ height: 80, padding: '14px 16px', resize: 'none' }}
                        placeholder="e.g. Right knee follow-up for Dr. Smith"
                        value={su.notes}
                        onChange={(e) => su.patch({ notes: e.target.value })}
                      />
                    </div>
                  </>
                )}
                {wantReport && (
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label>Purpose &amp; notes (optional)</label>
                    <textarea
                      className="inp"
                      style={{ height: 80, padding: '14px 16px', resize: 'none' }}
                      placeholder="e.g. Follow-up bloodwork results for Dr. Smith, done around June 2026"
                      value={su.reportNotes}
                      onChange={(e) => su.patch({ reportNotes: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>

            {wantReport && (
              <>
                <div className="su-isteps" style={{ marginTop: 8 }}>
                  <div className="su-istep">
                    <span className="su-istep-n">1</span>
                    <div className="su-istep-bd">
                      Locate the report file on your computer or laptop — usually a <b>PDF</b>, <b>JPG</b>,
                      or <b>JPEG</b> from your provider&apos;s patient portal or email
                    </div>
                  </div>
                  <div className="su-istep">
                    <span className="su-istep-n">2</span>
                    <div className="su-istep-bd">
                      Click <b>Select report file</b> below and choose that single file
                    </div>
                  </div>
                </div>
                <div className="help-strip" style={{ marginTop: 14 }}>
                  <Icon name="bulb" sw={1.8} />
                  <p>
                    Only a report file (PDF, JPG, or JPEG) is uploaded. Personal photos and unrelated
                    files are automatically ignored.
                  </p>
                </div>
              </>
            )}

            <div className="su-btnrow">
              {wantImages && (
                <button className="btn btn-primary" disabled={step1Disabled} onClick={() => su.patch({ step: 3 })}>
                  Continue →
                </button>
              )}
              {wantReport && (
                <button className="btn btn-primary" disabled={step1Disabled} onClick={startUpload}>
                  Select report file
                </button>
              )}
            </div>
          </div>
        )}

        {!su.done && !su.uploading && su.step === 3 && (
          <div className="su-card">
            <h2 className="serif">{wantReport ? 'How will you upload the report?' : 'How will you upload the images?'}</h2>
            <p>
              {wantReport
                ? 'Choose where your report file (PDF, JPG, or JPEG) is. Instructions appear below based on your choice.'
                : 'Choose where your imaging files are. Instructions appear below based on your choice.'}
            </p>

            <div className="su-src-tabs">
              {wantImages && (
                <button
                  className={`su-src-tab ${su.src === 'cd' ? 'sel' : ''}`}
                  onClick={() => su.patch({ src: 'cd' })}
                >
                  <Icon name="disc" sw={1.7} />
                  <span className="su-src-lbl">CD or DVD</span>
                  <span className="su-src-sub">From a disc</span>
                </button>
              )}
              <button
                className={`su-src-tab ${su.src === 'folder' ? 'sel' : ''}`}
                onClick={() => su.patch({ src: 'folder' })}
              >
                <Icon name="folder" sw={1.7} />
                <span className="su-src-lbl">{wantReport ? 'Computer file' : 'Computer folder'}</span>
                <span className="su-src-sub">Already downloaded</span>
              </button>
              <button
                className={`su-src-tab ${isLink ? 'sel' : ''}`}
                onClick={() => su.patch({ src: 'link' })}
              >
                <Icon name="link" sw={1.7} />
                <span className="su-src-lbl">I have a link</span>
                <span className="su-src-sub">From imaging center</span>
              </button>
            </div>

            {su.src === 'cd' && (
              <div className="su-isteps">
                <IStep n={1}>Insert your <b>CD or DVD</b> into the disc drive on your computer and wait for it to open</IStep>
                <IStep n={2}>
                  Open the disc and find the folder named <b>DICOM</b>, <b>IMAGES</b>, or the imaging center&apos;s name
                  <span className="su-istep-note">It may also be named with your name or a date.</span>
                </IStep>
                <IStep n={3}>Click <b>Select disc folder</b> below, navigate to the disc, and choose that folder</IStep>
                <IStep n={4}>
                  MyRad will automatically find and upload {acceptDesc} inside
                  <span className="su-istep-note">No disc drive? A USB CD/DVD reader costs ~$20 at any electronics store.</span>
                </IStep>
              </div>
            )}

            {su.src === 'folder' && (
              <div className="su-isteps">
                {wantImages ? (
                  <>
                    <IStep n={1}>
                      Locate the study folder on your computer — usually named <b>DICOM</b>, <b>IMAGES</b>, or the study type
                      <span className="su-istep-note">If you downloaded a ZIP, unzip it first.</span>
                    </IStep>
                    <IStep n={2}>Click <b>Select folder</b> below, navigate to that folder, and select it</IStep>
                    <IStep n={3}>MyRad will scan the folder and upload {acceptDesc} automatically</IStep>
                  </>
                ) : (
                  <>
                    <IStep n={1}>
                      Locate the report file on your computer — usually a <b>PDF</b>, <b>JPG</b>, or <b>JPEG</b> from your provider&apos;s patient portal or email
                    </IStep>
                    <IStep n={2}>Click <b>Select report file</b> below and choose that single file</IStep>
                    <IStep n={3}>MyRad will attach it to this study as the radiology report</IStep>
                  </>
                )}
              </div>
            )}

            {isLink && (
              <>
                <div className="field">
                  <label>{wantReport ? 'Report / patient portal link' : 'PACS viewer link'}</label>
                  <input
                    className="inp"
                    placeholder={wantReport ? 'https://portal.yourcenter.com/report/...' : 'https://yourcenter-pacs.com/view/...'}
                    value={su.linkUrl}
                    onChange={(e) => su.patch({ linkUrl: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Imaging center&apos;s PACS system (optional)</label>
                  <input
                    className="inp"
                    placeholder="e.g. Sectra, Ambra, PowerScribe"
                    value={su.linkProvider}
                    onChange={(e) => su.patch({ linkProvider: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Link expires on (optional)</label>
                  <div className="datepick">
                    <input
                      className="inp"
                      type="date"
                      value={su.linkExpiry}
                      onChange={(e) => su.patch({ linkExpiry: e.target.value })}
                    />
                    <span className={`datepick-txt ${su.linkExpiry ? '' : 'ph'}`}>
                      {fmtMDY(su.linkExpiry) || 'MM/DD/YYYY'}
                    </span>
                  </div>
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label>Access note (optional)</label>
                  <textarea
                    className="inp"
                    style={{ height: 80, padding: '14px 16px', resize: 'none' }}
                    placeholder="e.g. Login with your date of birth when prompted"
                    value={su.linkNote}
                    onChange={(e) => su.patch({ linkNote: e.target.value })}
                  />
                </div>
                <div className="help-strip" style={{ marginTop: 16 }}>
                  <Icon name="link" sw={1.8} />
                  <p>
                    MyRad stores this link securely — when you or your doctor open this study, you&apos;ll
                    go straight into your imaging center&apos;s own viewer.
                  </p>
                </div>
              </>
            )}

            {!isLink && (
              <div className="help-strip" style={{ marginTop: 16 }}>
                <Icon name="bulb" sw={1.8} />
                <p>
                  {wantReport
                    ? 'Only a report file (PDF, JPG, or JPEG) is uploaded from the selected folder. Personal photos and unrelated files are automatically ignored.'
                    : 'Only DICOM image files are uploaded from the selected folder. Personal photos and unrelated files are automatically ignored.'}
                </p>
              </div>
            )}

            <div className="su-btnrow">
              <button className="btn btn-ghost" onClick={() => su.patch({ step: 1 })}>
                Back
              </button>
              <button
                className="btn btn-primary"
                disabled={isLink && !linkReady}
                onClick={startUpload}
              >
                {isLink
                  ? wantReport
                    ? 'Save report link'
                    : 'Save PACS link'
                  : su.src === 'cd'
                    ? 'Select disc folder'
                    : wantReport
                      ? 'Select report file'
                      : 'Select folder from computer'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function IStep({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="su-istep">
      <span className="su-istep-n">{n}</span>
      <div className="su-istep-bd">{children}</div>
    </div>
  );
}
