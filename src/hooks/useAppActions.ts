import { useNavStore } from '@/store/navStore';
import type { Screen, StaffView } from '@/store/navStore';
import { useWizardStore } from '@/store/wizardStore';
import { useSelfUploadStore } from '@/store/selfUploadStore';
import { useStaffStore } from '@/store/staffStore';
import { useDialogStore } from '@/store/dialogStore';

/** Cross-store navigation actions with the side effects the original `go*` handlers had. */
export function useAppActions() {
  const nav = useNavStore();
  const resetWizard = useWizardStore((s) => s.reset);
  const resetSelfUpload = useSelfUploadStore((s) => s.reset);
  const ensureWalkIn = useStaffStore((s) => s.ensureWalkIn);
  const closeGetSheet = useDialogStore((s) => s.closeGetSheet);

  const go = (screen: Screen) => nav.go(screen);

  const goSelfUpload = () => {
    resetSelfUpload();
    nav.go('selfUpload');
  };

  const goStaff = (view: StaffView) => {
    if (view === 'walkin') ensureWalkIn();
    nav.goStaff(view);
  };

  const startWizard = () => {
    resetWizard();
    closeGetSheet();
    nav.go('wizard');
  };

  return { nav, go, goSelfUpload, goStaff, startWizard };
}
