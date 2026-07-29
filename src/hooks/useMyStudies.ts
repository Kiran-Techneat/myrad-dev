import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { getmyfiles } from '@/redux/myfiles/action';
import type { IGetMyFilesRequest } from '@/redux/myfiles/types/request';
import { mapScanFileToStudy } from '@/features/images/mapScanFile';
import type { Study } from '@/types';

const DEFAULT_SIZE = 10;

// Module-level "current query" so that a refresh() triggered from the detail
// modal or viewer reuses the list's active page/search instead of resetting it.
let lastArgs: IGetMyFilesRequest = { searchString: '', page: 1, size: DEFAULT_SIZE };

/**
 * Single source of real Images-service studies for the imaging feature
 * (Images list, detail modal, viewer). Fetches on mount when empty, maps the
 * API shape to the UI `Study` shape, exposes the raw paginated response, and
 * polls while any study is PROCESSING.
 */
export function useMyStudies() {
  const dispatch = useAppDispatch();
  const data = useAppSelector((s) => s.myfiles.myfilesdata);

  const refresh = useCallback(
    (opts?: Partial<IGetMyFilesRequest>) => {
      lastArgs = { ...lastArgs, ...opts };
      return dispatch(getmyfiles(lastArgs));
    },
    [dispatch],
  );

  // Initial load when the store is empty (covers deep-links to viewer/detail).
  useEffect(() => {
    if (data == null) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const studies: Study[] = useMemo(
    () => (data?.data ?? []).map(mapScanFileToStudy),
    [data],
  );

  // Poll (reusing the active query) while any study is still processing.
  useEffect(() => {
    const hasPending = (data?.data ?? []).some((f) => f.status === 'PROCESSING');
    if (!hasPending) return;
    const timer = setInterval(() => refresh(), 5000);
    return () => clearInterval(timer);
  }, [data, refresh]);

  const findById = useCallback(
    (id?: string | number | null) =>
      id == null ? undefined : studies.find((x) => String(x.id) === String(id)),
    [studies],
  );

  return { studies, data, findById, loading: data == null, refresh };
}
