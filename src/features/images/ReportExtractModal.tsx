import { Icon } from '@/components/common/Icon';
import { fmtLong } from '@/utils/format';
import type { IReportUploadExtractResponse } from '@/redux/myfiles/types/response';

interface ReportExtractModalProps {
  open: boolean;
  data: IReportUploadExtractResponse[number] | null;
  loading: boolean;
  onUpload: () => void;
  onCancel: () => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, padding: '7px 0', borderTop: '1px solid var(--line, #e5e7eb)' }}>
      <span style={{ fontSize: 12.5, color: 'var(--ink2)' }}>{label}</span>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: value ? 'var(--ink)' : 'var(--ink3, #9ca3af)' }}>{value || '—'}</span>
    </div>
  );
}

/**
 * Confirmation sheet shown after a report file is parsed by the extract API.
 * Styled with this app's own overlay classes (getsheet-*), not MUI.
 */
export function ReportExtractModal({ open, data, loading, onUpload, onCancel }: ReportExtractModalProps) {
  if (!open) return null;

  return (
    <div className="getsheet-scrim" onClick={loading ? undefined : onCancel}>
      <div className="getsheet-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="det-hd2">
          <div className="study-ico">
            <Icon name="doc" sw={1.8} />
          </div>
          <div>
            <h3 className="serif" style={{ margin: 0, fontSize: 19 }}>
              Report details extracted
            </h3>
            <p style={{ margin: '2px 0 0', color: 'var(--ink2)', fontSize: 13.5 }}>
              Review the details read from your report before uploading.
            </p>
          </div>
        </div>

        <div className="note-box" style={{ margin: '14px 0' }}>
          <div className="nb-lbl">Report details</div>
          <div>
            <Row label="Patient name" value={data?.patientName ?? ''} />
            <Row label="MRN" value={data?.mrn ?? ''} />
            <Row label="DOB" value={data?.dob ? fmtLong(data.dob) : ''} />
            <Row label="Gender" value={data?.gender ?? ''} />
            <Row label="Age" value={data?.age ?? ''} />
          </div>
        </div>

        {data?.summary && (
          <div className="help-strip" style={{ marginBottom: 14, alignItems: 'flex-start' }}>
            <Icon name="doc" sw={1.8} />
            <div>
              <div className="nb-lbl" style={{ marginBottom: 4 }}>Report summary</div>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{data.summary}</p>
            </div>
          </div>
        )}

        <div className="dstudy-acts" style={{ border: 'none', marginTop: 4, paddingTop: 0, justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn btn-ghost" style={{ maxWidth: 120 }} onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary" style={{ maxWidth: 160 }} onClick={onUpload} disabled={loading}>
            {loading ? (
              <>
                <span className="su-spin" />
                Uploading…
              </>
            ) : (
              'Upload'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportExtractModal;
