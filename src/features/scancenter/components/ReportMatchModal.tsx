import { Icon } from '@/components/common/Icon'
import dayjs from 'dayjs'
import { DATE_DISPLAY_FORMAT } from '@/utils/dateFormats'
import type { ReportExtractRecord, ReportPatientRecord } from '../utils/Index'

interface ReportMatchModalProps {
    open: boolean
    extracted: (ReportExtractRecord & { summary?: string }) | null
    patient: ReportPatientRecord | null
    onUpload: () => void
    onClose: () => void
}

const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="sc-cmp-row" style={{ gridTemplateColumns: '120px 1fr' }}>
        <span className="k">{label}</span>
        <span className="exp">{value || '—'}</span>
    </div>
)

const fmtDob = (v?: string) => {
    const d = dayjs(v ?? '')
    return d.isValid() ? d.format(DATE_DISPLAY_FORMAT) : (v ?? '')
}

const ReportMatchModal = ({ open, extracted, onUpload, onClose }: ReportMatchModalProps) => {
    if (!open) return null
    return (
        <div className="getsheet-scrim" onClick={onClose}>
            <div className="getsheet-card" onClick={(e) => e.stopPropagation()}>
                <div className="sc-mhd ok">
                    <Icon name="checkCircle" sw={2} className="sc-mhd-ic" />
                    <div>
                        <h3 className="serif">Report Data Verified</h3>
                        <p>The report details match the patient record.</p>
                    </div>
                </div>

                <div className="sc-cmp ok">
                    <p className="sc-cmp-title">Report Details</p>
                    <Row label="Patient Name" value={extracted?.patientName ?? ''} />
                    <Row label="MRN" value={extracted?.mrn ?? ''} />
                    <Row label="DOB" value={fmtDob(extracted?.dob)} />
                    <Row label="Gender" value={extracted?.gender ?? ''} />
                </div>

                {extracted?.summary && (
                    <div className="sc-summary">
                        <h5>Report Summary</h5>
                        <p>{extracted.summary}</p>
                    </div>
                )}

                <div className="af-btns">
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={onUpload}>Upload Report</button>
                </div>
            </div>
        </div>
    )
}

export default ReportMatchModal
