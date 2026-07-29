import { Icon } from '@/components/common/Icon';
import { useDialogStore } from '@/store/dashboard/dialogStore';

/** Full-screen report viewer: renders the study's PDF (`reportModalUrl`) in a full-screen iframe. */
export function ReportModal() {
  const { reportModalOpen, reportModalUrl, closeReportModal } = useDialogStore();

  if (!reportModalOpen) return null;

  const url = reportModalUrl;

  return (
    <div
      className="getsheet-scrim"
      onClick={closeReportModal}
      style={{ padding: 0, alignItems: 'stretch', justifyContent: 'stretch' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--surface, #fff)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: '1px solid var(--line, #e5e7eb)',
            flex: 'none',
          }}
        >
          <h3 className="serif" style={{ margin: 0 }}>
            Report
          </h3>
          <button className="share-item-x" onClick={closeReportModal} aria-label="Close">
            <Icon name="x" sw={2.4} />
          </button>
        </div>

        {url ? (
          <iframe
            src={url}
            title="Report"
            style={{ flex: 1, width: '100%', border: 'none' }}
          />
        ) : (
          <div className="vplaceholder" style={{ flex: 1 }}>
            No report available.
          </div>
        )}
      </div>
    </div>
  );
}
