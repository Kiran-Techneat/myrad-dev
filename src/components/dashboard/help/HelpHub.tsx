import { useLocation } from 'react-router-dom';
import { Icon } from '@/components/common/Icon';
import { useDialogStore } from '@/store/dashboard/dialogStore';
import { useNavStore } from '@/store/dashboard/navStore';
import { screenFromPath, staffViewFromPath } from '@/routes/paths';
import { useDomainData } from '@/hooks/useDomainData';
import { fmtLong } from '@/utils/format';

export function HelpHub() {
  const { helpOpen, help, closeHelp, setHelp, setHelpView, sendChat, showNotice } = useDialogStore();
  const { pathname } = useLocation();
  const selectedReqId = useNavStore((s) => s.selectedReqId);
  const { requests, centers, people } = useDomainData();

  if (!helpOpen) return null;

  const isStaffCtx = screenFromPath(pathname) === 'staff' && staffViewFromPath(pathname) !== 'walkin';
  const testReq =
    requests.find((r) => r.id === selectedReqId) ??
    requests.find((r) => r.items.some((it) => it.status === 'pending')) ??
    requests[0];
  const centerFallback = centers.find((c) => c.name === testReq?.center);
  const patient = people.find((p) => p.name === testReq?.patient);

  const back = (
    <button className="help-back" onClick={() => setHelpView('hub')}>
      <Icon name="chevronLeft" sw={2.4} style={{ width: 14, height: 14 }} />
      Back
    </button>
  );

  return (
    <div className="getsheet-scrim" onClick={closeHelp}>
      <div className="getsheet-card" onClick={(e) => e.stopPropagation()}>
        {help.view === 'hub' && (
          <>
            <h3 className="serif">How can we help?</h3>
            <p>Get support without leaving MyRad.</p>
            <button className="help-hub-item" onClick={() => setHelpView('chat')}>
              <div className="help-hub-ico">
                <Icon name="chat" sw={1.9} />
              </div>
              <div>
                <div className="help-hub-nm">Live Chat</div>
                <div className="help-hub-sub">Talk to a MyRad specialist now</div>
              </div>
            </button>
            <button className="help-hub-item" onClick={() => setHelpView('feedback')}>
              <div className="help-hub-ico">
                <Icon name="star" sw={1.9} />
              </div>
              <div>
                <div className="help-hub-nm">Send Feedback</div>
                <div className="help-hub-sub">Tell us what&apos;s working, or not</div>
              </div>
            </button>
            <button
              className="help-hub-item"
              style={{ marginBottom: 0 }}
              onClick={() =>
                setHelp({ view: 'contact', contactEmail: help.contactEmail || centerFallback?.email || '' })
              }
            >
              <div className="help-hub-ico">
                <Icon name="help" sw={1.9} />
              </div>
              <div>
                <div className="help-hub-nm">{isStaffCtx ? 'Contact MyRad Support' : 'Contact Support'}</div>
                <div className="help-hub-sub">Email our team directly</div>
              </div>
            </button>
          </>
        )}

        {help.view === 'chat' && (
          <>
            {back}
            <h3 className="serif">Live Chat</h3>
            <p>
              MyRad Support · <span className="chat-online">online</span>
            </p>
            <div style={{ maxHeight: 280, overflowY: 'auto', marginBottom: 14 }}>
              {help.chatLog.map((mmsg, i) => (
                <div key={i} className={`chat-bubble ${mmsg.who}`}>
                  {mmsg.text}
                </div>
              ))}
            </div>
            <div className="chat-row">
              <input
                className="inp"
                type="text"
                placeholder="Type a message…"
                value={help.chatInput}
                onChange={(e) => setHelp({ chatInput: e.target.value })}
              />
              <button className="btn btn-primary" disabled={!help.chatInput.trim()} onClick={sendChat}>
                Send
              </button>
            </div>
          </>
        )}

        {help.view === 'feedback' && (
          <>
            {back}
            <h3 className="serif">Send feedback</h3>
            {isStaffCtx ? (
              <>
                <p>This goes straight to MyRad support and admin team, along with this request&apos;s details.</p>
                <div className="pv-infocard2" style={{ marginBottom: 18 }}>
                  <div>
                    <div className="ap-k">Request</div>
                    <div className="pvv">{testReq?.id}</div>
                  </div>
                  <div>
                    <div className="ap-k">Imaging center</div>
                    <div className="pvv">
                      {testReq?.center} — {centerFallback?.address}
                    </div>
                  </div>
                  <div>
                    <div className="ap-k">Patient</div>
                    <div className="pvv">
                      {testReq?.patient} · DOB {fmtLong(patient?.dob ?? '') || '—'} · MRN{' '}
                      {testReq?.mrn || 'Not provided'}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p>This goes straight to MyRad support and admin team.</p>
                <div className="field" style={{ marginBottom: 18 }}>
                  <label>From</label>
                  <div className="inp" style={{ display: 'flex', alignItems: 'center', fontWeight: 700 }}>
                    John Doe
                  </div>
                </div>
              </>
            )}
            <div className="field">
              <label>Your feedback</label>
              <textarea
                className="inp"
                style={{ height: 100, padding: '16px 18px', resize: 'none' }}
                placeholder="Tell us what's working, what's not, or what you'd like to see…"
                value={help.feedbackMsg}
                onChange={(e) => setHelp({ feedbackMsg: e.target.value })}
              />
            </div>
            <div className="field">
              <label>
                Attachment <span className="ac-note">optional</span>
              </label>
              <input
                className="inp"
                style={{ padding: '12px 18px' }}
                type="file"
                onChange={(e) => setHelp({ feedbackFileName: e.target.files?.[0]?.name ?? '' })}
              />
            </div>
            <div className="af-btns">
              <button className="btn btn-ghost" onClick={closeHelp}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                disabled={!help.feedbackMsg.trim()}
                onClick={() => {
                  setHelp({ view: 'hub', feedbackMsg: '', feedbackFileName: '' });
                  closeHelp();
                  showNotice('Feedback sent', 'Thanks — your feedback was sent to the MyRad support and admin team.');
                }}
              >
                Send feedback
              </button>
            </div>
          </>
        )}

        {help.view === 'contact' && (
          <>
            {back}
            <h3 className="serif">{isStaffCtx ? 'Contact MyRad support' : 'Contact Support'}</h3>
            <p>
              {isStaffCtx
                ? 'Having trouble with this request or the portal? Send us a note and our team will follow up by email.'
                : 'Send us a note and our team will follow up by email.'}
            </p>
            <div className="field">
              <label>Your email</label>
              <input
                className="inp"
                type="email"
                placeholder="you@example.com"
                value={help.contactEmail}
                onChange={(e) => setHelp({ contactEmail: e.target.value })}
              />
            </div>
            <div className="field">
              <label>What&apos;s going on?</label>
              <textarea
                className="inp"
                style={{ height: 110, padding: '16px 18px', resize: 'none' }}
                placeholder="Describe the issue or question…"
                value={help.contactMsg}
                onChange={(e) => setHelp({ contactMsg: e.target.value })}
              />
            </div>
            <div className="af-btns">
              <button className="btn btn-ghost" onClick={closeHelp}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                disabled={!help.contactMsg.trim() || !help.contactEmail.trim()}
                onClick={() => {
                  setHelp({ view: 'hub', contactMsg: '' });
                  closeHelp();
                  showNotice('Sent to support', 'Our team will follow up by email shortly.');
                }}
              >
                Send to support
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
