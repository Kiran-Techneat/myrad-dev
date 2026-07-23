import type { ChangeEvent } from 'react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Icon } from '@/components/common/Icon';
import { StudyIcon } from '@/components/common/StudyIcon';
import { useDomainData } from '@/hooks/useDomainData';
import { useNavStore } from '@/store/dashboard/navStore';
import { useAppNavigate } from '@/hooks/useAppNavigate';
import { useDialogStore } from '@/store/dashboard/dialogStore';
import { useShareStore } from '@/store/dashboard/shareStore';
import { useUpdateRequestItems } from '@/hooks/mutations';
import { statusMeta } from '@/utils/status';
import type { ImagingRequest, RequestItem } from '@/types';
import styles from './requestDetail.module.scss';

const ALLOWED_EXTS = ['pdf', 'jpg', 'jpeg', 'png'];

export function RequestDetailScreen() {
  const { requests, centers } = useDomainData();
  const { id } = useParams();
  const nav = useAppNavigate();
  const setSelectedReqId = useNavStore((s) => s.setSelectedReqId);
  const dialog = useDialogStore();
  const openShare = useShareStore((s) => s.openShare);
  const updateItems = useUpdateRequestItems();

  // Keep the store in sync with the URL so the Notify preview resolves this request
  // even when the detail page was reached via a direct deep link.
  useEffect(() => {
    setSelectedReqId(id ?? null);
  }, [id, setSelectedReqId]);

  const selReq: ImagingRequest = requests.find((r) => r.id === id) ?? requests[1];
  const meta = statusMeta(selReq.status);
  const center = centers.find((c) => c.name === selReq.center);
  const centerAddr = selReq.centerAddr || center?.address || '';
  const centerPhone = selReq.centerPhone || center?.phone || '';
  const centerEmail = selReq.centerEmail || center?.email || '';
  const centerFax = selReq.centerFax || center?.fax || '';

  const setItems = (items: RequestItem[]) => updateItems.mutate({ id: selReq.id, items });

  const cancelItem = (idx: number) => {
    const items = selReq.items.map((it, i) =>
      i === idx && it.status === 'pending' ? { ...it, status: 'cancelled' as const } : it,
    );
    setItems(items);
  };
  const cancelPending = () => {
    const items = selReq.items.map((it) =>
      it.status === 'pending' ? { ...it, status: 'cancelled' as const } : it,
    );
    setItems(items);
  };

  const canShare = selReq.items.some((it) => it.status === 'ready');
  const canCancel = selReq.items.some((it) => it.status === 'pending');
  const pendingCount = selReq.items.filter((it) => it.status === 'pending').length;
  const allPending = pendingCount === selReq.items.length;
  const cancelLabel = allPending
    ? 'Cancel this request'
    : `Cancel ${pendingCount} pending ${pendingCount === 1 ? 'study' : 'studies'}`;

  const onReportFile = (key: string) => (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) {
      dialog.showNotice('Unsupported file', 'Please choose a PDF, JPG, or PNG file.');
      return;
    }
    dialog.setReportUpload(key, file.name);
  };

  return (
    <div className="wrap">
      <button className="backbtn" onClick={() => nav.go('requests')}>
        <Icon name="chevronLeft" />
        Back to requests
      </button>

      <div className={styles["det-hero"]}>
        <div className={styles["det-hero-top"]}>
          <h2 className="serif">{selReq.center}</h2>
          <span className={`chip ${meta.cls}`}>{meta.label}</span>
        </div>
        <div className="cb-addr" style={{ marginBottom: 0 }}>
          {centerAddr}
        </div>
        <div className="cb-contacts2">
          {centerPhone && (
            <span className="cb-c">
              <Icon name="phone" sw={1.8} />
              {centerPhone}
            </span>
          )}
          {centerEmail && (
            <span className="cb-c">
              <Icon name="mail" sw={1.8} />
              {centerEmail}
            </span>
          )}
          {centerFax && (
            <span className="cb-c">
              <Icon name="fax" sw={1.8} />
              {centerFax}
            </span>
          )}
        </div>
        <div className={styles["det-meta"]}>
          <span>
            <span className="k">Patient</span> <span className="v">{selReq.patient}</span>
          </span>
          <span>
            <span className="k">Requested</span> <span className="v">{selReq.date}</span>
          </span>
          <span>
            <span className="k">Request ID</span> <span className="v">{selReq.id}</span>
          </span>
          <span>
            <span className="k">Delivered via</span> <span className="v">{selReq.delivery}</span>
          </span>
        </div>
      </div>

      <div className="sec-hd">
        <h4>Studies requested ({selReq.items.length})</h4>
      </div>

      {selReq.items.map((it, idx) => {
        const cancelled = it.status === 'cancelled';
        const ready = !cancelled && it.status === 'ready';
        const m = statusMeta(it.status);
        const typeOnly =
          it.dateLabel && it.label.endsWith(` · ${it.dateLabel}`)
            ? it.label.slice(0, -` · ${it.dateLabel}`.length)
            : it.label;
        const key = `reqitem-${selReq.id}-${idx}`;
        const uploadedName = dialog.reportUploads[key];

        return (
          <div key={idx} className="dstudy">
            <div className={styles["dstudy-top"]}>
              <div className="study-ico">
                <StudyIcon tag={it.tag} />
              </div>
              <div className="study-bd">
                <div className="study-nm">
                  {typeOnly}
                  {it.dateLabel && (
                    <span className={styles["study-period-box"]}>
                      <span className={styles["sp-lbl"]}>Period</span>
                      {it.dateLabel}
                    </span>
                  )}
                </div>
              </div>
              <span className={`chip ${m.cls}`}>{m.label}</span>
            </div>

            {!cancelled && ready && (
              <div className="dstudy-acts">
                <button className="mini prim" onClick={() => nav.openViewer({ from: 'requestDetail' })}>
                  <Icon name="eye" />
                  View images
                </button>
                <button className="mini">
                  <Icon name="clipboard" />
                  Report
                </button>
              </div>
            )}

            {!cancelled && !ready && (
              <>
                {it.notFound && (
                  <div
                    className="note-box"
                    style={{ background: 'var(--gold-t)', borderColor: '#E7DBBF', marginBottom: 10 }}
                  >
                    <div className="nb-lbl" style={{ color: '#8A6D2F' }}>
                      Note from {selReq.center}
                    </div>
                    <div className="nb-txt">{it.centerNote}</div>
                  </div>
                )}
                <div className={styles.awaiting}>
                  <Icon name="clock" sw={1.8} />
                  Waiting on the center to send images &amp; report
                </div>
                <div className="dstudy-acts" style={{ border: 'none', marginTop: 0, paddingTop: 0 }}>
                  <button
                    className="mini prim"
                    style={{ flex: '1 1 100%' }}
                    onClick={() =>
                      dialog.showNotice(
                        'Reminder sent',
                        `${selReq.center} has been notified and will follow up on the images and report for this request.`,
                      )
                    }
                  >
                    <Icon name="send" sw={1.8} />
                    Remind the center — images &amp; report
                  </button>
                </div>
                {it.status === 'pending' && (
                  <button
                    className="imsel-link"
                    style={{ color: 'var(--rose)', marginTop: 8 }}
                    onClick={() =>
                      dialog.askConfirm({
                        title: 'Cancel this study?',
                        msg: `This will cancel "${it.label}" for this request. The center will be notified and this cannot be undone.`,
                        confirmLabel: 'Cancel study',
                        noticeTitle: 'Study cancelled',
                        noticeMsg: `"${it.label}" has been cancelled and ${selReq.center} has been notified.`,
                        run: () => cancelItem(idx),
                      })
                    }
                  >
                    Cancel this study
                  </button>
                )}
                <div className={styles["await-or"]}>
                  <span>or</span>
                </div>
                <div className="dstudy-acts" style={{ border: 'none', marginTop: 0, paddingTop: 0 }}>
                  {!uploadedName ? (
                    <label className="mini" style={{ cursor: 'pointer', flex: '1 1 100%' }}>
                      <Icon name="upload" sw={1.8} />
                      I already have the report — upload it myself
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                        style={{ display: 'none' }}
                        onChange={onReportFile(key)}
                      />
                    </label>
                  ) : (
                    <span
                      className="mini"
                      style={{ background: 'var(--accent-t)', color: 'var(--accent-d)', borderColor: '#CFE0DA', cursor: 'default', flex: '1 1 100%' }}
                    >
                      <Icon name="check" sw={2.4} />
                      {uploadedName}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}

      <div className={styles["det-acts"]}>
        {canShare && (
          <button
            className="btn btn-primary btn-share"
            onClick={() =>
              openShare({
                studyName: `${selReq.center} request`,
                meta: [selReq.patient, selReq.date].filter(Boolean).join(' · '),
                items: selReq.items
                  .filter((it) => it.status === 'ready')
                  .map((it) => ({
                    id: `${selReq.id}-${it.label}`,
                    name: it.label,
                    patient: selReq.patient,
                    images: true,
                    report: true,
                    reportAvailable: true,
                  })),
              })
            }
          >
            <Icon name="share" sw={1.8} />
            Share with Healthcare Provider, Family or Friend
          </button>
        )}
        <button
          className="btn btn-ghost"
          onClick={() => nav.openNotify({ kind: 'request', from: 'requestDetail' })}
        >
          <Icon name="mail" sw={1.8} />
          See what the center receives
        </button>
        {canCancel && (
          <button
            className="btn btn-danger"
            onClick={() =>
              dialog.askConfirm({
                title: allPending ? 'Cancel this request?' : 'Cancel pending studies?',
                msg:
                  (allPending
                    ? `This will cancel the entire request with ${selReq.center}.`
                    : `This will cancel the ${pendingCount} study still pending with ${selReq.center}; studies already fulfilled will not be affected.`) +
                  ' This cannot be undone.',
                confirmLabel: allPending ? 'Cancel request' : 'Cancel pending',
                noticeTitle: allPending ? 'Request cancelled' : 'Studies cancelled',
                noticeMsg: `${allPending ? 'This request has' : 'The pending studies have'} been cancelled and ${selReq.center} has been notified.`,
                run: cancelPending,
              })
            }
          >
            {cancelLabel}
          </button>
        )}
      </div>
    </div>
  );
}
