import { useDialogStore } from '@/store/dialogStore';

export function ConfirmModal() {
  const { confirmOpen, confirmData, confirmNo, confirmYes } = useDialogStore();
  if (!confirmOpen || !confirmData) return null;
  return (
    <div className="getsheet-scrim" onClick={confirmNo}>
      <div className="getsheet-card notice-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="serif">{confirmData.title}</h3>
        <p style={{ marginBottom: 0 }}>{confirmData.msg}</p>
        <div className="af-btns">
          <button className="btn btn-ghost" onClick={confirmNo}>
            Keep it
          </button>
          <button className="btn btn-danger" onClick={confirmYes}>
            {confirmData.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
