import { useNavigate } from 'react-router-dom';
import { SCREEN_PATH } from '@/routes/paths';
import { useNavStore } from '@/store/dashboard/navStore';
import type { Screen, StaffView, NotifyKind, NotifyShareData } from '@/store/dashboard/navStore';
import type { Study } from '@/types';

/**
 * Adapter that preserves the app's old imperative navigation surface (`go`,
 * `openRequestDetail`, `openViewer`, `openNotify`, …) but implements each with
 * react-router's `navigate`, so real URLs update on every screen change while the
 * call sites barely change.
 */
export function useAppNavigate() {
  const navigate = useNavigate();

  return {
    go: (screen: Screen) => {
      useNavStore.getState().closeMenus();
      navigate(SCREEN_PATH[screen]);
    },
    goStaff: (view: StaffView) => {
      useNavStore.getState().closeMenus();
      navigate(`/staff/${view}`);
    },
    openRequestDetail: (id: string) => {
      // Remembered so the Notify preview (opened later from the detail) can resolve it.
      useNavStore.getState().setSelectedReqId(id);
      navigate(`/requests/${id}`);
    },
    openViewer: (opts: { from?: Screen; studyId?: Study['id'] | null; tab?: 'images' | 'report' }) => {
      const q = opts.tab === 'report' ? '?tab=report' : '';
      navigate(opts.studyId != null ? `/viewer/${opts.studyId}${q}` : `/viewer${q}`);
    },
    goViewerBack: () => navigate(-1),
    openNotify: (opts: { kind: NotifyKind; from?: unknown; shareData?: NotifyShareData }) => {
      useNavStore.getState().setNotify(opts.kind, opts.shareData ?? null);
      navigate('/notify');
    },
    closeNotify: () => navigate(-1),
  };
}
