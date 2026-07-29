interface ParsingModalProps {
    open: boolean
}

const ParsingModal = ({ open }: ParsingModalProps) => {
    if (!open) return null
    return (
        <div className="getsheet-scrim">
            <div className="getsheet-card notice-card" onClick={(e) => e.stopPropagation()}>
                <div className="sc-parsing">
                    <span className="su-spin" />
                    <p className="sc-parsing-title">Reading file metadata…</p>
                    <p className="sc-parsing-sub">Checking DICOM data against the patient record.</p>
                </div>
            </div>
        </div>
    )
}

export default ParsingModal
