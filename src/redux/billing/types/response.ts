import type { IAPICommonResponse } from "@/interface/base";
import type { Entitlements } from "@/utils/entitlements";

export interface IBillingStatusResponse extends IAPICommonResponse {
  recordInfo?: Entitlements;
}

// `recordInfo` is the Stripe Checkout session URL to redirect the browser to.
export interface ICheckoutResponse extends IAPICommonResponse {
  recordInfo?: string;
}
