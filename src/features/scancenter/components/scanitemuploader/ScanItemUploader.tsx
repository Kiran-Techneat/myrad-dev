import { useRef, useState } from 'react'
import type { DragEvent, ChangeEvent } from 'react'
import dayjs from 'dayjs'
import { Icon } from '@/components/common/Icon'
import { StudyIcon } from '@/components/common/StudyIcon'
import type { StudyTag } from '@/types'
import UploadFileCard from '../uploadfilecard/UploadFIleCard'
import type { UploadEntry, CardProgressMap, ScanItemUploadStateMap } from '../../types/Index'
import { useMutation } from '@tanstack/react-query'
import { reportuploadextract, scanreportupload } from '@/redux/scancenter/action'
import { resetUploadExtract } from '@/redux/scancenter/slice'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import type { IReportUploadExtractRequest, IScanReportUploadRequest } from '@/redux/scancenter/types/request'
import type { IReportUploadExtractResponse } from '@/redux/scancenter/types/response'
import { showAlert } from '@/components/common/showAlert'
import { useParams } from 'react-router-dom'
import { reportFieldsMatch } from '../../utils/Index'
import type { ReportPatientRecord } from '../../utils/Index'
import ReportMatchModal from '../ReportMatchModal'
import ReportMisMatchModal from '../ReportMisMatchModal'
import { useScanUiStore } from '../../scanUiStore'

export interface ScanItemShape {
    id: string
    scanType: string
    bodyPoint: string
    scanDate: string | null
    reportUploaded?: boolean
    scanUploaded?: boolean
    [key: string]: any
}

interface ScanItemUploaderProps {
    scanItem: ScanItemShape
    entries: UploadEntry[]
    dragOver: boolean
    cardProgress: CardProgressMap
    fileCount?: number
    itemState: ScanItemUploadStateMap[string] | undefined
    isPaused?: boolean
    fileInputRef: (el: HTMLInputElement | null) => void
    onDragEnter: (e: DragEvent<HTMLDivElement>) => void
    onDragOver: (e: DragEvent<HTMLDivElement>) => void
    onDragLeave: (e: DragEvent<HTMLDivElement>) => void
    onDrop: (e: DragEvent<HTMLDivElement>) => void
    onAreaClick: () => void
    onAddFolderClick: (e: React.MouseEvent) => void
    onCdDvdClick: (e: React.MouseEvent) => void
    onFolderFromPcClick: (e: React.MouseEvent) => void
    onFileInputChange: (e: ChangeEvent<HTMLInputElement>) => void
    folderInputRef: (el: HTMLInputElement | null) => void
    onFolderInputChange: (e: ChangeEvent<HTMLInputElement>) => void
    onRemoveEntry: (idx: number) => void
    onCancelUpload: () => void
    onReportUploadSuccess?: () => void
    patientRecord?: ReportPatientRecord
}

type ReportExtracted = IReportUploadExtractResponse[number]

function tagFromScanType(scanType: string): StudyTag {
    const s = (scanType || '').toUpperCase()
    if (s.includes('MRI') || s.includes('MAGNETIC')) return 'MRI'
    if (s.includes('CT') || s.includes('TOMOGRAPHY')) return 'CT'
    if (s.includes('ECHO')) return 'ECHO'
    if (s.includes('ULTRA') || /\bUS\b/.test(s) || s.includes('SONO')) return 'US'
    if (s.includes('PET')) return 'PET'
    if (s.includes('MAMMO') || s.includes('MMG')) return 'MMG'
    if (s.includes('X-RAY') || s.includes('XRAY') || s.includes('RADIOGRAPH') || /\bXR\b/.test(s) || /\b(CR|DX)\b/.test(s)) return 'XR'
    if (s.includes('NUCLEAR')) return 'NS'
    return 'OTH'
}

