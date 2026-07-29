import type { Screen } from '@/store/dashboard/navStore';
import { useAppNavigate } from '@/hooks/useAppNavigate';
import { useWizardStore } from '@/store/dashboard/wizardStore';
import { useSelfUploadStore } from '@/store/dashboard/selfUploadStore';
import { useDialogStore } from '@/store/dashboard/dialogStore';

/** Cross-store navigation actions with the side effects the original `go*` handlers had. */
export function useAppActions() {
  const nav = useAppNavigate();
  const resetWizard = useWizardStore((s) => s.reset);
  const resetSelfUpload = useSelfUploadStore((s) => s.reset);
  const closeGetSheet = useDialogStore((s) => s.closeGetSheet);

  const go = (screen: Screen) => nav.go(screen);

  const goSelfUpload = () => {
    resetSelfUpload();
    nav.go('selfUpload');
  };

  const startWizard = () => {
    resetWizard();
    closeGetSheet();
    nav.go('wizard');
  };

  return { nav, go, goSelfUpload, startWizard };
}
