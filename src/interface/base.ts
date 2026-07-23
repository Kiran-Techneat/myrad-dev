// Shared API envelope shapes used across the redux auth layer.

export interface IAPICommonResponse {
  headers?: {
    code?: string | number;
    message?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface IAPIErrorResponse {
  headers?: {
    code?: string | number;
    message?: string;
    [key: string]: unknown;
  };
  // Field-level validation errors keyed by form field name.
  errorlist?: Record<string, string>;
  message?: string;
  [key: string]: unknown;
}
