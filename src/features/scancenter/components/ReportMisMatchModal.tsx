import { Icon } from '@/components/common/Icon'
import dayjs from 'dayjs'
import { DATE_DISPLAY_FORMAT } from '@/utils/dateFormats'
import { reportFieldMatches } from '../utils/Index'
import type { ReportExtractRecord, ReportPatientRecord } from '../utils/Index'

interface ReportMisMatchModalProps {
    open: boolean
    extracted: (ReportExtractRecord & { summary?: string }) | null
    patient: ReportPatientRecord
    onContinue: () => void
    onCancel: () => void
}

const Row = ({
    label, expected, found, matches,
}: {
    label: string
    expected: string
    found: string
    matches: boolean
}) => (
    <div className="sc-cmp-row">
        <span className="k">{label}</span>
        <span className="exp">{expected || '—'}</span>
        <span className={`found ${matches ? 'match' : 'miss'}`}>{found || '—'}</span>
    </div>
)

const fmtDob = (v?: string) => {
    const d = dayjs(v ?? '')
    return d.isValid() ? d.format(DATE_DISPLAY_FORMAT) : (v ?? '')
}

const ReportMisMatchModal = ({ open, extracted, patient, onContinue, onCancel }: ReportMisMatchModalProps) => {
    if (!open) return null
    const m = reportFieldMatches(extracted ?? {}, patient)
    return (
        <div className="getsheet-scrim" onClick={onCancel}>
            <div className="getsheet-card" onClick={(e) => e.stopPropagation()}>
                <div className="sc-mhd warn">
                    <Icon name="alert" sw={2} className="sc-mhd-ic" />
                    <div>
                        <h3 className="serif">Report Data Mismatch</h3>
                        <p>The uploaded report does not match the patient record.</p>
                    </div>
                </div>

                <div className="sc-cmp warn">
                    <div className="sc-cmp-head">
                        <span>Field</span><span>Patient Record</span><span>In Report</span>
                    </div>
                    <Row label="Patient Name" expected={patient.fullName ?? ''} found={extracted?.patientName ?? ''} matches={m.name} />
                    <Row label="MRN" expected={patient.patientMrnNumber ?? ''} found={extracted?.mrn ?? ''} matches={m.mrn} />
                    <Row label="DOB" expected={fmtDob(patient.dateOfBirth)} found={fmtDob(extracted?.dob)} matches={m.dob} />
                    <Row label="Gender" expected={patient.gender ?? ''} found={extracted?.gender ?? ''} matches={m.gender} />
                </div>

                {extracted?.summary && (
                    <div className="sc-summary">
                        <h5>Report Summary</h5>
                        <p>{extracted.summary}</p>
                    </div>
                )}

                <div className="af-btns">
                    <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
                    <button className="btn btn-primary" onClick={onContinue}>Upload Anyway</button>
                </div>
            </div>
        </div>
    )
}

export default ReportMisMatchModal
