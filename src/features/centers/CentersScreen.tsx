import { useState } from 'react';
import { Icon } from '@/components/common/Icon';
import { useDomainData } from '@/hooks/useDomainData';
import { useFormsStore } from '@/store/formsStore';
import type { Center } from '@/types';

function centerHay(c: Center): string {
  return [c.name, c.address, c.phone, c.email, c.fax].filter(Boolean).join(' ').toLowerCase();
}

export function CentersScreen() {
  const { centers } = useDomainData();
  const openAddCenter = useFormsStore((s) => s.openAddCenter);
  const [query, setQuery] = useState('');

  const list = centers.filter((c) => centerHay(c).includes(query.toLowerCase()));

  return (
    <div className="wrap" style={{ maxWidth: 1080 }}>
      <div className="centers-hd">
        <div>
          <div className="kicker">Your account</div>
          <div className="h1 serif" style={{ fontSize: 26 }}>
            Imaging centers
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => openAddCenter('management')}>
          + Add a center
        </button>
      </div>

      <div className="search" style={{ maxWidth: 480 }}>
        <Icon name="search" />
        <input
          type="text"
          placeholder="Search by name or city…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button className="search-clear" onClick={() => setQuery('')}>
            <Icon name="x" sw={2.4} />
          </button>
        )}
      </div>

      <div className="centers-grid">
        {list.map((c) => (
          <div key={c.id} className="center-card" style={{ cursor: 'default' }}>
            <div className="center-ico">
              <Icon name="building" />
            </div>
            <div className="study-bd">
              <div className="center-nm">{c.name}</div>
              <div className="center-sub">{c.address}</div>
              <div className="center-contacts">
                {c.phone && (
                  <span className="center-contact">
                    <Icon name="phone" />
                    {c.phone}
                  </span>
                )}
                {c.email && (
                  <span className="center-contact">
                    <Icon name="mail" />
                    {c.email}
                  </span>
                )}
                {c.fax && (
                  <span className="center-contact">
                    <Icon name="fax" />
                    Fax {c.fax}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
