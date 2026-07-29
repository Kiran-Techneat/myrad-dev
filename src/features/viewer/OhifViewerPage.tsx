import { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { getmetadatabyId, getSelfUploadMetadata } from '@/redux/myfiles/action';
import type { Study } from '@/types';

const API_BASE = (import.meta.env.VITE_FILE_API_URL || import.meta.env.VITE_BASE_URL || '').replace(/\/$/, '');
const BACK_URL = '/images';

interface LocationState {
  data?: Study;
}

/**
 * Full-screen OHIF DICOM viewer. Rendered on a chrome-free route (outside the
 * AppShell) so it fills the viewport. Resolves the real study id from metadata
 * (linkId + scanItemId), falling back to the URL id on a hard refresh.
 */
export default function OhifViewerPage() {
  const params = useParams();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const metadata = useAppSelector((s) => s.myfiles.metadata);

  const study = (location.state as LocationState | null)?.data;
  const [iframeLoading, setIframeLoading] = useState(true);

  // Fetch DICOM metadata to resolve the real studyId used by the manifest.
  useEffect(() => {
    if (!study?.linkId || !study?.scanItemId) return;
    const thunk = study.uploadSource === 'USER_SELF' ? getSelfUploadMetadata : getmetadatabyId;
    dispatch(thunk({ linkId: study.linkId, scanItemId: study.scanItemId }))
      .unwrap()
      .catch(() => undefined);
  }, [study?.linkId, study?.scanItemId, study?.uploadSource, dispatch]);

  // metadata.studyId (from the fetch) preferred; fall back to the URL id.
  const manifestStudyId = metadata?.studyId ?? params.id ?? null;

  const iframeSrc = useMemo(() => {
    if (!manifestStudyId) return '';
    const manifestUrl = `${API_BASE}/files-service/scan/manifest/${manifestStudyId}`;
    return `/ohif/viewer/dicomjson?url=${encodeURIComponent(manifestUrl)}&backUrl=${encodeURIComponent(BACK_URL)}`;
  }, [manifestStudyId]);

  useEffect(() => {
    setIframeLoading(true);
  }, [iframeSrc]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, backgroundColor: '#000', display: 'flex', flexDirection: 'column' }}>
      {iframeSrc ? (
        <>
          {iframeLoading && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', zIndex: 1 }}>
              <div style={{ width: 48, height: 48, border: '4px solid #444', borderTopColor: '#fff', borderRadius: '50%', animation: 'ohif-spin 0.8s linear infinite' }} />
              <p style={{ color: '#aaa', marginTop: 16, fontSize: 14 }}>Loading viewer…</p>
              <style>{`@keyframes ohif-spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}
          <iframe
            src={iframeSrc}
            style={{ width: '100%', height: '100%', border: 'none', opacity: iframeLoading ? 0 : 1 }}
            title="OHIF Viewer"
            allow="fullscreen"
            onLoad={() => setIframeLoading(false)}
          />
        </>
      ) : (
        <div style={{ color: '#fff', margin: 'auto', textAlign: 'center', fontSize: '18px' }}>
          No files to display.
        </div>
      )}
    </div>
  );
}
