import { useEffect, useState } from 'react';
import { Icon } from '@/components/common/Icon';
import { StudyIcon } from '@/components/common/StudyIcon';
import { usePatientFilter } from '@/hooks/usePatientFilter';
import { useMyStudies } from '@/hooks/useMyStudies';
import { useAppNavigate } from '@/hooks/useAppNavigate';
import { useDialogStore } from '@/store/dashboard/dialogStore';
import { useOpenShare } from '@/hooks/useOpenShare';
import type { Study } from '@/types';

const PAGE_SIZE = 10;

export function ImagesScreen() {
  const { showingAllPatients, patientMatches } = usePatientFilter();
  const { studies, data, refresh } = useMyStudies();
  const nav = useAppNavigate();
  const openImgDetail = useDialogStore((s) => s.openImgDetail);
  const { shareStudies } = useOpenShare();

  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Array<Study['id']>>([]);

  // Server-side search + pagination (debounced so typing doesn't spam the API).
  useEffect(() => {
    const t = setTimeout(() => {
      refresh({ searchString: query.trim(), page, size: PAGE_SIZE });
    }, 300);
    return () => clearTimeout(t);
  }, [query, page, refresh]);

  const onSearchChange = (v: string) => {
    setQuery(v);
    setPage(1);
  };

  const totalPages = data?.totalpages ?? 1;
  const currentPage = data?.currentpage ?? page;

  // Patient / status filter still applied client-side on the current page.
  const readyStudies = studies.filter((x) => x.status === 'ready' && patientMatches(x.patient));

  const openViewer = (x: Study) => {
    if (x.hasImages === false) {
      nav.openViewer({ from: 'images', studyId: x.id, tab: 'report' });
    } else {
      nav.openImageViewer(x);
    }
  };

  const toggleSelect = (id: Study['id']) =>
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));

  const shareSelected = () => {
    const list = readyStudies.filter((x) => selectedIds.includes(x.id));
    shareStudies(list);
    setSelectMode(false);
    setSelectedIds([]);
  };

  return (
    <div className="wrap">
      <div className="pagehd">
        <div>
          <div className="kicker">My images</div>
          <div className="h1 serif" style={{ fontSize: 26 }}>
            Studies ready to view &amp; share
          </div>
        </div>
      </div>
      <div className="sec-note">
        <Icon name="calendar" />
        Dates shown are when each study was performed.
      </div>

      <div className="search" style={{ maxWidth: 480 }}>
        <Icon name="search" />
        <input
          type="text"
          placeholder="Search name, type or body part"
          value={query}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {query && (
          <button className="search-clear" onClick={() => onSearchChange('')}>
            <Icon name="x" sw={2.4} />
          </button>
        )}
      </div>

      <div className="imsel-row">
        {!selectMode ? (
          <button
            className="imsel-link"
            onClick={() => {
              setSelectMode(true);
              setSelectedIds([]);
            }}
          >
            <Icon name="check" sw={1.8} />
            Select to share multiple
          </button>
        ) : (
          <div className="imsel-active">
            <span className="imsel-count">{selectedIds.length} selected</span>
            <button
              className="imsel-link"
              onClick={() => {
                setSelectMode(false);
                setSelectedIds([]);
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {readyStudies.map((s) => {
        const sel = selectedIds.includes(s.id);
        return (
          <div
            key={s.id}
            className={`study img-row ${sel ? 'sel-row' : ''}`}
            onClick={() => (selectMode ? toggleSelect(s.id) : openViewer(s))}
          >
            {selectMode && (
              <div className={`study-check ${sel ? 'on' : ''}`}>
                <Icon name="check" sw={3} />
              </div>
            )}
            <div className="study-ico">
              <StudyIcon tag={s.tag} />
            </div>
            <div className="study-bd">
              <div className="study-nm">
                {s.name}
                {s.selfUploaded && <span className="self-badge">Self-uploaded</span>}
              </div>
              <div className="study-sub">
                {s.place} · {s.date}
                {showingAllPatients && ` · ${s.patient}`}
              </div>
            </div>
            {!selectMode && (
              <div className="study-acts">
                <button
                  className="study-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    openViewer(s);
                  }}
                >
                  <Icon name="eye" />
                  View
                </button>
                <button
                  className="kebab-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    openImgDetail(s.id);
                  }}
                >
                  <Icon name="kebab" />
                </button>
              </div>
            )}
          </div>
        );
      })}

      {readyStudies.length === 0 && (
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
            No images added
          </div>
        </div>
      )}

      {selectMode && (
        <button
          className="btn btn-primary btn-block btn-share"
          style={{ marginTop: 14 }}
          disabled={selectedIds.length === 0}
          onClick={shareSelected}
        >
          <Icon name="share" sw={1.8} />
          Share selected with Healthcare Provider, Family or Friend
        </button>
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
