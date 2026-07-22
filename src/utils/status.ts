import type { AggregateStatus, RequestItem } from '@/types';

export interface StatusMeta {
  cls: string;
  label: string;
}

const META: Record<string, StatusMeta> = {
  ready: { cls: 'ready', label: 'Ready' },
  pending: { cls: 'pending', label: 'In progress' },
  partial: { cls: 'partial', label: 'Partly ready' },
  cancelled: { cls: 'cancelled', label: 'Cancelled' },
};

export function statusMeta(s: string): StatusMeta {
  return META[s] || { cls: 'pending', label: 'In progress' };
}

/** Roll item statuses up into the request-level aggregate status. */
export function computeReqStatus(items: RequestItem[]): AggregateStatus {
  const live = items.filter((it) => it.status !== 'cancelled');
  if (!live.length) return 'cancelled';
  if (live.every((it) => it.status === 'ready')) return 'ready';
  if (live.every((it) => it.status === 'pending')) return 'pending';
  return 'partial';
}