// Contextual "how to match" help for the study-date bulb.
function dateHelp(dateLabel: string, hasDate: boolean): { label: string; body: string } {
    if (!hasDate)
        return {
            label: 'No date given — how to match',
            body: "The patient didn't give a time period for this study. Search your full archive for this study type and body part, and use your best judgement on the closest match.",
        }
    return {
        label: 'Month & year — how to match',
        body: `The patient's requested period is ${dateLabel}. Search your records for a study of this type and body part performed during that period.`,
    }
}

const ScanItemUploader = ({
    scanItem, entries, dragOver, cardProgress, fileCount, itemState, isPaused = false,
    fileInputRef,
    folderInputRef, onFolderInputChange,
    onCdDvdClick, onFolderFromPcClick,
    onDragEnter, onDragOver, onDragLeave, onDrop,
    onFileInputChange,
    onRemoveEntry,
    onCancelUpload,
    onReportUploadSuccess,
    patientRecord,
}: ScanItemUploaderProps) => {
    const { id: itemId, scanType, bodyPoint, scanDate, reportUploaded, scanUploaded } = scanItem
    const isUploading = itemState?.uploading === true
    const progress = cardProgress[itemId]
    const isReading = progress === 'reading'
    const isCompleting = progress === 'completing'
    const isActiveUpload = isUploading && typeof progress === 'number' && !isCompleting

    const dispatch = useAppDispatch()
    const params = useParams()
    const ui = useScanUiStore()

    const reportInputRef = useRef<HTMLInputElement | null>(null)
    const [reportFile, setReportFile] = useState<File | null>(null)
    const [reportModal, setReportModal] = useState<'none' | 'match' | 'mismatch'>('none')

    const { reportUploadExtractResponse } = useAppSelector((state) => state.scanCenter)
    const extracted: ReportExtracted | null = reportUploadExtractResponse?.[0] ?? null

    const { mutate: handleSubmitReport } = useMutation({
        mutationFn: (payload: IScanReportUploadRequest) => dispatch(scanreportupload(payload)).unwrap(),
        onSuccess: () => {
            showAlert({ message: 'Report Uploaded successfully', status: 'success', autoClose: 6000 })
            setReportFile(null)
            setReportModal('none')
            onReportUploadSuccess?.()
        },
        onError: (error: any) => {
            const message = error?.headers?.message || error?.message || 'Something went wrong'
            showAlert({ message, status: 'error', autoClose: 6000 })
        },
    })

    const { mutate: handleExtractReport, isPending: isExtracting } = useMutation({
        mutationFn: (payload: IReportUploadExtractRequest) => dispatch(reportuploadextract(payload)).unwrap(),
        onSuccess: (data: any) => {
            const list = Array.isArray(data) ? data : (data?.recordInfo ?? [])
            const record: ReportExtracted | undefined = list[0]
            if (!record) {
                showAlert({ message: 'Could not read the report. Please try again.', status: 'error', autoClose: 6000 })
                setReportFile(null)
                return
            }
            setReportModal(reportFieldsMatch(record, patientRecord ?? {}) ? 'match' : 'mismatch')
        },
        onError: (error: any) => {
            const message = error?.headers?.message || error?.message || 'Failed to read the report.'
            showAlert({ message, status: 'error', autoClose: 6000 })
            setReportFile(null)
        },
    })

    const submitReport = () => {
        if (!reportFile) return
        setReportModal('none')
        dispatch(resetUploadExtract())
        handleSubmitReport({ token: params?.id ?? '', scanItemId: itemId, files: [reportFile] })
    }
    const cancelReport = () => {
        setReportModal('none')
        setReportFile(null)
        dispatch(resetUploadExtract())
    }
    const pickReport = (e: React.MouseEvent) => { e.stopPropagation(); reportInputRef.current?.click() }
    const onReportInput = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && file.type === 'application/pdf') {
            setReportFile(file)
            handleExtractReport({ token: params?.id ?? '', scanItemId: itemId, files: [file] })
        } else if (file) {
            showAlert({ message: 'Please upload a PDF file only.', status: 'error', autoClose: 9000 })
        }
        e.target.value = ''
    }

    const hasDate = !!scanDate
    const dateLabel = hasDate ? dayjs(scanDate).format('MMMM YYYY') : 'Not specified'
    const name = `${scanType} · ${bodyPoint}`
    const fullyDone = !!scanUploaded && !!reportUploaded
    const isSel = ui.selected === itemId
    const help = dateHelp(dateLabel, hasDate)
    const helpOpen = ui.cardHelpIdx === itemId
    const expanded = isSel && !fullyDone && !scanUploaded && ui.noteOpenIdx !== itemId && ui.dupConfirmIdx !== itemId
    const isFilesMethod = ui.fulfillMethod === 'files'
    const stop = (e: React.MouseEvent) => e.stopPropagation()

    const uploadedFileCount = (isActiveUpload && fileCount)
        ? Math.round((progress as number) * fileCount / 100)
        : null

    const rowClickable = ui.verified && !fullyDone && !scanUploaded && !isUploading

    return (
        <div className={expanded ? 'wide' : ''}>
            <div className="uhelp-wrap">
                <button className="uhelp-btn" onClick={(e) => { stop(e); ui.patch({ cardHelpIdx: helpOpen ? null : itemId }) }}>
                    <Icon name="bulb" sw={1.8} />
                    {help.label}
                </button>
            </div>

            {helpOpen && (
                <div className="getsheet-scrim" onClick={() => ui.patch({ cardHelpIdx: null })}>
                    <div className="getsheet-card notice-card" onClick={stop}>
                        <h3 className="serif">{help.label}</h3>
                        <p style={{ marginBottom: 0 }}>{help.body}</p>
                        <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} onClick={() => ui.patch({ cardHelpIdx: null })}>
                            Got it
                        </button>
                    </div>
                </div>
            )}

            <div className="urow2-card">
                <div
                    className={`urow2 ${isSel ? 'sel' : ''}`}
                    style={{ cursor: rowClickable ? 'pointer' : 'default' }}
                    onClick={() => { if (rowClickable) ui.patch({ selected: isSel ? null : itemId }) }}
                >
                    <div className="study-ico"><StudyIcon tag={tagFromScanType(scanType)} /></div>
                    <div className="urow-bd">
                        <div className="urow2-nm">{name}</div>
                        <div className="urow2-mt">Study date: {dateLabel}</div>
                    </div>
                    {fullyDone ? (
                        <span className="chip ready">Received</span>
                    ) : isUploading ? (
                        <span className="chip pending">{isReading ? 'Reading…' : isCompleting ? 'Completing…' : isPaused ? 'Paused' : 'Uploading…'}</span>
                    ) : scanUploaded ? (
                        <span className="chip ready">Images uploaded</span>
                    ) : (
                        <>
                            <span className={`radio3 ${isSel ? 'on' : ''}`}>{isSel && <span className="dot3" />}</span>
                            <span className="sellbl2">{isSel ? 'Selected' : 'Select'}</span>
                        </>
                    )}
                </div>

                {/* Secondary actions: report upload + (UI-only) note flow */}
                <div className="urow2-secacts">
                    {reportUploaded ? (
                        <span className="chip ready sc-report-chip" style={{ marginRight: 'auto' }}>Report uploaded</span>
                    ) : (
                        <button className="sc-secbtn" onClick={pickReport}>
                            <Icon name="doc" sw={2} />
                            Upload report (PDF)
                        </button>
                    )}
                    {!fullyDone && ui.noteOpenIdx !== itemId && (
                        <button
                            className="sc-secbtn"
                            onClick={(e) => { stop(e); ui.patch({ noteOpenIdx: itemId, noteDraft: '', dupConfirmIdx: null }) }}
                        >
                            <Icon name="search" sw={2} />
                            Couldn&apos;t find this study?
                        </button>
                    )}
                </div>

                <input type="file" accept="application/pdf,.pdf" style={{ display: 'none' }} ref={reportInputRef} onChange={onReportInput} />

                {/* Report file preview while extracting / verifying */}
                {reportFile && (
                    <div className="sc-report" style={{ margin: '0 14px 12px' }}>
                        <Icon name="doc" className="sc-report-ic" sw={1.8} />
                        <div className="sc-report-bd">
                            <p className="sc-report-nm">{reportFile.name}</p>
                            <p className="sc-report-mt">
                                {isExtracting ? 'Report · Reading…' : reportModal !== 'none' ? 'Report · Verify details' : 'Report · Uploading…'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Note-to-patient (UI-only) */}
                {ui.noteOpenIdx === itemId && (
                    <div className="urow2-noteedit" onClick={stop}>
                        <p className="urow2-editintro">
                            This note is sent to the patient, letting them know you searched your records and
                            couldn&apos;t find a matching study for this period.
                        </p>
                        <textarea
                            className="inp"
                            style={{ height: 70, padding: '12px 14px', resize: 'none', fontSize: 14 }}
                            placeholder="e.g. No MRI of the head/brain was performed for this patient in Jan 2026."
                            value={ui.noteDraft}
                            onChange={(e) => ui.patch({ noteDraft: e.target.value })}
                        />
                        <div className="af-btns" style={{ marginTop: 10 }}>
                            <button className="btn btn-ghost" onClick={() => ui.patch({ noteOpenIdx: null, noteDraft: '' })}>Cancel</button>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    ui.patch({ noteOpenIdx: null, noteDraft: '' })
                                    showAlert({ message: 'The patient has been notified that this study could not be found.', status: 'success', autoClose: 6000 })
                                }}
                            >
                                Send note to patient
                            </button>
                        </div>
                    </div>
                )}

                {/* Expanded upload panel */}
                {expanded && (
                    <div className="uexpand" onClick={stop}>
                        <div className="uexpand-tabs">
                            <button className={isFilesMethod ? 'on' : ''} onClick={() => ui.patch({ fulfillMethod: 'files' })}>Upload files</button>
                            <button className={!isFilesMethod ? 'on' : ''} onClick={() => ui.patch({ fulfillMethod: 'link' })}>Provide viewer link</button>
                        </div>
                        <div className="uexpand-body">
                            {isFilesMethod && !isUploading && (
                                <>
                                    <div className="umethod-seg">
                                        <button className={ui.uploadSource === 'computer' ? 'on' : ''} onClick={() => ui.patch({ uploadSource: 'computer' })}>This computer</button>
                                        <button className={ui.uploadSource === 'cd' ? 'on' : ''} onClick={() => ui.patch({ uploadSource: 'cd' })}>CD / DVD</button>
                                    </div>

                                    <div className="uhelp-wrap" style={{ marginTop: 12 }}>
                                        <button className="uhelp-btn" onClick={(e) => { stop(e); ui.patch({ uploadHelpOpen: !ui.uploadHelpOpen }) }}>
                                            <Icon name="bulb" sw={1.8} />
                                            How to upload — {ui.uploadSource === 'cd' ? 'CD / DVD' : 'this computer'}
                                        </button>
                                    </div>

                                    <div
                                        className={`umethod-drop${dragOver ? ' dragover' : ''}`}
                                        onClick={ui.uploadSource === 'cd' ? onCdDvdClick : onFolderFromPcClick}
                                        onDragEnter={onDragEnter}
                                        onDragOver={onDragOver}
                                        onDragLeave={onDragLeave}
                                        onDrop={onDrop}
                                    >
                                        <Icon name="upload" sw={1.6} />
                                        <p>Only DICOM image files are uploaded from the selected folder. You can also drag &amp; drop a folder here.</p>
                                    </div>

                                    <button
                                        className="btn btn-primary btn-block"
                                        onClick={ui.uploadSource === 'cd' ? onCdDvdClick : onFolderFromPcClick}
                                    >
                                        {ui.uploadSource === 'cd' ? 'Open disc & select folder' : 'Select folder from computer'}
                                    </button>
                                </>
                            )}

                            {isUploading && (
                                <>
                                    <div className="su-prog">
                                        <div className="su-prog-lbl">
                                            <span className="su-spin" />
                                            {isReading ? 'Reading file metadata…' : isCompleting ? 'Finalising upload…' : isPaused ? 'Paused — waiting for network…' : 'Transferring files securely…'}
                                            {uploadedFileCount !== null && fileCount ? ` (${uploadedFileCount}/${fileCount})` : ''}
                                        </div>
                                        <div className="su-prog-bar">
                                            <i style={{ width: typeof progress === 'number' ? `${progress}%` : '100%' }} />
                                        </div>
                                    </div>
                                    {isActiveUpload && (
                                        <button className="btn btn-ghost btn-block" onClick={onCancelUpload}>Cancel upload</button>
                                    )}
                                </>
                            )}

                            {!isFilesMethod && (
                                <>
                                    <div className="field">
                                        <label>Direct image viewer link</label>
                                        <textarea
                                            className="inp"
                                            style={{ height: 70, resize: 'none' }}
                                            placeholder="https://yourpacs.example.com/viewer?..."
                                            value={ui.pacsUrlDraft}
                                            onChange={(e) => ui.patch({ pacsUrlDraft: e.target.value })}
                                        />
                                    </div>
                                    <div className="field">
                                        <label>PACS system (optional)</label>
                                        <input className="inp" placeholder="e.g. Sectra, Ambra" value={ui.pacsProviderDraft} onChange={(e) => ui.patch({ pacsProviderDraft: e.target.value })} />
                                    </div>
                                    <div className="field">
                                        <label>Access code (optional)</label>
                                        <input className="inp" placeholder="e.g. 4-digit PIN or passcode" value={ui.pacsCodeDraft} onChange={(e) => ui.patch({ pacsCodeDraft: e.target.value })} />
                                    </div>
                                    <div className="field">
                                        <label>Link expires on (optional)</label>
                                        <input className="inp" type="date" value={ui.pacsExpiryDraft} onChange={(e) => ui.patch({ pacsExpiryDraft: e.target.value })} />
                                    </div>
                                    <button
                                        className="btn btn-primary btn-block"
                                        disabled={!ui.pacsUrlDraft.trim()}
                                        onClick={() => {
                                            ui.patch({ selected: null, pacsUrlDraft: '', pacsProviderDraft: '', pacsCodeDraft: '', pacsExpiryDraft: '' })
                                            showAlert({ message: 'Viewer link saved — the patient has been notified.', status: 'success', autoClose: 6000 })
                                        }}
                                    >
                                        Save link &amp; notify patient
                                    </button>
                                </>
                            )}

                            {/* Real per-file cards + hidden inputs */}
                            <input type="file" multiple style={{ display: 'none' }} ref={fileInputRef} onChange={onFileInputChange} />
                            {/* @ts-ignore webkitdirectory */}
                            <input type="file" webkitdirectory="" multiple style={{ display: 'none' }} ref={folderInputRef} onChange={onFolderInputChange} />
                            {entries.length > 0 && (
                                <div className="sc-filecards">
                                    {entries.map((entry, idx) => (
                                        <UploadFileCard
                                            key={idx}
                                            entry={entry}
                                            idx={idx}
                                            progress={cardProgress[itemId]}
                                            isItemUploading={isUploading}
                                            onRemove={() => onRemoveEntry(idx)}
                                            onCancelUpload={onCancelUpload}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <ReportMatchModal open={reportModal === 'match'} extracted={extracted} patient={patientRecord ?? {}} onUpload={submitReport} onClose={cancelReport} />
            <ReportMisMatchModal open={reportModal === 'mismatch'} extracted={extracted} patient={patientRecord ?? {}} onContinue={submitReport} onCancel={cancelReport} />
        </div>
    )
}

export default ScanItemUploader
