import { Icon } from '@/components/common/Icon';
import { useDialogStore } from '@/store/dashboard/dialogStore';

export function NoticeModal() {
  const { noticeOpen, noticeTitle, noticeMsg, closeNotice } = useDialogStore();
  if (!noticeOpen) return null;
  return (
    <div className="getsheet-scrim" onClick={closeNotice}>
      <div className="getsheet-card notice-card" onClick={(e) => e.stopPropagation()}>
        <div className="share-confirm-check">
          <Icon name="checkThick" sw={2.5} />
        </div>
        <h3 className="serif" style={{ textAlign: 'center' }}>
          {noticeTitle}
        </h3>
        <p style={{ textAlign: 'center', marginBottom: 0 }}>{noticeMsg}</p>
        <button className="btn btn-primary btn-block" style={{ marginTop: 20 }} onClick={closeNotice}>
          OK
        </button>
      </div>
    </div>
  );
}
