import { Icon } from '@/components/common/Icon';
import { useDomainData } from '@/hooks/useDomainData';
import { useShareStore } from '@/store/dashboard/shareStore';
import { useFormsStore } from '@/store/dashboard/formsStore';
import { useCreateShares } from '@/hooks/mutations';
import type { Share } from '@/types';

export function ShareModal() {
  const { providers } = useDomainData();
  const store = useShareStore();
  const openAddProvider = useFormsStore((s) => s.openAddProvider);
  const createShares = useCreateShares();

  if (!store.shareOpen) return null;

  const filteredProviders = providers
    .map((p, idx) => ({ ...p, idx }))
    .filter(
      (p) =>
        !store.shareSearch ||
        [p.name, p.spec, p.phone, p.email, p.fax]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(store.shareSearch.toLowerCase()),
    );

  const submitDisabled = store.shareProviderIds.length === 0 || store.shareItems.length === 0;

  const submit = () => {
    if (submitDisabled) return;
    const studies = store.shareItems.map((it) => ({
      name: it.name,
      contents: it.images && it.report ? 'Images & report' : it.images ? 'Images only' : 'Report only',
    }));
    const person = store.shareItems[0]?.patient || 'John Doe';
    const provs = store.shareProviderIds.map((i) => providers[i]);
    const newShares: Share[] = provs.map((prov) => ({
      study: store.shareStudyName,
      person,
      provider: prov.name,
      spec: prov.spec,
      init: prov.init,
      date: 'June 30, 2026',
      viewed: false,
      studies,
    }));
    const recipients = provs.map((prov) => ({
      name: prov.name,
      spec: prov.spec,
      init: prov.init,
      method: prov.email ? 'Email' : prov.fax ? 'Fax' : 'Email',
      methodDetail: prov.email || prov.fax || '',
    }));

    createShares.mutate(newShares);
    store.closeShare();
    store.openConfirm({ person, studies, recipients });
  };

  return (
    <div className="getsheet-scrim" onClick={store.closeShare}>
      <div className="getsheet-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="serif">Share securely</h3>
        <p>
          Review what you&apos;re sharing, choose who to send it to. They&apos;ll receive secure access
          to the items you select.
        </p>

        {store.shareItems.map((it, i) => (
          <div key={i} className="share-item-card">
            <div className="share-item-top">
              <div className="share-item-ico">
                <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
              <div className="share-item-bd">
                <div className="share-item-nm">{it.name}</div>
                <div className="share-item-sub">{it.patient}</div>
              </div>
              <button className="share-item-x" onClick={() => store.removeItem(i)}>
                <Icon name="x" sw={2.4} />
              </button>
            </div>
            <div className="share-item-chips">
              <button className={`sic-chip ${it.images ? 'on' : ''}`} onClick={() => store.toggleItemImg(i)}>
                <Icon name="check" sw={3} />
                Images
              </button>
              {it.reportAvailable ? (
                <button className={`sic-chip ${it.report ? 'on' : ''}`} onClick={() => store.toggleItemRep(i)}>
                  <Icon name="check" sw={3} />
                  Report
                </button>
              ) : (
                <span className="sic-chip static">Images only</span>
              )}
            </div>
          </div>
        ))}

        {store.shareItems.length > 1 && (
          <div className="share-note">
            <Icon name="info" />
            <span>
              Images and reports (where available) will be shared for all {store.shareItems.length}{' '}
              studies.
            </span>
          </div>
        )}

        <div className="added-strip-hd sendto-hd" style={{ marginTop: 18 }}>
          <span>Send to</span>
          <button className="sendto-add" onClick={openAddProvider}>
            <Icon name="plus" sw={2.4} />
            Add new
          </button>
        </div>

        <div className="search sendto-search">
          <Icon name="search" />
          <input
            type="text"
            placeholder="Search by name, email, phone, fax, specialty…"
            value={store.shareSearch}
            onChange={(e) => store.setSearch(e.target.value)}
          />
        </div>

        {filteredProviders.map((p) => (
          <button
            key={p.idx}
            className={`share-provider ${store.shareProviderIds.includes(p.idx) ? 'sel' : ''}`}
            onClick={() => store.toggleProvider(p.idx)}
          >
            <div className="share-provider-av">{p.init}</div>
            <div>
              <div className="share-provider-nm">{p.name}</div>
              <div className="share-provider-spec">{p.spec}</div>
            </div>
          </button>
        ))}

        <div className="af-btns">
          <button className="btn btn-ghost" onClick={store.closeShare}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={submit} disabled={submitDisabled}>
            Share securely
          </button>
        </div>
      </div>
    </div>
  );
}
