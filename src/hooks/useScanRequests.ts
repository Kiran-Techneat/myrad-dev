import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { getAllScanLink, getRequestDashboard } from '@/redux/request/action';
import type { IScanLinkRequest } from '@/redux/request/types/request';
import { mapScanLinkToRequest } from '@/features/requests/mapScanLink';
import type { ImagingRequest } from '@/types';

const DEFAULT_SIZE = 10;

// Module-level "current query" so a refresh() from elsewhere reuses the list's
// active page/search/status instead of resetting it (mirrors useMyStudies).
let lastArgs: IScanLinkRequest = {
  patientId: '',
  searchString: '',
  bodyPoint: '',
  centerName: '',
  page: 1,
  size: DEFAULT_SIZE,
};

/**
 * Single source of real scan-link requests for the Requests screen. Fetches the
 * paginated list server-side, maps the API shape to the UI `ImagingRequest`
 * shape, and loads the dashboard counts once.
 */
export function useScanRequests() {
  const dispatch = useAppDispatch();
  const data = useAppSelector((s) => s.request.scanLink);
  const requestDashboard = useAppSelector((s) => s.request.requestDashboard);

  const refresh = useCallback(
    (opts?: Partial<IScanLinkRequest>) => {
      lastArgs = { ...lastArgs, ...opts };
      return dispatch(getAllScanLink(lastArgs));
    },
    [dispatch],
  );

  // Initial load when the store is empty (covers returning from the wizard).
  useEffect(() => {
    if (data == null) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dashboard counts, loaded once.
  useEffect(() => {
    if (requestDashboard == null) dispatch(getRequestDashboard());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requests: ImagingRequest[] = useMemo(
    () => (data?.data ?? []).map(mapScanLinkToRequest),
    [data],
  );

  return { requests, data, requestDashboard, refresh };
}
