import { useState } from 'react';
import { Icon } from '@/components/common/Icon';
import { StudyIcon } from '@/components/common/StudyIcon';
import { useDomainData } from '@/hooks/useDomainData';
import { useNavStore } from '@/store/navStore';
import { useDialogStore } from '@/store/dialogStore';
import { useOpenShare } from '@/features/share/useOpenShare';
import type { Study } from '@/types';

export function ImagesScreen() {
  const { allStudies, showingAllPatients, patientMatches } = useDomainData();
  const nav = useNavStore();
  const openImgDetail = useDialogStore((s) => s.openImgDetail);
  const { shareStudies } = useOpenShare();

  const [query, setQuery] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Array<Study['id']>>([]);

  const readyStudies = allStudies.filter((x) => x.status === 'ready' && patientMatches(x.patient));
  const filtered = readyStudies.filter((x) =>
    `${x.name} ${x.place} ${x.date} ${x.patient ?? ''}`.toLowerCase().includes(query.toLowerCase()),
  );

  const openViewer = (x: Study) =>
    nav.openViewer({ from: 'images', studyId: x.id, tab: x.hasImages === false ? 'report' : 'images' });

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
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button className="search-clear" onClick={() => setQuery('')}>
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

      {filtered.map((s) => {
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
    </div>
  );
}
