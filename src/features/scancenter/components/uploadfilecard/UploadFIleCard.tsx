import { Icon } from '@/components/common/Icon'
import CardProgress from '../CardProgress'
import { formatSize, totalFolderSize } from '../../utils/Index'
import type { UploadEntry } from '../../types/Index'

interface UploadFileCardProps {
    entry: UploadEntry
    idx: number
    progress: number | 'done' | 'error' | 'reading' | 'completing' | undefined
    isItemUploading: boolean
    onRemove: () => void
    onCancelUpload: () => void
}

const UploadFileCard = ({ entry, progress, isItemUploading, onRemove, onCancelUpload }: UploadFileCardProps) => {
    const isDone = progress === 'done'
    const isError = progress === 'error'
    const isCardUploading = isItemUploading && typeof progress === 'number'

    const statusLabel = isCardUploading
        ? <span className="sc-status up">{progress as number}%</span>
        : isDone
            ? <span className="sc-status done">✓ Done</span>
            : isError
                ? <span className="sc-status error">✗ Error</span>
                : null

    const isFolder = entry.type === 'folder'
    const primaryText = isFolder ? entry.folderName : entry.file.name
    const secondaryText = isFolder
        ? `${entry.files.length} file${entry.files.length !== 1 ? 's' : ''} · ${formatSize(totalFolderSize(entry.files))}`
        : formatSize(entry.file.size)

    return (
        <div className="sc-filecard">
            <div className="sc-filecard-row">
                <Icon name={isFolder ? 'folder' : 'image'} className="sc-filecard-ic" sw={1.8} />
                <div className="sc-filecard-bd">
                    <p className="sc-filecard-nm">{primaryText}</p>
                    <p className="sc-filecard-mt">
                        <span>{secondaryText}</span>
                        {statusLabel}
                    </p>
                </div>
                {isCardUploading ? (
                    <button className="btn btn-ghost btn-mini" style={{ color: 'var(--rose)' }} onClick={onCancelUpload}>
                        Cancel
                    </button>
                ) : !isDone ? (
                    <button className="sc-filecard-remove" onClick={onRemove} aria-label="Remove">×</button>
                ) : (
                    <Icon name="checkCircle" className="sc-filecard-ic" style={{ color: '#16a34a' }} sw={2} />
                )}
            </div>
            {progress !== undefined && <CardProgress value={progress} />}
        </div>
    )
}

export default UploadFileCard
