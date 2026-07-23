import { useState } from 'react';
import { useDialogStore } from '@/store/dashboard/dialogStore';

export function BillingScreen() {
  const showNotice = useDialogStore((s) => s.showNotice);
  const [autoRenew, setAutoRenew] = useState(true);

  return (
    <div className="wrap" style={{ maxWidth: 1080 }}>
      <div className="pagehd">
        <div>
          <div className="kicker">Your account</div>
          <div className="h1 serif">Billing &amp; Plans</div>
        </div>
      </div>

      <div className="bill-cur">
        <div className="bill-cur-top">
          <div>
            <div className="bill-cur-plan">
              <span className="bill-cur-dot" />
              Trial Plan
            </div>
            <div className="bill-cur-meta">Expires Jul 7, 2026 · Upgrade to unlock unlimited access</div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => showNotice('Redirecting…', "You're being redirected to secure payment.")}
          >
            ⚡ Upgrade to Annual
          </button>
        </div>
        <div className="bill-usage-grid">
          <div>
            <div className="bill-usage-lbl-row">
              <span className="bill-usage-lbl">Imaging requests</span>
              <span className="bill-usage-cnt warn">3 / 5 used</span>
            </div>
            <div className="bill-usage-track">
              <div className="bill-usage-fill warn" style={{ width: '60%' }} />
            </div>
          </div>
          <div>
            <div className="bill-usage-lbl-row">
              <span className="bill-usage-lbl">Doctor shares</span>
              <span className="bill-usage-cnt danger">1 / 1 used</span>
            </div>
            <div className="bill-usage-track">
              <div className="bill-usage-fill danger" style={{ width: '100%' }} />
            </div>
          </div>
          <div>
            <div className="bill-usage-lbl-row">
              <span className="bill-usage-lbl">AI report summaries</span>
              <span className="bill-usage-cnt warn">1 / 2 used</span>
            </div>
            <div className="bill-usage-track">
              <div className="bill-usage-fill warn" style={{ width: '50%' }} />
            </div>
          </div>
          <div>
            <div className="bill-usage-lbl-row">
              <span className="bill-usage-lbl">Trial period</span>
              <span className="bill-usage-cnt">1 / 14 days</span>
            </div>
            <div className="bill-usage-track">
              <div className="bill-usage-fill" style={{ width: '7%' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="bill-plans">
        <div className="bill-plan dim">
          <div className="bill-plan-tag current-tag">✓ Current plan</div>
          <div className="bill-plan-name serif">Trial</div>
          <div className="bill-plan-tagline">Try before you commit</div>
          <div className="bill-price-row">
            <span className="bill-price-amt">$0</span>
            <span className="bill-price-per">/ 14 days</span>
          </div>
          <ul className="bill-feats">
            <li><span className="bill-feat-dot">✓</span>5 imaging requests</li>
            <li><span className="bill-feat-dot">✓</span>14 days of storage</li>
            <li><span className="bill-feat-dot">✓</span>Share with 1 doctor</li>
            <li><span className="bill-feat-dot">✓</span>2 AI report summaries</li>
          </ul>
          <button className="bill-plan-btn muted" disabled>
            Current plan
          </button>
        </div>
        <div className="bill-plan featured">
          <div className="bill-plan-tag best-tag">★ Best value</div>
          <div className="bill-plan-name serif">Annual Unlimited</div>
          <div className="bill-plan-tagline">Everything, for good</div>
          <div className="bill-price-row">
            <span className="bill-price-amt">$49</span>
            <span className="bill-price-per">/ year</span>
          </div>
          <ul className="bill-feats">
            <li><span className="bill-feat-dot">✓</span>Unlimited imaging requests</li>
            <li><span className="bill-feat-dot">✓</span>Lifetime storage</li>
            <li><span className="bill-feat-dot">✓</span>Unlimited doctor shares</li>
            <li><span className="bill-feat-dot">✓</span>Unlimited AI report summaries</li>
            <li><span className="bill-feat-dot">✓</span>Priority support</li>
          </ul>
          <button
            className="bill-plan-btn inv"
            onClick={() => showNotice('Redirecting…', "You're being redirected to secure payment.")}
          >
            Choose Annual →
          </button>
        </div>
        <div className="bill-plan">
          <div className="bill-plan-tag" style={{ visibility: 'hidden' }}>·</div>
          <div className="bill-plan-name serif">Pay Per Use</div>
          <div className="bill-plan-tagline">Only pay when you need it</div>
          <div className="bill-price-row">
            <span className="bill-price-amt">$9</span>
            <span className="bill-price-per">/ request</span>
          </div>
          <ul className="bill-feats">
            <li><span className="bill-feat-dot">✓</span>No commitment needed</li>
            <li><span className="bill-feat-dot">✓</span>1 year storage per study</li>
            <li><span className="bill-feat-dot">✓</span>Unlimited shares per study</li>
            <li><span className="bill-feat-dot">✓</span>$2 per AI report summary</li>
          </ul>
          <button
            className="bill-plan-btn secondary"
            onClick={() => showNotice('Plan updated', "You've switched to Pay Per Use.")}
          >
            Switch to Pay Per Use
          </button>
        </div>
      </div>

      <div className="bill-renew">
        <div className="bill-renew-txt">
          <b>Auto-renew</b>
          Automatically renew your plan when it expires
        </div>
        <button className={`bill-switch ${autoRenew ? 'on' : ''}`} onClick={() => setAutoRenew((v) => !v)}>
          <i />
        </button>
      </div>

      <div className="bill-bottom">
        <div className="bill-section">
          <div className="bill-sec-hd">Payment method</div>
          <div className="bill-pm-empty">
            <div className="bill-pm-empty-ico">
              <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </div>
            <div className="bill-pm-empty-txt">
              No payment method on file.
              <br />
              Add a card to enable upgrades.
            </div>
            <button
              className="btn btn-ghost btn-block"
              onClick={() => showNotice('Redirecting…', "You're being redirected to secure card entry.")}
            >
              + Add payment method
            </button>
          </div>
        </div>
        <div className="bill-section">
          <div className="bill-sec-hd">Billing history</div>
          <div className="bill-hist-empty">
            No invoices yet. Your billing history will appear here after your first payment.
          </div>
        </div>
      </div>
    </div>
  );
}
