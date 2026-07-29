import { useNavigate } from 'react-router-dom';
import { SCREEN_PATH } from '@/routes/paths';
import { useNavStore } from '@/store/dashboard/navStore';
import { useNavGuardStore } from '@/store/dashboard/navGuardStore';
import type { Screen, NotifyKind, NotifyShareData, NotifyRequestData } from '@/store/dashboard/navStore';
import type { Study } from '@/types';

/**
 * Adapter that preserves the app's old imperative navigation surface (`go`,
 * `openRequestDetail`, `openViewer`, `openNotify`, …) but implements each with
 * react-router's `navigate`, so real URLs update on every screen change while the
 * call sites barely change.
 *
 * Forward navigations are routed through the nav guard (`useNavGuardStore`) so a
 * screen with unsaved work (e.g. the create-request Wizard) can defer them behind
 * a confirm modal. Back navigations are left ungated.
 */
export function useAppNavigate() {
  const navigate = useNavigate();
  const guarded = (fn: () => void) => useNavGuardStore.getState().requestNav(fn);

  return {
    go: (screen: Screen) =>
      guarded(() => {
        useNavStore.getState().closeMenus();
        navigate(SCREEN_PATH[screen]);
      }),
    openRequestDetail: (id: string) =>
      guarded(() => {
        // Remembered so the Notify preview (opened later from the detail) can resolve it.
        useNavStore.getState().setSelectedReqId(id);
        navigate(`/requests/${id}`);
      }),
    openViewer: (opts: { from?: Screen; studyId?: Study['id'] | null; tab?: 'images' | 'report' }) =>
      guarded(() => {
        const q = opts.tab === 'report' ? '?tab=report' : '';
        navigate(opts.studyId != null ? `/viewer/${opts.studyId}${q}` : `/viewer${q}`);
      }),
    // Full-screen OHIF DICOM viewer (chrome-free route outside AppShell).
    openImageViewer: (study: Study) =>
      guarded(() => {
        const id = study.linkId ?? study.id;
        navigate(`/imageviewer/${id}`, { state: { data: study } });
      }),
    goViewerBack: () => navigate(-1),
    openNotify: (opts: {
      kind: NotifyKind;
      from?: unknown;
      shareData?: NotifyShareData;
      requestData?: NotifyRequestData;
    }) =>
      guarded(() => {
        useNavStore.getState().setNotify(opts.kind, opts.shareData ?? null);
        navigate('/notify', { state: opts.requestData ? { data: opts.requestData } : undefined });
      }),
    closeNotify: () => navigate(-1),
  };
}
