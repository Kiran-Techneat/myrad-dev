import { Icon } from '@/components/common/Icon';

interface ResumeUploadModalProps {
  open: boolean;
  onResume: () => void;
  onStartNew: () => void;
}

export function ResumeUploadModal({ open, onResume, onStartNew }: ResumeUploadModalProps) {
  if (!open) return null;

  return (
    <div className="getsheet-scrim">
      <div className="getsheet-card notice-card share-confirm-card" onClick={(e) => e.stopPropagation()}>
        <div className="re-head-ic" style={{ margin: '0 auto 16px' }}>
          <Icon name="alert" sw={1.9} />
        </div>
        <h3 className="serif">Network reconnected</h3>
        <p>Your upload was paused when the connection dropped. Resume from where it stopped, or start over.</p>
        <div className="af-btns">
          <button className="btn btn-ghost" onClick={onStartNew}>
            Start new
          </button>
          <button className="btn btn-primary" onClick={onResume}>
            Resume
          </button>
        </div>
      </div>
    </div>
  );
}
