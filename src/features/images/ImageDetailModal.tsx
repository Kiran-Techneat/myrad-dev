import { useState, type ChangeEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Icon } from '@/components/common/Icon';
import { useMyStudies } from '@/hooks/useMyStudies';
import { useDialogStore } from '@/store/dashboard/dialogStore';
import { useAppNavigate } from '@/hooks/useAppNavigate';
import { useOpenShare } from '@/hooks/useOpenShare';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import {
  deleteScanFile,
  generateReportUploadFile,
  uploadFileDataExtract,
  userUploadReport,
} from '@/redux/myfiles/action';
import { resetUploadExtract } from '@/redux/myfiles/slice';
import type { IUploadFileRequest } from '@/redux/myfiles/types/request';
import { showAlert } from '@/components/common/showAlert';
import { ReportExtractModal } from './ReportExtractModal';

const ALLOWED_EXTS = ['pdf', 'jpg', 'jpeg', 'png'];

export function ImageDetailModal() {
  const { findById, refresh } = useMyStudies();
  const {
    imgDetailOpen,
    imgDetailId,
    closeImgDetail,
    reminderSentIds,
    markReminderSent,
    showNotice,
    askConfirm,
  } = useDialogStore();
  const nav = useAppNavigate();
  const { openShare } = useOpenShare();
  const dispatch = useAppDispatch();
  const reportExtract = useAppSelector((s) => s.myfiles.reportUploadExtractResponse);

  const [pending, setPending] = useState<IUploadFileRequest | null>(null);
  const [processing, setProcessing] = useState(false);
  const [reportUploading, setReportUploading] = useState(false);

  const clearExtract = () => {
    dispatch(resetUploadExtract());
    setPending(null);
    setProcessing(false);
    setReportUploading(false);
  };

  const { mutate: submitReport } = useMutation({
    mutationFn: (payload: IUploadFileRequest & { self: boolean }) =>
      dispatch(payload.self ? generateReportUploadFile(payload) : userUploadReport(payload)).unwrap(),
    onSuccess: () => {
      showAlert({ message: 'Report uploaded successfully', status: 'success', autoClose: 6000 });
      refresh();
    },
    onError: (error: any) => {
      const message = error?.headers?.message || error?.message || 'Something went wrong';
      showAlert({ message, status: 'error', autoClose: 6000 });
    },
    onSettled: clearExtract,
  });

  if (!imgDetailOpen) return null;
  const st = findById(imgDetailId);
  if (!st) return null;

  const repReady = st.reportStatus === 'ready';
  const reminded = !!reminderSentIds[String(st.id)];
  const isSelf = st.uploadSource === 'USER_SELF';
  const needsImages = !!st.selfUploaded && st.hasImages === false;

  const onReportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) {
      showNotice('Unsupported file', 'Please choose a PDF, JPG, or PNG file.');
      return;
    }
    if (!st.linkId || !st.scanItemId) {
      showAlert({ message: 'This study is missing upload references.', status: 'error', autoClose: 6000 });
      return;
    }
    const payload: IUploadFileRequest = { linkId: st.linkId, scanItemId: st.scanItemId, files: [file] };
    setProcessing(true);
    try {
      await dispatch(uploadFileDataExtract(payload)).unwrap();
      setPending(payload);
    } catch (error: any) {
      setProcessing(false);
      const message = error?.headers?.message || error?.message || 'Something went wrong';
      showAlert({ message, status: 'error', autoClose: 6000 });
    }
  };

  const confirmReportUpload = () => {
    if (!pending) return;
    setReportUploading(true);
    submitReport({ ...pending, self: isSelf });
  };

  const removeStudy = () => {
    if (!st.linkId || !st.scanItemId) return;
    askConfirm({
      title: 'Delete this study?',
      msg: isSelf
        ? "Once deleted, it can't be recovered. You will have to re-upload the study."
        : "Once deleted, it can't be recovered. You will have to request again at the imaging center.",
      confirmLabel: 'Delete',
      noticeTitle: 'Study deleted',
      noticeMsg: 'The study has been removed.',
      run: () => {
        closeImgDetail();
        dispatch(deleteScanFile({ linkId: st.linkId!, scanItemId: st.scanItemId! }))
          .unwrap()
          .then(() => refresh())
          .catch((error: any) => {
            const message = error?.headers?.message || error?.message || 'Something went wrong';
            showAlert({ message, status: 'error', autoClose: 6000 });
          });
      },
    });
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
    <>
      <ReportExtractModal
        open={!!reportExtract}
        data={reportExtract?.[0] ?? null}
        loading={reportUploading}
        onUpload={confirmReportUpload}
        onCancel={clearExtract}
      />

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
            <div className="help-strip" style={{ marginBottom: 14 }}>
              <Icon name="bulb" sw={1.8} />
              <p>No DICOM images are linked to this report yet.</p>
            </div>
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
                {!isSelf ? (
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
                  {processing ? (
                    <span className="mini" style={{ cursor: 'default' }}>
                      <span className="su-spin" />
                      Processing…
                    </span>
                  ) : (
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
                  )}
                  {!isSelf && (
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

          <button
            className="btn btn-ghost btn-block"
            style={{ marginTop: 10, color: '#ce2121' }}
            onClick={removeStudy}
          >
            <Icon name="x" sw={2.2} />
            Delete study
          </button>
        </div>
      </div>
    </>
  );
}
