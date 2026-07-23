import { useParams, useSearchParams } from 'react-router-dom';
import { Icon } from '@/components/common/Icon';
import { useDomainData } from '@/hooks/useDomainData';
import { useAppNavigate } from '@/hooks/useAppNavigate';
import { useDialogStore } from '@/store/dashboard/dialogStore';
import { useShareStore } from '@/store/dashboard/shareStore';

export function ViewerScreen() {
  const { allStudies } = useDomainData();
  const { studyId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const nav = useAppNavigate();
  const showNotice = useDialogStore((s) => s.showNotice);
  const openShare = useShareStore((s) => s.openShare);

  const vs = studyId != null ? allStudies.find((x) => String(x.id) === studyId) : undefined;
  const hasImages = !vs || vs.hasImages !== false;
  const title = vs ? vs.name : 'CT - Chest';
  const sub = vs ? [vs.place, vs.date].filter(Boolean).join(' · ') : 'City Imaging Center · Jun 12, 2026';
  const isImages = searchParams.get('tab') !== 'report';
  const setTab = (tab: 'images' | 'report') =>
    setSearchParams(tab === 'report' ? { tab: 'report' } : {}, { replace: true });

  const share = () => {
    const study = vs ?? { id: 'viewer-ct-chest', name: 'CT - Chest', patient: 'John Doe', date: 'June 30, 2026', place: 'Metro Radiology', hasImages: true };
    const vHasImages = study.hasImages !== false;
    openShare({
      studyName: study.name,
      meta: [study.patient, study.date, study.place].filter(Boolean).join(' · '),
      items: [
        { id: study.id ?? 'viewer-ct-chest', name: study.name, patient: study.patient, images: vHasImages, report: true, reportAvailable: true },
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
              <div className="vplaceholder">No images were uploaded for this self-uploaded report</div>
            </div>
          ) : (
            <>
              <div className="vstage">
                <div className="vplaceholder">
                  medical image viewer
                  <br />
                  (placeholder)
                </div>
              </div>
              <div className="vctrl">
                <button>
                  <Icon name="chevronLeft" />
                </button>
                <button>
                  <Icon name="zoomIn" />
                </button>
                <button>
                  <Icon name="chevronRight" />
                </button>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="vreport">
          <div className="vreport-row">
            <span>{title}</span>
            <span>{sub}</span>
          </div>
          <div className="vreport-sec">
            <h5>Patient</h5>
            <p>John Doe · City Imaging Center</p>
          </div>
          <div className="vreport-sec">
            <h5>Technique</h5>
            <p>
              Helical CT of the chest was performed following intravenous contrast administration, with
              axial, coronal and sagittal reconstructions.
            </p>
          </div>
          <div className="vreport-sec">
            <h5>Findings</h5>
            <p>
              The lungs are clear without focal consolidation, suspicious nodule, or pleural effusion.
              The heart is normal in size with no pericardial effusion.
            </p>
          </div>
          <div className="vreport-sec imp">
            <h5>Impression</h5>
            <p>No acute cardiopulmonary abnormality. No pulmonary nodule or effusion.</p>
          </div>
          <div className="vreport-sec">
            <h5>Reporting radiologist</h5>
            <p style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: 19, color: 'var(--accent-d)' }}>
              Dr. Alan Reeve, MD
            </p>
          </div>
        </div>
      )}

      <div className="vwr-foot">
        <button className="btn btn-primary btn-share" onClick={share}>
          <Icon name="share" sw={1.8} />
          Share with Healthcare Provider, Family or Friend
        </button>
        <button
          className="btn btn-ghost"
          style={{ flex: '0 0 54px', padding: 0 }}
          onClick={() => showNotice('Downloaded', 'Report saved to your device.')}
        >
          <Icon name="download" sw={1.8} />
        </button>
      </div>
    </div>
  );
}
