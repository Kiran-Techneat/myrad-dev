import { Icon } from '@/components/common/Icon'
import type { DicomMeta } from '../types/Index'
import { expandModalityCode, stripScanWord } from '../utils/Index'

interface ScanItem {
    scanType: string
    bodyPoint: string
}

interface MisMatchModalModalProps {
    open: boolean
    meta: DicomMeta | null
    patientName: string
    patientId: string
    scanItem: ScanItem | null
    totalFiles: number
    onContinue: () => void
    onCancel: () => void
}

const Row = ({
    label, expected, found, normalizeValue,
}: {
    label: string
    expected: string
    found: string | undefined
    normalizeValue?: (v: string) => string
}) => {
    const foundVal = found?.trim() || ''
    const norm = normalizeValue ?? ((v: string) => v)
    const matches = foundVal !== '' && norm(foundVal).toLowerCase() === norm(expected).toLowerCase()
    return (
        <div className="sc-cmp-row">
            <span className="k">{label}</span>
            <span className="exp">{expected || '—'}</span>
            <span className={`found ${matches ? 'match' : 'miss'}`}>{foundVal || '—'}</span>
        </div>
    )
}

const MisMatchModal = ({
    open, meta, patientName, patientId, scanItem, totalFiles, onContinue, onCancel,
}: MisMatchModalModalProps) => {
    if (!open) return null
    return (
        <div className="getsheet-scrim" onClick={onCancel}>
            <div className="getsheet-card" onClick={(e) => e.stopPropagation()}>
                <div className="sc-mhd warn">
                    <Icon name="alert" sw={2} className="sc-mhd-ic" />
                    <div>
                        <h3 className="serif">Patient Data Mismatch</h3>
                        <p>The uploaded study does not match the patient record.</p>
                    </div>
                </div>

                <div className="sc-cmp warn">
                    <div className="sc-cmp-head">
                        <span>Field</span><span>Requested</span><span>In Image/Study</span>
                    </div>
                    <Row label="Patient Name" expected={patientName} found={meta?.patientName} />
                    <Row label="Patient ID" expected={patientId} found={meta?.patientId} />
                    {scanItem && (
                        <>
                            <Row label="Study Type" expected={stripScanWord(scanItem.scanType)} found={meta?.modality} normalizeValue={(v) => expandModalityCode(stripScanWord(v))} />
                            <Row label="Body Part" expected={scanItem.bodyPoint} found={meta?.bodyPart} />
                        </>
                    )}
                </div>

                <p className="sc-files-ready">
                    {totalFiles} file{totalFiles !== 1 ? 's' : ''} selected. Do you want to upload anyway?
                </p>

                <div className="af-btns">
                    <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
                    <button className="btn btn-primary" onClick={onContinue}>Upload Anyway</button>
                </div>
            </div>
        </div>
    )
}

export default MisMatchModal
