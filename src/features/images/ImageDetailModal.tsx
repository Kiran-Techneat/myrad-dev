import type { ChangeEvent } from 'react';
import { Icon } from '@/components/common/Icon';
import { useDomainData } from '@/hooks/useDomainData';
import { useDialogStore } from '@/store/dialogStore';
import { useNavStore } from '@/store/navStore';
import { useOpenShare } from '@/features/share/useOpenShare';
import { usePatchSelfUpload } from '@/hooks/mutations';

const ALLOWED_EXTS = ['pdf', 'jpg', 'jpeg', 'png'];

export function ImageDetailModal() {
  const { allStudies } = useDomainData();
  const {
    imgDetailOpen,
    imgDetailId,
    closeImgDetail,
    reportUploads,
    reminderSentIds,
    setReportUpload,
    markReminderSent,
    showNotice,
  } = useDialogStore();
  const nav = useNavStore();
  const { openShare } = useOpenShare();
  const patchSelfUpload = usePatchSelfUpload();

  if (!imgDetailOpen) return null;
  const st = allStudies.find((x) => x.id === imgDetailId);
  if (!st) return null;

  const repReady = st.reportStatus === 'ready';
  const reminded = !!reminderSentIds[String(st.id)];
  const uploadedName = reportUploads[`img-${st.id}`];
  const needsImages = !!st.selfUploaded && st.hasImages === false;

  const onReportFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) {
      showNotice('Unsupported file', 'Please choose a PDF, JPG, or PNG file.');
      return;
    }
    setReportUpload(`img-${st.id}`, file.name);
  };

  const attachImages = () => {
    patchSelfUpload.mutate({ id: st.id, patch: { hasImages: true } });
    showNotice('Images attached', 'Your DICOM images have been linked to this report.');
  };

  const share = () => {
    const hasImg = st.hasImages !== false;
    closeImgDetail();
    openShare({
      studyName: st.name,
      meta: [st.patient, st.date, st.place].filter(Boolean).join(' · '),
      items: [
        { id: st.id, name: st.name, patient: st.patient, images: hasImg, report: repReady, reportAvailable: repReady },
      ],
    });
  };

  return (
    <div className="getsheet-scrim" onClick={closeImgDetail}>
      <div className="getsheet-card" onClick={(e) => e.stopPropagation()}>
        <div className="det-hd2">
          <div className="study-ico">{st.tag}</div>
          <div>
            <h3 className="serif" style={{ margin: 0, fontSize: 19 }}>
              {st.name}
            </h3>
            <p style={{ margin: '2px 0 0', color: 'var(--ink2)', fontSize: 13.5 }}>
              {(st.patient || 'John Doe') + ' · ' + st.date}
            </p>
          </div>
        </div>

        {st.selfUploaded && (
          <div className="note-box" style={{ margin: '14px 0' }}>
            <div className="nb-lbl">Self-uploaded by you</div>
            {st.selfNotes && <div className="nb-txt">{st.selfNotes}</div>}
          </div>
        )}

        {needsImages && (
          <>
            <div className="help-strip" style={{ marginBottom: 14 }}>
              <Icon name="bulb" sw={1.8} />
              <p>
                No DICOM images are linked to this report yet. Add them later so this report and its
                images stay together as one study.
              </p>
            </div>
            <label className="mini prim" style={{ cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
              <Icon name="upload" sw={1.8} />
              Attach DICOM images
              <input type="file" style={{ display: 'none' }} onChange={attachImages} />
            </label>
          </>
        )}

        <div className="rep-card">
          <div className="rep-card-top">
            <div className="rep-card-ic">
              <Icon name="doc" sw={1.8} />
            </div>
            <div className="rep-card-bd">
              <div className="rep-card-lbl">Radiology report</div>
              <div className="rep-card-sub">From {st.place}</div>
            </div>
            <span className={`chip ${repReady ? 'ready' : 'pending'}`}>
              {repReady ? 'Report available' : 'Report pending'}
            </span>
          </div>

          {repReady ? (
            <div className="dstudy-acts" style={{ border: 'none', marginTop: 14, paddingTop: 0 }}>
              <button
                className="mini prim"
                onClick={() => {
                  closeImgDetail();
                  nav.openViewer({ from: 'images', studyId: st.id, tab: 'report' });
                }}
              >
                <Icon name="eye" sw={1.8} />
                View report
              </button>
            </div>
          ) : (
            <>
              {!st.selfUploaded ? (
                <p className="rep-note">
                  The imaging center hasn&apos;t uploaded this report yet. You can upload your own copy,
                  or nudge the center for an update.
                </p>
              ) : (
                <p className="rep-note">
                  No report has been added for this self-uploaded study yet. Upload one whenever you
                  have it.
                </p>
              )}
              <div className="dstudy-acts" style={{ border: 'none', marginTop: 12, paddingTop: 0 }}>
                {!uploadedName ? (
                  <label className="mini prim" style={{ cursor: 'pointer' }}>
                    <Icon name="upload" sw={1.8} />
                    Upload report
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      style={{ display: 'none' }}
                      onChange={onReportFile}
                    />
                  </label>
                ) : (
                  <span
                    className="mini"
                    style={{ background: 'var(--accent-t)', color: 'var(--accent-d)', borderColor: '#CFE0DA', cursor: 'default' }}
                  >
                    <Icon name="check" sw={2.4} />
                    {uploadedName}
                  </span>
                )}
                {!st.selfUploaded && (
                  <button
                    className={`mini ${reminded ? 'sent' : ''}`}
                    onClick={() => markReminderSent(st.id)}
                  >
                    <Icon name="send" sw={1.8} />
                    {reminded ? 'Reminder sent ✓' : 'Remind the center about the report'}
                  </button>
                )}
              </div>
              <p className="rep-hint">Accepted formats: PDF, JPG, PNG</p>
            </>
          )}
        </div>

        <button className="btn btn-ghost btn-block btn-share" style={{ marginTop: 16 }} onClick={share}>
          <Icon name="share" sw={1.8} />
          Share with Healthcare Provider, Family or Friend
        </button>
      </div>
    </div>
  );
}
