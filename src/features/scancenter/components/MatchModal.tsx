import { Icon } from '@/components/common/Icon'
import type { DicomMeta } from '../types/Index'
import { expandModalityCode } from '../utils/Index'

interface ScanItem {
    scanType: string
    bodyPoint: string
}

interface MatchModalProps {
    open: boolean
    meta: DicomMeta | null
    patientName: string
    patientId: string
    patientAge: number
    patientGender: string
    scanItem: ScanItem | null
    totalFiles: number
    verified?: boolean
    onUpload: () => void
    onClose: () => void
}

const Cell = ({ label, value }: { label: string; value: string }) => (
    <div className="sc-cmp-cell">
        <span className="k">{label}</span>
        <span className="v">{value || '—'}</span>
    </div>
)

const MatchModal = ({
    open, meta, patientName, patientId, patientAge, patientGender, scanItem, totalFiles, verified = true, onUpload, onClose,
}: MatchModalProps) => {
    if (!open) return null

    const dicomFields = meta ? [
        { label: 'Patient Name (DICOM)', value: meta.patientName },
        { label: 'Patient ID (DICOM)', value: meta.patientId },
        { label: 'Modality', value: expandModalityCode(meta.modality) },
        { label: 'Body Part (DICOM)', value: meta.bodyPart },
        { label: 'Study Date', value: meta.studyDate },
        { label: 'Study Description', value: meta.studyDescription },
        { label: 'Institution', value: meta.institutionName },
        { label: 'Manufacturer', value: meta.manufacturer },
    ].filter(f => f.value.trim() !== '') : []

    return (
        <div className="getsheet-scrim" onClick={onClose}>
            <div className="getsheet-card" onClick={(e) => e.stopPropagation()}>
                <div className={`sc-mhd ${verified ? 'ok' : 'warn'}`}>
                    <Icon name={verified ? 'checkCircle' : 'alert'} sw={2} className="sc-mhd-ic" />
                    <div>
                        <h3 className="serif">{verified ? 'Patient Data Verified' : 'Cannot Verify Patient Data'}</h3>
                        <p>{verified
                            ? 'DICOM metadata matches the patient record.'
                            : 'No DICOM patient metadata was found in the uploaded files.'}</p>
                    </div>
                </div>

                <div className="sc-cmp ok">
                    <p className="sc-cmp-title">Patient Record</p>
                    <div className="sc-cmp-grid">
                        <Cell label="Name" value={patientName} />
                        <Cell label="Patient ID" value={patientId} />
                        <Cell label="Age" value={patientAge ? String(patientAge) : ''} />
                        <Cell label="Gender" value={patientGender} />
                        {scanItem && (
                            <>
                                <Cell label="Scan Type" value={scanItem.scanType} />
                                <Cell label="Body Part" value={scanItem.bodyPoint} />
                            </>
                        )}
                    </div>
                </div>

                {dicomFields.length > 0 && (
                    <div className="sc-cmp neutral">
                        <p className="sc-cmp-title">DICOM Metadata</p>
                        <div className="sc-cmp-grid">
                            {dicomFields.map(({ label, value }) => (
                                <Cell key={label} label={label} value={value} />
                            ))}
                        </div>
                    </div>
                )}

                <p className="sc-files-ready">{totalFiles} file{totalFiles !== 1 ? 's' : ''} ready to upload.</p>

                <div className="af-btns">
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={onUpload}>Upload Files</button>
                </div>
            </div>
        </div>
    )
}

export default MatchModal
