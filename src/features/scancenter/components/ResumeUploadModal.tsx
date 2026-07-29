import { Icon } from '@/components/common/Icon'

interface ResumeUploadModalProps {
    open: boolean
    onResume: () => void
    onStartNew: () => void
}

const ResumeUploadModal = ({ open, onResume, onStartNew }: ResumeUploadModalProps) => {
    if (!open) return null
    return (
        <div className="getsheet-scrim">
            <div className="getsheet-card notice-card" onClick={(e) => e.stopPropagation()}>
                <div className="sc-mhd ok">
                    <Icon name="shieldCheck" sw={2} className="sc-mhd-ic" />
                    <div>
                        <h3 className="serif">Connection Restored</h3>
                        <p>Your upload was paused when the network dropped.</p>
                    </div>
                </div>
                <p style={{ fontSize: 14, color: 'var(--ink2)', margin: '0 0 4px' }}>
                    Do you want to resume the interrupted upload from where it stopped, or start over?
                </p>
                <div className="af-btns">
                    <button className="btn btn-ghost" onClick={onStartNew}>Start New</button>
                    <button className="btn btn-primary" onClick={onResume}>Resume Upload</button>
                </div>
            </div>
        </div>
    )
}

export default ResumeUploadModal
