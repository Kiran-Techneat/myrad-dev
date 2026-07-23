import { useState } from 'react';
import { Icon } from '@/components/common/Icon';
import { useDomainData } from '@/hooks/useDomainData';
import { useAppNavigate } from '@/hooks/useAppNavigate';
import { useDialogStore } from '@/store/dashboard/dialogStore';
import { useDeleteShare } from '@/hooks/mutations';

export function SharedScreen() {
  const { shares, patientMatches } = useDomainData();
  const nav = useAppNavigate();
  const dialog = useDialogStore();
  const deleteShare = useDeleteShare();

  const [query, setQuery] = useState('');

  const rows = shares
    .map((sh, i) => ({ sh, i }))
    .filter(
      ({ sh }) =>
        patientMatches(sh.person) &&
        `${sh.provider} ${sh.study} ${sh.person}`.toLowerCase().includes(query.toLowerCase()),
    );

  return (
    <div className="wrap">
      <div className="pagehd">
        <div>
          <div className="kicker">Shared</div>
          <div className="h1 serif" style={{ fontSize: 26 }}>
            Studies you&apos;ve shared with your doctors
          </div>
        </div>
      </div>

      <div className="search" style={{ maxWidth: 480 }}>
        <Icon name="search" />
        <input
          type="text"
          placeholder="Search by provider, study, or patient…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button className="search-clear" onClick={() => setQuery('')}>
            <Icon name="x" sw={2.4} />
          </button>
        )}
      </div>

      <div className="sec-note">
        <Icon name="calendar" />
        Dates shown are when each study was shared.
      </div>

      {rows.map(({ sh, i }) => (
        <div key={i} className="shr">
          <div className="shr-top">
            <div className="shr-av">{sh.init}</div>
            <div className="shr-bd">
              <div className="shr-nm">{sh.provider}</div>
              <div className="shr-spec">{sh.spec}</div>
            </div>
            <span className={`svw ${sh.viewed ? 'yes' : 'no'}`}>
              {sh.viewed ? 'Viewed' : 'Not yet viewed'}
            </span>
          </div>

          <div className="shr-studies">
            {sh.studies.map((st2, j) => (
              <div key={j} className="shr-study-row">
                <Icon name="image" sw={1.8} />
                <div className="shr-study-bd">
                  <span className="shr-study-nm">{st2.name}</span>
                  <span className="shr-study-sep">·</span>
                  <span className="shr-study-ct">{st2.contents}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="shr-contents">
            {sh.person} · <span className="shr-date">{sh.date}</span>
          </div>

          <div className="shr-foot2">
            <div className="shr-acts">
              <button
                className="shr-mini"
                onClick={() =>
                  nav.openNotify({
                    kind: 'share',
                    from: 'shared',
                    shareData: { provider: sh.provider, person: sh.person, study: sh.study, date: sh.date },
                  })
                }
              >
                <Icon name="mail" sw={1.8} />
                Notice
              </button>
              {!sh.viewed && (
                <button
                  className="shr-mini"
                  onClick={() =>
                    dialog.showNotice(
                      'Reminder sent',
                      `${sh.provider} has been notified to view the shared study.`,
                    )
                  }
                >
                  <Icon name="send" sw={1.8} />
                  Remind
                </button>
              )}
              {!sh.viewed && (
                <button
                  className="shr-mini danger"
                  onClick={() =>
                    dialog.askConfirm({
                      title: 'Revoke this share?',
                      msg: `${sh.provider} will permanently lose access to ${sh.study} for ${sh.person}. They will no longer be able to view the images or report, and this cannot be undone.`,
                      confirmLabel: 'Revoke access',
                      noticeTitle: 'Access revoked',
                      noticeMsg: `${sh.provider} no longer has access to ${sh.study}.`,
                      run: () => deleteShare.mutate(i),
                    })
                  }
                >
                  <Icon name="x" />
                  Revoke
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
