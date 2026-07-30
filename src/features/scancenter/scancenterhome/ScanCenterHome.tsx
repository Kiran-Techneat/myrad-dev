import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Logo from '@/assets/logo.png'
import Loader from '@/components/common/Loader'
import { Icon } from '@/components/common/Icon'
import { fmtLong, initialsFromName } from '@/utils/format'
import { formatUSPhoneNumber } from '@/utils/commonUtils'
import ScanItemUploader from '../components/scanitemuploader/ScanItemUploader'
import ParsingModal from '../components/ParsingModal'
import MatchModal from '../components/MatchModal'
import MismatchModal from '../components/MisMatchModal'
import ResumeUploadModal from '../components/ResumeUploadModal'
import { useUpload } from '../hooks/UseUpload'
import { useScanUiStore } from '../scanUiStore'
import '../scancenter.scss'

const ScanCenterHome = () => {
    const { id } = useParams<{ id: string }>()
    const ui = useScanUiStore()

    const {
        loader, uploadStatus, uploadEntries, dragOver,
        modalMode, pendingModal, cardProgress, fileCounts, scanItemUploadState,
        pausedItems,
        scancenterDetails,
        fileInputRefs, folderInputRefs,
        initValidation,
        reValidate,
        removeEntry,
        handleDragEnter, handleDragOver, handleDragLeave, handleDrop,
        handleAreaClick, handleAddFolderClick,
        handleCdDvdClick, handleFolderFromPcClick,
        handleFileInputChange, handleFolderInputChange,
        handleCloseModal,
        performUpload,
        cancelUpload,
        resumeModalOpen,
        resumeAllPaused,
        startNewAllPaused,
        revokeNotOurPatient,
        sendPatientMessage,
    } = useUpload(id)

    useEffect(() => { ui.reset(); initValidation() }, [id])

    const d = scancenterDetails
    const center = d?.center ?? ({} as any)
    const scanItems = d?.scanItems ?? []
    const na = (v: any) => (v != null && String(v).trim() !== '' ? String(v) : 'Not Available')

    const currentScanItem = pendingModal?.scanItemId
        ? (scanItems.find((s: any) => s.id === pendingModal.scanItemId) ?? null)
        : null

    const allReceived =
        scanItems.length > 0 && scanItems.every((s: any) => s.scanUploaded && s.reportUploaded)

    const patientName = d?.fullName ?? ''
    const mobile = d?.phoneNumber ? formatUSPhoneNumber(d.phoneNumber) : '—'
    const isRevoked =
        ['REVOKED', 'WRONG_PATIENT'].includes(d?.linkStatus ?? '') ||
        ['REVOKED', 'WRONG_PATIENT'].includes(d?.tokenStatus ?? '')

    return (
        <>
            {loader && <Loader />}

            {/* Real DICOM modals */}
            <ParsingModal open={modalMode === 'parsing'} />
            <MatchModal
                open={modalMode === 'match' || modalMode === 'unverified'}
                meta={pendingModal?.meta ?? null}
                patientName={patientName}
                patientId={d?.patientMrnNumber ?? ''}
                patientAge={d?.age ?? 0}
                patientGender={d?.gender ?? ''}
                scanItem={currentScanItem}
                totalFiles={pendingModal?.pairs.length ?? 0}
                verified={modalMode === 'match'}
                onUpload={() => pendingModal && performUpload(pendingModal)}
                onClose={handleCloseModal}
            />
            <MismatchModal
                open={modalMode === 'mismatch'}
                meta={pendingModal?.meta ?? null}
                patientName={patientName}
                patientId={d?.patientMrnNumber ?? ''}
                scanItem={currentScanItem}
                totalFiles={pendingModal?.pairs.length ?? 0}
                onContinue={() => pendingModal && performUpload(pendingModal)}
                onCancel={handleCloseModal}
            />
            <ResumeUploadModal open={resumeModalOpen} onResume={resumeAllPaused} onStartNew={startNewAllPaused} />

            {/* Invalid / expired / used link */}
            {uploadStatus === 'error' && (
                <div className="sc-status-wrap">
                    <div className="sc-status-card">
                        <img src={Logo} alt="MyRad Images" className="sc-status-logo" />
                        <p className="sc-status-title err">Invalid or Expired Link</p>
                        <p className="sc-status-msg">This upload link is invalid, has expired, or has already been used.</p>
                        <p className="sc-status-msg">Please contact the patient to request a new link.</p>
                    </div>
                </div>
            )}

            {uploadStatus === 'idle' && d && (
                <div className="staff-wrap">
                    <div className="staff-page">
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 18px' }}>
                            <img src={Logo} alt="MyRad Images" style={{ height: 34 }} />
                        </div>

                        {/* Center bar */}
                        <div className="centerbar2">
                            <div className="cb-nm">
                                <span>{na(center.labCenterName)}</span>
                                {d.requestId && <span className="cb-req2">{d.requestId}</span>}
                            </div>
                            <div className="cb-contacts2b">
                                <span className="cb-c"><Icon name="mapPin" sw={1.8} />{na(center.location)}</span>
                                <span className="cb-c"><Icon name="phone" sw={1.8} />{center.phoneNumber ? `${center.phoneCode ?? ''} ${center.phoneNumber}`.trim() : 'Not Available'}</span>
                                <span className="cb-c"><Icon name="fax" sw={1.8} />Not Available</span>
                                <span className="cb-c"><Icon name="mail" sw={1.8} />{na(center.email)}</span>
                            </div>
                        </div>

                        {/* Patient bar */}
                        <div className="ptbar2">
                            <div className="ptbar2-top">
                                <div className="p-av">{initialsFromName(patientName) || '?'}</div>
                                <div className="ptnm">{patientName || '—'}</div>
                                <div className="ptbar2-meta">
                                    <span className="ptm"><span className="k">DOB</span><span className="v">{d.dateOfBirth ? fmtLong(d.dateOfBirth) : '—'}</span></span>
                                    <span className="ptm"><span className="k">Sex</span><span className="v">{d.gender || '—'}</span></span>
                                    {d.age ? <span className="ptm"><span className="k">Age</span><span className="v">{d.age}</span></span> : null}
                                    <span className="ptm"><span className="k">MRN</span><span className="v">{d.patientMrnNumber || 'Not provided'}</span></span>
                                    <span className="ptm"><span className="k">Mobile</span><span className="v">{mobile}</span></span>
                                </div>
                            </div>
                            <div className="ptbar2-acts">
                                <button className="pt-actbtn" onClick={() => ui.patch({ modal: 'text', textMsgDraft: '' })}>
                                    <Icon name="chat" sw={1.8} />Text patient
                                </button>
                                <button className="pt-actbtn danger" onClick={() => ui.patch({ modal: 'notOurPatient' })}>
                                    <Icon name="alert" sw={1.8} />Not our patient
                                </button>
                                <button className={`verify-btn2 ${ui.verified ? 'ok' : ''}`} disabled={isRevoked} onClick={() => ui.patch({ verified: !ui.verified })}>
                                    <Icon name="checkCircle" sw={2} />
                                    {ui.verified ? 'Patient confirmed' : 'Confirm patient'}
                                </button>
                            </div>
                        </div>

                        {d.remarks && ui.verified && (
                            <div className="note-box" style={{ marginBottom: 16 }}>
                                <div className="nb-lbl">Note from patient</div>
                                <div className="nb-txt">{d.remarks}</div>
                            </div>
                        )}

                        {ui.flagged && (
                            <div className="help-strip" style={{ background: '#F6ECEB', borderColor: '#E4CECB', marginBottom: 16 }}>
                                <Icon name="alert" sw={1.8} style={{ color: 'var(--rose)' }} />
                                <p style={{ color: '#7A3530' }}>
                                    <b>Marked as Not Our Patient.</b> {patientName} has been notified. This request is locked.{' '}
                                    <a onClick={() => ui.patch({ flagged: false })} style={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 700 }}>Undo</a>
                                </p>
                            </div>
                        )}

                        {!ui.verified && (
                            <div className="help-strip" style={{ marginBottom: 16 }}>
                                <Icon name="bulb" sw={1.8} />
                                <p><b>Confirm the patient first.</b> Check that these details match your records, then tap Confirm patient above.</p>
                            </div>
                        )}

                        {ui.verified && !ui.flagged && (
                            <div className="ulist2 single">
                                {scanItems.map((scanItem: any) => {
                                    const itemId = scanItem.id
                                    return (
                                        <ScanItemUploader
                                            key={itemId}
                                            scanItem={scanItem}
                                            entries={uploadEntries[itemId] ?? []}
                                            dragOver={dragOver[itemId] ?? false}
                                            cardProgress={cardProgress}
                                            fileCount={fileCounts[itemId]}
                                            itemState={scanItemUploadState[itemId]}
                                            isPaused={pausedItems[itemId] ?? false}
                                            fileInputRef={(el) => { fileInputRefs.current[itemId] = el }}
                                            folderInputRef={(el) => { folderInputRefs.current[itemId] = el }}
                                            onDragEnter={(e) => handleDragEnter(e, itemId)}
                                            onDragOver={(e) => handleDragOver(e, itemId)}
                                            onDragLeave={(e) => handleDragLeave(e, itemId)}
                                            onDrop={(e) => handleDrop(e, itemId)}
                                            onAreaClick={() => handleAreaClick(itemId)}
                                            onAddFolderClick={(e) => handleAddFolderClick(e, itemId)}
                                            onCdDvdClick={(e) => handleCdDvdClick(e, itemId)}
                                            onFolderFromPcClick={(e) => handleFolderFromPcClick(e, itemId)}
                                            onFileInputChange={(e) => handleFileInputChange(e, itemId)}
                                            onFolderInputChange={(e) => handleFolderInputChange(e, itemId)}
                                            onRemoveEntry={(idx) => removeEntry(itemId, idx)}
                                            onCancelUpload={() => cancelUpload(itemId)}
                                            onReportUploadSuccess={() => id && reValidate(id)}
                                            patientRecord={{
                                                fullName: d.fullName,
                                                patientMrnNumber: d.patientMrnNumber,
                                                dateOfBirth: d.dateOfBirth,
                                                gender: d.gender,
                                            }}
                                        />
                                    )
                                })}

                                {allReceived && (
                                    <div className="help-strip" style={{ margin: '0 16px 16px', background: 'var(--accent-t)', borderColor: '#CFE0DA' }}>
                                        <Icon name="check" sw={2.4} />
                                        <p style={{ color: 'var(--accent-d)', fontWeight: 700 }}>All studies received — patient notified</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Text patient (UI-only) */}
            {ui.modal === 'text' && (
                <div className="getsheet-scrim" onClick={() => ui.patch({ modal: null })}>
                    <div className="getsheet-card" onClick={(e) => e.stopPropagation()}>
                        <h3 className="serif">Text {patientName}</h3>
                        <p>Send a quick text message to {mobile} about this request.</p>
                        <div className="field" style={{ marginBottom: 0 }}>
                            <label>Message</label>
                            <textarea
                                className="inp"
                                style={{ height: 100, resize: 'none' }}
                                placeholder="e.g. Hi, we need a clearer photo ID."
                                value={ui.textMsgDraft}
                                onChange={(e) => ui.patch({ textMsgDraft: e.target.value })}
                            />
                        </div>
                        <div className="af-btns">
                            <button className="btn btn-ghost" onClick={() => ui.patch({ modal: null })}>Cancel</button>
                            <button
                                className="btn btn-primary"
                                disabled={!ui.textMsgDraft.trim()}
                                onClick={async () => {
                                    const ok = await sendPatientMessage(ui.textMsgDraft)
                                    if (ok) ui.patch({ modal: null, textMsgDraft: '' })
                                }}
                            >
                                Send text
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Not our patient (UI-only) */}
            {ui.modal === 'notOurPatient' && (
                <div className="getsheet-scrim" onClick={() => ui.patch({ modal: null })}>
                    <div className="getsheet-card" onClick={(e) => e.stopPropagation()}>
                        <h3 className="serif">Mark as Not Our Patient?</h3>
                        <p>
                            {patientName} doesn&apos;t match your records for this imaging center. Confirming will
                            lock this request and let the patient know they may have sent it to the wrong center.
                        </p>
                        <div className="af-btns">
                            <button className="btn btn-ghost" onClick={() => ui.patch({ modal: null })}>Cancel</button>
                            <button
                                className="btn btn-ghost"
                                style={{ flex: 1, color: 'var(--rose)', borderColor: '#E4CECB' }}
                                onClick={async () => {
                                    const ok = await revokeNotOurPatient()
                                    if (ok) ui.patch({ flagged: true, modal: null })
                                }}
                            >
                                Confirm — not our patient
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ScanCenterHome
