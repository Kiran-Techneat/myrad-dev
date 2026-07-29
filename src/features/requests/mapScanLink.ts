import type { AggregateStatus, ImagingRequest, RequestItem, RequestItemStatus } from '@/types';
import type { IRequestViewIdResponse, IScanLinkItem } from '@/redux/request/types/response';
import { mapScanTypeToTag } from '@/features/images/mapScanFile';
import { formatUSPhone } from '@/utils/format';

/** Map a backend scan-link status to the UI's aggregate status. */
export function mapLinkStatus(status?: string | null): AggregateStatus {
  switch (status) {
    case 'COMPLETED':
      return 'ready';
    case 'PartiallyUploaded':
      return 'partial';
    case 'REVOKED':
      return 'cancelled';
    case 'PENDING':
    default:
      return 'pending';
  }
}

/** Per-item status derived from upload flags, falling back to the request status. */
function itemStatus(
  item: IScanLinkItem['scanItems'][number],
  reqStatus: AggregateStatus,
): RequestItemStatus {
  if (reqStatus === 'cancelled') return 'cancelled';
  if (item.scanUploaded && item.reportUploaded) return 'ready';
  if (item.scanUploaded || item.reportUploaded) return 'pending';
  return reqStatus === 'ready' ? 'ready' : 'pending';
}

function fmtCreated(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Adapt a real scan-link request into the UI `ImagingRequest` shape so the
 * existing Requests list render and `statusMeta` keep working unchanged.
 */
export function mapScanLinkToRequest(link: IScanLinkItem): ImagingRequest {
  const status = mapLinkStatus(link.status);
  const items: RequestItem[] = (link.scanItems ?? []).map((it) => ({
    tag: mapScanTypeToTag(it.scanType),
    label: [it.scanType, it.bodyPoint].filter(Boolean).join(' · '),
    status: itemStatus(it, status),
  }));

  return {
    id: link.id,
    center: link.center?.labCenterName || 'Imaging center',
    date: fmtCreated(link.createdAt),
    status,
    delivery: 'Secure link',
    patient: link.fullName,
    items,
  };
}

/**
 * Adapt a single-request `/scan/link/view` response into the UI `ImagingRequest`
 * shape. Like `mapScanLinkToRequest` but additionally carries the center contact
 * details and per-study dates the detail page renders.
 */
export function mapRequestViewToRequest(view: IRequestViewIdResponse): ImagingRequest {
  const status = mapLinkStatus(view.status);
  const items: RequestItem[] = (view.scanItems ?? []).map((it) => ({
    tag: mapScanTypeToTag(it.scanType),
    label: [it.scanType, it.bodyPoint].filter(Boolean).join(' · '),
    status: itemStatus(it, status),
    dateLabel: fmtCreated(it.scanDate) || undefined,
    reportUrl: it.reportUrl ?? null,
    scanItemId: it.id,
    linkId: view.id,
    uploadSource: it.uploadSource ?? null,
  }));

  const center = view.center;
  const centerPhone = center?.phoneNumber ? formatUSPhone(center.phoneNumber) : '';

  return {
    id: view.id,
    center: center?.labCenterName || 'Imaging center',
    date: fmtCreated(view.createdAt),
    status,
    delivery: 'Secure link',
    patient: view.fullName,
    items,
    centerAddr: center?.location || '',
    centerEmail: center?.email || '',
    centerPhone,
    mrn: view.patientId || undefined,
  };
}
