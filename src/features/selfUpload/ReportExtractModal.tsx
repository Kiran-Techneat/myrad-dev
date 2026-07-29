import { Icon } from '@/components/common/Icon';
import { fmtMDY } from '@/utils/format';
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
    <div className="sc-row re-row">
      <span className="re-row-lbl">{label}</span>
      <span className={`re-row-val ${value ? '' : 'ph'}`}>{value || '—'}</span>
    </div>
  );
}

const fmtDob = (v?: string) => (v ? fmtMDY(v) || v : '');

export function ReportExtractModal({ open, data, loading, onUpload, onCancel }: ReportExtractModalProps) {
  if (!open) return null;

  return (
    <div className="getsheet-scrim" onClick={loading ? undefined : onCancel}>
      <div className="getsheet-card re-card" onClick={(e) => e.stopPropagation()}>
        <div className="re-head">
          <div className="re-head-ic">
            <Icon name="doc" sw={1.9} />
          </div>
          <div>
            <h3 className="serif" style={{ marginBottom: 2 }}>Report details extracted</h3>
            <p style={{ margin: 0 }}>Review the details read from your report before uploading.</p>
          </div>
        </div>

        <div className="sc-block">
          <div className="sc-block-hd">Report details</div>
          <Row label="Patient name" value={data?.patientName ?? ''} />
          <Row label="MRN" value={data?.mrn ?? ''} />
          <Row label="DOB" value={fmtDob(data?.dob)} />
          <Row label="Gender" value={data?.gender ?? ''} />
          <Row label="Age" value={data?.age ?? ''} />
        </div>

        {data?.summary && (
          <div className="re-summary">
            <div className="sc-block-hd">Report summary</div>
            <p>{data.summary}</p>
          </div>
        )}

        <div className="af-btns">
          <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={onUpload} disabled={loading}>
            {loading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}
