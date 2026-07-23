import { useState } from 'react';
import { Icon } from '@/components/common/Icon';
import { useDomainData } from '@/hooks/useDomainData';
import { useAppNavigate } from '@/hooks/useAppNavigate';
import { useDialogStore } from '@/store/dashboard/dialogStore';
import { statusMeta } from '@/utils/status';
import type { ImagingRequest } from '@/types';
import { cx } from '@/utils/cx';
import styles from './requests.module.scss';

type Filter = 'all' | 'progress' | 'ready' | 'cancelled';

const PILLS: { k: Filter; l: string }[] = [
  { k: 'all', l: 'All' },
  { k: 'progress', l: 'In progress' },
  { k: 'ready', l: 'Ready' },
  { k: 'cancelled', l: 'Cancelled' },
];

const FILTER_FN: Record<Filter, (r: ImagingRequest) => boolean> = {
  all: () => true,
  progress: (r) => r.status === 'pending' || r.status === 'partial',
  ready: (r) => r.status === 'ready',
  cancelled: (r) => r.status === 'cancelled',
};

export function RequestsScreen() {
  const { requests, patientMatches } = useDomainData();
  const nav = useAppNavigate();
  const openGetSheet = useDialogStore((s) => s.openGetSheet);

  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const filtered = requests
    .filter(FILTER_FN[filter])
    .filter((r) => patientMatches(r.patient))
    .filter((r) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      const hay = [r.center, r.patient, r.id, ...r.items.map((it) => it.label)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });

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
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button className="search-clear" onClick={() => setQuery('')}>
            <Icon name="x" sw={2.4} />
          </button>
        )}
      </div>

      <div className={styles.fpills}>
        {PILLS.map((p) => (
          <button
            key={p.k}
            className={cx(styles.fpill, filter === p.k && styles.on)}
            onClick={() => setFilter(p.k)}
          >
            {p.l}
          </button>
        ))}
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
    </div>
  );
}
