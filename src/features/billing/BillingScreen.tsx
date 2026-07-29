import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { getBillingStatus, checkoutAnnual, checkoutPayPerUse } from '@/redux/billing/action';
import { isProvisioned, planLabelOf } from '@/utils/entitlements';
import type { Entitlements, Plan } from '@/utils/entitlements';

// Credits/subscriptions are provisioned by the Stripe webhook, which can land after the browser
// is redirected back. Poll briefly rather than showing the pre-payment plan.
const POLL_ATTEMPTS = 10;
const POLL_INTERVAL_MS = 2000;
const TOAST_DURATION_MS = 9000;
// The confirmation toast replaces itself in place as the poll resolves, so the user sees one
// notification move from "confirming" to its outcome rather than a stack of three.
const CONFIRM_TOAST_ID = 'billing-confirm';

export function BillingScreen() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const entitlements = useAppSelector((s) => s.billing.entitlements);
  const loadingStatus = useAppSelector((s) => s.billing.loadingStatus);

  const [autoRenew, setAutoRenew] = useState(true);
  const [loadingAnnual, setLoadingAnnual] = useState(false);
  const [loadingPayPerUse, setLoadingPayPerUse] = useState(false);

  // The redirect is a property of how this page was entered, so read it once. Reading it live
  // would tie the confirmation effect to the URL, and the effect rewrites the URL itself.
  const [redirect] = useState(() => ({
    isSuccess: location.pathname === '/billing/success',
    isCancel: location.pathname === '/billing/cancel',
    purchasedPlan: searchParams.get('plan') as Plan | null,
  }));

  // `navigate` is stable but not referentially guaranteed; keep it out of the effect deps.
  const navigateRef = useRef(navigate);
  useEffect(() => { navigateRef.current = navigate; }, [navigate]);

  const fetchStatus = useCallback(async (): Promise<Entitlements | null> => {
    try {
      const res = await dispatch(getBillingStatus()).unwrap();
      return res?.recordInfo ?? null;
    } catch {
      return null;
    }
  }, [dispatch]);

  useEffect(() => {
    const { isSuccess, isCancel, purchasedPlan } = redirect;
    let cancelled = false;

    const confirmPurchase = async () => {
      if (!isSuccess && !isCancel) {
        await fetchStatus();
        return;
      }

      if (isCancel) {
        await fetchStatus();
        if (cancelled) return;
        toast.info('Checkout was canceled and you have not been charged. Your plan is unchanged.', {
          toastId: CONFIRM_TOAST_ID,
          autoClose: TOAST_DURATION_MS,
        });
        navigateRef.current('/billing', { replace: true });
        return;
      }

      // Notify immediately so the user is never left staring at their old plan while the webhook
      // lands. This one stays up until the poll resolves it below.
      toast.info('Confirming your payment… this usually takes a few seconds.', {
        toastId: CONFIRM_TOAST_ID,
        autoClose: false,
        closeButton: false,
      });
      navigateRef.current('/billing', { replace: true });

      for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
        const latest = await fetchStatus();
        if (cancelled) return;

        if (latest && isProvisioned(latest, purchasedPlan)) {
          toast.update(CONFIRM_TOAST_ID, {
            render: successMessage(latest),
            type: 'success',
            autoClose: TOAST_DURATION_MS,
            closeButton: true,
          });
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }
      if (cancelled) return;

      // Payment went through on Stripe's side; only our provisioning is lagging.
      toast.update(CONFIRM_TOAST_ID, {
        render: 'Your payment was received, but we are still confirming it. Your plan will update shortly — no further action is needed.',
        type: 'warning',
        autoClose: TOAST_DURATION_MS,
        closeButton: true,
      });
    };

    confirmPurchase();
    return () => {
      cancelled = true;
      // The "confirming" toast never auto-closes, so it would outlive the page if the user
      // navigates away mid-poll.
      toast.dismiss(CONFIRM_TOAST_ID);
    };
  }, [redirect, fetchStatus]);

  const handleCheckoutAnnual = async () => {
    try {
      setLoadingAnnual(true);
      const res = await dispatch(checkoutAnnual()).unwrap();
      if (res?.recordInfo) window.location.href = res.recordInfo;
    } catch (error: any) {
      toast.error('Checkout failed: ' + (error?.headers?.message || 'Please try again.'));
    } finally {
      setLoadingAnnual(false);
    }
  };

  const handleCheckoutPayPerUse = async () => {
    try {
      setLoadingPayPerUse(true);
      const res = await dispatch(checkoutPayPerUse({ credits: 1 })).unwrap();
      if (res?.recordInfo) window.location.href = res.recordInfo;
    } catch (error: any) {
      toast.error('Checkout failed: ' + (error?.headers?.message || 'Please try again.'));
    } finally {
      setLoadingPayPerUse(false);
    }
  };

  const isSubscribed = entitlements?.profileType === 'subscribed';
  const isAnnual = isSubscribed && entitlements?.plan === 'annual';
  const isPayPerUse = isSubscribed && entitlements?.plan === 'payPerUse';
  const isTrial = entitlements?.profileType === 'trial';

  const currentPlanSubtext = (): string => {
    if (!entitlements) return '';
    if (isAnnual) return 'Unlimited imaging requests';
    if (isPayPerUse) {
      const credits = entitlements.creditsRemaining ?? 0;
      return `${credits} study credit${credits === 1 ? '' : 's'} remaining`;
    }
    if (isTrial) {
      const credits = entitlements.creditsRemaining ?? 0;
      const ends = entitlements.trialEndsAt
        ? ` · Trial ends ${dayjs(entitlements.trialEndsAt).format('MMM D, YYYY')}`
        : '';
      return `${credits} free stud${credits === 1 ? 'y' : 'ies'} remaining${ends}`;
    }
    return entitlements.canUpload
      ? '1 free study remaining — choose a plan to keep uploading'
      : 'No uploads remaining — choose a plan to continue';
  };

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
              {loadingStatus && !entitlements ? 'Loading…' : entitlements ? planLabelOf(entitlements) : 'No Plan'}
            </div>
            <div className="bill-cur-meta">{currentPlanSubtext()}</div>
          </div>
          {!isAnnual && (
            <button className="btn btn-primary" onClick={handleCheckoutAnnual} disabled={loadingAnnual}>
              {loadingAnnual ? 'Redirecting…' : '⚡ Upgrade to Annual'}
            </button>
          )}
        </div>
        {/* Usage meters are static placeholders — the billing/status API does not yet return per-feature counts. */}
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
          {isTrial && <div className="bill-plan-tag current-tag">✓ Current plan</div>}
          {!isTrial && <div className="bill-plan-tag" style={{ visibility: 'hidden' }}>·</div>}
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
          {/* The trial cannot be chosen — it is granted on signup and expires. */}
          <button className="bill-plan-btn muted" disabled>
            {isTrial ? 'Current plan' : 'Trial'}
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
          <button className="bill-plan-btn inv" onClick={handleCheckoutAnnual} disabled={loadingAnnual || isAnnual}>
            {loadingAnnual ? 'Redirecting…' : isAnnual ? 'Current plan' : 'Choose Annual →'}
          </button>
        </div>
        <div className="bill-plan">
          {isPayPerUse
            ? <div className="bill-plan-tag current-tag">✓ Current plan</div>
            : <div className="bill-plan-tag" style={{ visibility: 'hidden' }}>·</div>}
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
            onClick={handleCheckoutPayPerUse}
            disabled={loadingPayPerUse || isAnnual}
          >
            {loadingPayPerUse ? 'Redirecting…' : isPayPerUse ? 'Buy Another Credit' : 'Switch to Pay Per Use'}
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
            <button className="btn btn-ghost btn-block" onClick={handleCheckoutAnnual} disabled={loadingAnnual}>
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

const successMessage = (latest: Entitlements): string => {
  if (latest.plan === 'annual') {
    return 'Payment successful — you are now subscribed to Annual Unlimited with unlimited imaging requests, storage, and doctor shares.';
  }
  const credits = latest.creditsRemaining ?? 0;
  return `Payment successful — you are now on the Pay Per Use plan with ${credits} study credit${credits === 1 ? '' : 's'} available.`;
};
