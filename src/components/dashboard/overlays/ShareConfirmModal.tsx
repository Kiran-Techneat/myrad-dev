import { Icon } from '@/components/common/Icon';
import { useShareStore } from '@/store/dashboard/shareStore';

export function ShareConfirmModal() {
  const { shareConfirmOpen, shareConfirmData, closeConfirm } = useShareStore();
  if (!shareConfirmOpen || !shareConfirmData) return null;

  const { studies, recipients, person } = shareConfirmData;
  const recipientsLine = recipients.map((r) => r.name).join(', ');
  const studiesCountLabel = `${studies.length} ${studies.length === 1 ? 'study' : 'studies'}`;

  return (
    <div className="getsheet-scrim" onClick={closeConfirm}>
      <div className="getsheet-card share-confirm-card" onClick={(e) => e.stopPropagation()}>
        <div className="share-confirm-check">
          <Icon name="checkThick" sw={2.5} />
        </div>
        <h3 className="serif" style={{ textAlign: 'center' }}>
          Shared successfully
        </h3>
        <p style={{ textAlign: 'center' }}>
          {studiesCountLabel} for {person} sent to {recipientsLine}.
        </p>

        <div className="sc-block">
          <div className="sc-block-hd">What was shared</div>
          {studies.map((st, i) => (
            <div key={i} className="sc-row">
              <span className="sc-row-nm">{st.name}</span>
              <span className="sc-row-tag">{st.contents}</span>
            </div>
          ))}
        </div>

        <div className="sc-block">
          <div className="sc-block-hd">Sent to</div>
          {recipients.map((r, i) => (
            <div key={i} className="sc-recipient">
              <div className="share-provider-av">{r.init}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="share-provider-nm">{r.name}</div>
                <div className="share-provider-spec">{r.spec}</div>
              </div>
              <span className="sc-method">
                {r.method} · {r.methodDetail}
              </span>
            </div>
          ))}
        </div>

        <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} onClick={closeConfirm}>
          Done
        </button>
      </div>
    </div>
  );
}
