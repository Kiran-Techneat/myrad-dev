/**
 * The billing state model from the backend (GET /users-service/api/v1/billing/status,
 * under `recordInfo`). The backend derives this; never re-implement the billing rules here.
 */
export type ProfileType = 'trial' | 'subscribed' | 'none';

export type Plan = 'annual' | 'payPerUse';

/** Why an upload is blocked. Mirrors the structured 402 body. */
export type BlockedReason = 'no_subscription' | 'no_credits' | 'trial_expired';

export interface Entitlements {
    profileType: ProfileType;
    /** Only present when profileType is 'subscribed'. */
    plan?: Plan;
    /** Null/absent on Annual means unlimited — do not read it as zero. */
    creditsRemaining?: number | null;
    /** Only present when profileType is 'trial'. */
    trialEndsAt?: string;
    canUpload?: boolean;
    /** Only present when canUpload is false. */
    reason?: BlockedReason;
}

export const PLAN_LABEL: Record<Plan, string> = {
    annual: 'Annual Unlimited',
    payPerUse: 'Pay Per Use',
};

/** Label for the user's current plan, suitable for a chip or heading. */
export const planLabelOf = (entitlements: Entitlements): string => {
    if (entitlements.profileType === 'subscribed' && entitlements.plan) {
        return PLAN_LABEL[entitlements.plan];
    }
    return entitlements.profileType === 'trial' ? 'Trial' : 'No Plan';
};

/**
 * Whether the upload UI should be enabled. This is an optimization to avoid a doomed upload
 * round-trip — the backend still enforces the same rule and answers with a structured 402.
 */
export const canUpload = (entitlements: Entitlements | null | undefined): boolean =>
    entitlements?.canUpload === true;

/** User-facing explanation for a blocked upload, keyed by the backend's reason code. */
export const blockedMessage = (reason?: BlockedReason): string => {
    switch (reason) {
        case 'no_credits':
            return 'You have used your free study. Choose a plan to upload more.';
        case 'trial_expired':
            return 'Your trial has ended. Choose a plan to keep uploading.';
        case 'no_subscription':
        default:
            return 'You need an active plan to upload a study.';
    }
};

/**
 * After a Stripe redirect the webhook provisions asynchronously, so we poll `status` until the
 * purchase is reflected. An Annual subscriber who tops up credits stays on "annual", so only
 * require an exact plan match when the purchase was for Annual itself.
 */
export const isProvisioned = (latest: Entitlements, purchasedPlan: Plan | null): boolean => {
    if (latest.profileType !== 'subscribed') return false;
    if (purchasedPlan === 'annual') return latest.plan === 'annual';
    if (purchasedPlan === 'payPerUse') return latest.plan === 'payPerUse' || latest.plan === 'annual';
    return true;
};
