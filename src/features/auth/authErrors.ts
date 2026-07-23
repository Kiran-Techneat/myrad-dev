import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

/**
 * Maps an API `errorlist` (keyed by backend field names) onto the matching
 * react-hook-form fields via `setError`. The backend field names often differ
 * from the form field names, so callers pass a `fieldMap` (apiKey -> formField).
 * Returns the number of field errors that were applied.
 */
export function applyServerFieldErrors<T extends FieldValues>(
  errorlist: Record<string, string> | undefined,
  fieldMap: Record<string, Path<T>>,
  setError: UseFormSetError<T>,
): number {
  if (!errorlist || typeof errorlist !== 'object') return 0;
  let applied = 0;
  for (const [key, message] of Object.entries(errorlist)) {
    const field = fieldMap[key];
    if (field && message) {
      setError(field, { type: 'server', message: String(message) });
      applied += 1;
    }
  }
  return applied;
}

/** First human-readable message from an errorlist, if any. */
export function firstErrorListMessage(errorlist: Record<string, string> | undefined): string | null {
  if (!errorlist || typeof errorlist !== 'object') return null;
  const values = Object.values(errorlist).filter(Boolean);
  return values.length ? String(values[0]) : null;
}
