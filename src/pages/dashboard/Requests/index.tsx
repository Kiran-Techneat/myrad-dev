import { useEffect, useState } from 'react';
import { Icon } from '@/components/common/Icon';
import { usePatientFilter } from '@/hooks/usePatientFilter';
import { useScanRequests } from '@/hooks/useScanRequests';
import { useAppNavigate } from '@/hooks/useAppNavigate';
import { useDialogStore } from '@/store/dashboard/dialogStore';
import { statusMeta } from '@/utils/status';
import { cx } from '@/utils/cx';
import styles from './requests.module.scss';

type Filter = 'all' | 'progress' | 'partial' | 'ready' | 'cancelled';

const PILLS: { k: Filter; l: string; status?: string }[] = [
  { k: 'all', l: 'All' },
  { k: 'progress', l: 'In progress', status: 'PENDING' },
  { k: 'partial', l: 'Partly ready', status: 'PartiallyUploaded' },
  { k: 'ready', l: 'Ready', status: 'COMPLETED' },
  { k: 'cancelled', l: 'Cancelled', status: 'REVOKED' },
];

const PAGE_SIZE = 10;

export function RequestsScreen() {
  const { patientMatches } = usePatientFilter();
  const { requests, data, requestDashboard, refresh } = useScanRequests();
  const nav = useAppNavigate();
  const openGetSheet = useDialogStore((s) => s.openGetSheet);

  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const status = PILLS.find((p) => p.k === filter)?.status;

  // Server-side search + status filter + pagination (debounced so typing doesn't
  // spam the API). Mirrors ImagesScreen.
  useEffect(() => {
    const t = setTimeout(() => {
      refresh({ searchString: query.trim(), status, page, size: PAGE_SIZE });
    }, 300);
    return () => clearTimeout(t);
  }, [query, status, page, refresh]);

  const onSearchChange = (v: string) => {
    setQuery(v);
    setPage(1);
  };

  const onFilterChange = (k: Filter) => {
    setFilter(k);
    setPage(1);
  };

  const totalPages = data?.totalpages ?? 1;
  const currentPage = data?.currentpage ?? page;

  // Active-patient filter is still applied client-side on the current page.
  const filtered = requests.filter((r) => patientMatches(r.patient));

  const countFor = (k: Filter): number | undefined => {
    if (!requestDashboard) return undefined;
    switch (k) {
      case 'all':
        return requestDashboard.total;
      case 'progress':
        return requestDashboard.pending;
      case 'partial':
        return requestDashboard.partiallyUploaded;
      case 'ready':
        return requestDashboard.completed;
      case 'cancelled':
        return requestDashboard.cancelledRequest;
    }
  };

  return (
    <div className="wrap">
      <div className="pagehd">
        <div>
          <div className="kicker">My requests</div>
          <div className="h1 serif" style={{ fontSize: 26 }}>
            Studies you&apos;ve asked centers to send
          </div>
        </div>
        <button className={styles["hero-mini"]} onClick={openGetSheet}>
          <div className={styles["hero-mini-ico"]}>
            <Icon name="upload" />
          </div>
          <div>
            <div className={styles["hero-mini-nm"]}>Get my images</div>
            <div className={styles["hero-mini-sub"]}>Request studies from a new center</div>
          </div>
          <Icon name="chevronRight" sw={2.4} style={{ width: 18, height: 18, flex: 'none', opacity: 0.8 }} />
        </button>
      </div>

      <div className="sec-note">
        <Icon name="calendar" />
        Dates shown are when each request was submitted.
      </div>

      <div className="search" style={{ maxWidth: 480 }}>
        <Icon name="search" />
        <input
          type="text"
          placeholder="Search study, body part, center or patient"
          value={query}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {query && (
          <button className="search-clear" onClick={() => onSearchChange('')}>
            <Icon name="x" sw={2.4} />
          </button>
        )}
      </div>

      <div className={styles.fpills}>
        {PILLS.map((p) => {
          const c = countFor(p.k);
          return (
            <button
              key={p.k}
              className={cx(styles.fpill, filter === p.k && styles.on)}
              onClick={() => onFilterChange(p.k)}
            >
              {p.l}
              {c != null && ` (${c})`}
            </button>
          );
        })}
      </div>

      {filtered.map((r) => {
        const meta = statusMeta(r.status);
        return (
          <div key={r.id} className={styles.rq} onClick={() => nav.openRequestDetail(r.id)}>
            <div className={styles["rq-top"]}>
              <div className={styles["rq-center"]}>{r.center}</div>
              <span className={`chip ${meta.cls}`}>{meta.label}</span>
            </div>
            <div className={styles["rq-meta"]}>
              {r.patient} · {r.date} · {r.id}
            </div>
            <div className={styles["rq-studies"]}>
              {r.items.map((it, i) => {
                const dot =
                  it.status === 'ready' ? 'ready' : it.status === 'cancelled' ? 'cancelled' : 'pending';
                return (
                  <span key={i} className={cx(styles["rq-st"], it.status === "cancelled" && styles.cancelled)}>
                    <span className={`dot ${dot}`} />
                    <span className={styles["rq-st-label"]}>{it.label}</span>
                  </span>
                );
              })}
            </div>
            <div className={styles["rq-foot"]}>
              <span className={styles["rq-deliv"]}>
                <Icon name="send" sw={1.8} />
                {r.delivery}
              </span>
              <span className={styles["rq-open"]}>
                Details
                <Icon name="chevronRight" sw={2.2} />
              </span>
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div
          className="center-empty"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            minHeight: '46vh',
            color: 'var(--ink2)',
          }}
        >
          <div
            className="center-empty-title"
            style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}
          >
            No request created
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            marginTop: 18,
          }}
        >
          <button
            className="btn btn-ghost"
            style={{ maxWidth: 120 }}
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <Icon name="chevronLeft" sw={1.8} />
            Prev
          </button>
          <span style={{ fontSize: 14, color: 'var(--ink2)' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-ghost"
            style={{ maxWidth: 120 }}
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
            <Icon name="chevronRight" sw={1.8} />
          </button>
        </div>
      )}
    </div>
  );
}
