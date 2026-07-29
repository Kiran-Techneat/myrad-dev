import type { Study, StudyTag } from '@/types';
import type { IScanFile } from '@/redux/myfiles/types/response';
import { fmtStudyDate } from '@/utils/format';

const SELF_SOURCE = 'USER_SELF';

/** Map a free-text scan type from the API to the UI's StudyTag enum. */
export function mapScanTypeToTag(scanType?: string | null): StudyTag {
  const s = (scanType || '').trim().toUpperCase();
  if (!s) return 'OTH';
  if (s.includes('MRI') || s.includes('MAGNETIC')) return 'MRI';
  if (s.includes('CT') || s.includes('COMPUTED')) return 'CT';
  if (s.includes('X-RAY') || s.includes('XRAY') || s === 'XR' || s.includes('RADIOGRAPH')) return 'XR';
  if (s.includes('ULTRASOUND') || s === 'US' || s.includes('SONO')) return 'US';
  if (s.includes('ECHO')) return 'ECHO';
  if (s.includes('PET')) return 'PET';
  if (s.includes('MAMMO') || s === 'MMG') return 'MMG';
  if (s.includes('NUCLEAR') || s === 'NS') return 'NS';
  return 'OTH';
}

/**
 * Adapt a real Images-service scan file into the mock `Study` shape the UI renders,
 * carrying the API keys (linkId/scanItemId/…) needed for downstream calls.
 */
export function mapScanFileToStudy(f: IScanFile): Study {
  const isSelf = f.uploadSource === SELF_SOURCE;
  const name = [f.scanType, f.bodyPoint].filter(Boolean).join(' · ') || f.description || 'Study';
  return {
    id: f.scanItemId,
    tag: mapScanTypeToTag(f.scanType),
    name,
    place: f.centerName || (isSelf ? 'Self-uploaded' : ''),
    date: fmtStudyDate(f.series?.[0]?.studyDate),
    status: f.status === 'READY' ? 'ready' : 'pending',
    reportStatus: f.reportUrl ? 'ready' : 'pending',
    patient: f.patientName,
    selfUploaded: isSelf,
    hasImages: f.status === 'READY' || !!(f.series && f.series.length > 0),
    // API keys carried through for viewer / report / delete calls:
    linkId: f.linkId,
    scanItemId: f.scanItemId,
    patientId: f.patientId,
    reportUrl: f.reportUrl,
    uploadSource: f.uploadSource,
    statusRaw: f.status,
    series: f.series ?? null,
  };
}
