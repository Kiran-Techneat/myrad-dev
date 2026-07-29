import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Icon } from '@/components/common/Icon';
import { useMyStudies } from '@/hooks/useMyStudies';
import { useAppNavigate } from '@/hooks/useAppNavigate';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { getmetadatabyId, getSelfUploadMetadata } from '@/redux/myfiles/action';
import { useOpenShare } from '@/hooks/useOpenShare';

const API_BASE = (import.meta.env.VITE_FILE_API_URL || import.meta.env.VITE_BASE_URL || '').replace(/\/$/, '');

export function ViewerScreen() {
  const { studyId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const nav = useAppNavigate();
  const dispatch = useAppDispatch();
  const { findById } = useMyStudies();
  const { openShare } = useOpenShare();
  const metadata = useAppSelector((s) => s.myfiles.metadata);

  const vs = findById(studyId);
  const isSelf = vs?.uploadSource === 'USER_SELF';
  const hasImages = !vs || vs.hasImages !== false;
  const title = vs ? vs.name : 'Study';
  const sub = vs ? [vs.place, vs.date].filter(Boolean).join(' · ') : '';
  const isImages = searchParams.get('tab') !== 'report';
  const setTab = (tab: 'images' | 'report') =>
    setSearchParams(tab === 'report' ? { tab: 'report' } : {}, { replace: true });

  const [iframeLoading, setIframeLoading] = useState(true);
  const [metaLoading, setMetaLoading] = useState(false);

  // Fetch the DICOM metadata (studyId + reports) for the resolved study.
  useEffect(() => {
    if (!vs?.linkId || !vs?.scanItemId) return;
    setMetaLoading(true);
    const thunk = isSelf ? getSelfUploadMetadata : getmetadatabyId;
    dispatch(thunk({ linkId: vs.linkId, scanItemId: vs.scanItemId }))
      .unwrap()
      .catch(() => undefined)
      .finally(() => setMetaLoading(false));
  }, [vs?.linkId, vs?.scanItemId, isSelf, dispatch]);

  const metaStudyId = metadata?.studyId;
  const reportUrl = metadata?.reports?.[0]?.presignedUrl || vs?.reportUrl || '';

  const iframeSrc = useMemo(() => {
    if (!metaStudyId) return '';
    const manifestUrl = `${API_BASE}/files-service/scan/manifest/${metaStudyId}`;
    return `/ohif/viewer/dicomjson?url=${encodeURIComponent(manifestUrl)}&backUrl=${encodeURIComponent('/images')}`;
  }, [metaStudyId]);

  useEffect(() => {
    setIframeLoading(true);
  }, [iframeSrc]);

  const share = () => {
    if (!vs) return;
    const vHasImages = vs.hasImages !== false;
    openShare({
      studyName: vs.name,
      meta: [vs.patient, vs.date, vs.place].filter(Boolean).join(' · '),
      items: [
        { id: vs.id, name: vs.name, patient: vs.patient, images: vHasImages, report: !!reportUrl, reportAvailable: !!reportUrl },
      ],
    });
  };

  return (
    <div className="viewer">
      <div className="vtop">
        <button className="vback" onClick={nav.goViewerBack}>
          <Icon name="chevronLeft" />
          Back
        </button>
        <div>
          <div className="vtitle">{title}</div>
          <div className="vsub">{sub}</div>
        </div>
      </div>

      <div className="vtabs">
        {hasImages && (
          <button className={`vtab ${isImages ? 'on' : ''}`} onClick={() => setTab('images')}>
            Images
          </button>
        )}
        <button className={`vtab ${!isImages ? 'on' : ''}`} onClick={() => setTab('report')}>
          Report
        </button>
      </div>

      {isImages ? (
        <>
          {!hasImages ? (
            <div className="vstage">
              <div className="vplaceholder">No images were uploaded for this study</div>
            </div>
          ) : (
            <div className="vstage" style={{ position: 'relative', padding: 0, overflow: 'hidden' }}>
              {iframeSrc ? (
                <>
                  {iframeLoading && (
                    <div className="vplaceholder" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="su-spin" /> Loading viewer…
                    </div>
                  )}
                  <iframe
                    src={iframeSrc}
                    title="OHIF Viewer"
                    allow="fullscreen"
                    style={{ width: '100%', height: '100%', border: 'none', opacity: iframeLoading ? 0 : 1 }}
                    onLoad={() => setIframeLoading(false)}
                  />
                </>
              ) : (
                <div className="vplaceholder">
                  {metaLoading ? 'Preparing images…' : 'No images to display.'}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="vstage" style={{ position: 'relative', padding: 0, overflow: 'hidden' }}>
          {reportUrl ? (
            <iframe
              src={reportUrl}
              title="Report"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          ) : (
            <div className="vplaceholder">{metaLoading ? 'Loading report…' : 'No report available.'}</div>
          )}
        </div>
      )}

      <div className="vwr-foot">
        <button className="btn btn-primary btn-share" onClick={share} disabled={!vs}>
          <Icon name="share" sw={1.8} />
          Share with Healthcare Provider, Family or Friend
        </button>
        <button
          className="btn btn-ghost"
          style={{ flex: '0 0 54px', padding: 0 }}
          disabled={!reportUrl}
          onClick={() => reportUrl && window.open(reportUrl, '_blank', 'noopener')}
        >
          <Icon name="download" sw={1.8} />
        </button>
      </div>
    </div>
  );
}
