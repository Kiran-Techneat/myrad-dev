/** Formatting helpers ported from the original DCLogic component. */

export function formatUSPhone(raw: string): string {
  const s = (raw || '').replace(/^\+1\s*/, '');
  let d = s.replace(/\D/g, '');
  if (d.length === 11 && d[0] === '1') d = d.slice(1);
  d = d.slice(0, 10);
  if (!d.length) return '';
  let out = '+1 (' + d.slice(0, 3);
  if (d.length > 3) out += ') ' + d.slice(3, 6);
  if (d.length > 6) out += '-' + d.slice(6, 10);
  return out;
}

export function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || '').trim());
}

/** ISO (YYYY-MM-DD) -> MM/DD/YYYY */
export function fmtMDY(iso: string): string {
  if (!iso) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return '';
  return m[2] + '/' + m[3] + '/' + m[1];
}

/** DICOM study date (YYYYMMDD) -> 'MMM D, YYYY'. Returns '' when not parseable. */
export function fmtStudyDate(yyyymmdd?: string | null): string {
  if (!yyyymmdd) return '';
  const m = /^(\d{4})(\d{2})(\d{2})$/.exec(String(yyyymmdd).trim());
  if (!m) return '';
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Long human date from MM/DD/YYYY, ISO, or arbitrary date string. */
export function fmtLong(v: string): string {
  if (!v) return v;
  let d: Date;
  const mdy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(v);
  if (mdy) d = new Date(+mdy[3], +mdy[1] - 1, +mdy[2]);
  else if (/^\d{4}-\d{2}-\d{2}$/.test(v)) d = new Date(v + 'T00:00');
  else d = new Date(v);
  if (isNaN(d.getTime())) return v;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function ageOf(dob: string): number | null {
  if (!dob) return null;
  const pr = String(dob).split('/').map(Number);
  if (pr.length < 3 || !pr[2]) return null;
  const t = new Date();
  let a = t.getFullYear() - pr[2];
  if (t.getMonth() + 1 < pr[0] || (t.getMonth() + 1 === pr[0] && t.getDate() < pr[1])) a--;
  return a;
}

export function initialsFromName(name: string): string {
  return (
    name
      .replace(/^Dr\.?\s*/i, '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('') || 'DR'
  );
}

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function yearRange(from = 2010): string[] {
  const cur = new Date().getFullYear();
  return Array.from({ length: cur - from + 1 }, (_, i) => String(cur - i));
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function todayLabel(): string {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export type DateMode = 'my' | 'yr' | 'ex' | 'rg';

/** Resolve the wizard "when was it done" picker into a display string. */
export function resolveStudyDate(
  mode: DateMode,
  month: string,
  year: string,
  exact: string,
  from: string,
  to: string,
): string {
  if (mode === 'my') return month && year ? `${month} ${year}` : '';
  if (mode === 'yr') return year || '';
  if (mode === 'ex') {
    if (!exact) return '';
    const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(exact.trim());
    if (!m) return '';
    const dt = new Date(+m[1], +m[2] - 1, +m[3]);
    return isNaN(dt.getTime())
      ? ''
      : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  if (mode === 'rg') {
    if (!from || !to) return '';
    const df = new Date(from + 'T00:00:00');
    const dt = new Date(to + 'T00:00:00');
    if (isNaN(df.getTime()) || isNaN(dt.getTime()) || dt < df) return '';
    const days = (dt.getTime() - df.getTime()) / 86400000;
    if (days > 183) return '';
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${fmt(df)} – ${fmt(dt)}`;
  }
  return '';
}
