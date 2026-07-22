import { Icon } from '@/components/common/Icon';
import { useDialogStore } from '@/store/dialogStore';
import { useAppActions } from '@/hooks/useAppActions';

export function GetSheet() {
  const open = useDialogStore((s) => s.getSheetOpen);
  const close = useDialogStore((s) => s.closeGetSheet);
  const { startWizard, goSelfUpload } = useAppActions();

  if (!open) return null;

  return (
    <div className="getsheet-scrim" onClick={close}>
      <div className="getsheet-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="serif">Get my images</h3>
        <p>How would you like to bring your studies into MyRad?</p>

        <button className="getsheet-opt" onClick={startWizard}>
          <div className="getsheet-opt-ico">
            <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M19 21V8l-7-5-7 5v13" />
              <path d="M9 21v-6h6v6" />
              <path d="M12 8v3M10.5 9.5h3" />
            </svg>
          </div>
          <div>
            <div className="getsheet-opt-nm">Request from a center</div>
            <div className="getsheet-opt-sub">
              We&apos;ll ask the hospital or imaging center to send them securely.
            </div>
          </div>
        </button>

        <button
          className="getsheet-opt"
          onClick={() => {
            close();
            goSelfUpload();
          }}
        >
          <div className="getsheet-opt-ico">
            <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M7 18a4.5 4.5 0 01-1-8.9 5.5 5.5 0 0110.6-1.7A4 4 0 0117 16" />
              <path d="M12 12v7M9 16l3-3 3 3" />
            </svg>
          </div>
          <div>
            <div className="getsheet-opt-nm">Self upload</div>
            <div className="getsheet-opt-sub">
              Already have a disc or files? Add them yourself in minutes.
            </div>
          </div>
        </button>

        <div className="help-strip" style={{ marginTop: 6 }}>
          <Icon name="bulb" sw={1.8} />
          <p>
            Not sure which to pick? Choose <b>Request from a center</b> — it&apos;s the easiest.
          </p>
        </div>
        <button className="getsheet-close" onClick={close}>
          Cancel
        </button>
      </div>
    </div>
  );
}
