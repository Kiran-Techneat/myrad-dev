import { useState } from 'react';
import { Icon } from '@/components/common/Icon';
import { useDomainData } from '@/hooks/useDomainData';
import { useNavStore } from '@/store/navStore';
import { useDialogStore } from '@/store/dialogStore';
import { statusMeta } from '@/utils/status';
import type { ImagingRequest } from '@/types';

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
  const nav = useNavStore();
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
        <button className="hero-mini" onClick={openGetSheet}>
          <div className="hero-mini-ico">
            <Icon name="upload" />
          </div>
          <div>
            <div className="hero-mini-nm">Get my images</div>
            <div className="hero-mini-sub">Request studies from a new center</div>
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

      <div className="fpills">
        {PILLS.map((p) => (
          <button
            key={p.k}
            className={`fpill ${filter === p.k ? 'on' : ''}`}
            onClick={() => setFilter(p.k)}
          >
            {p.l}
          </button>
        ))}
      </div>

      {filtered.map((r) => {
        const meta = statusMeta(r.status);
        return (
          <div key={r.id} className="rq" onClick={() => nav.openRequestDetail(r.id)}>
            <div className="rq-top">
              <div className="rq-center">{r.center}</div>
              <span className={`chip ${meta.cls}`}>{meta.label}</span>
            </div>
            <div className="rq-meta">
              {r.patient} · {r.date} · {r.id}
            </div>
            <div className="rq-studies">
              {r.items.map((it, i) => {
                const dot =
                  it.status === 'ready' ? 'ready' : it.status === 'cancelled' ? 'cancelled' : 'pending';
                return (
                  <span key={i} className={`rq-st ${it.status === 'cancelled' ? 'cancelled' : ''}`}>
                    <span className={`dot ${dot}`} />
                    <span className="rq-st-label">{it.label}</span>
                  </span>
                );
              })}
            </div>
            <div className="rq-foot">
              <span className="rq-deliv">
                <Icon name="send" sw={1.8} />
                {r.delivery}
              </span>
              <span className="rq-open">
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
