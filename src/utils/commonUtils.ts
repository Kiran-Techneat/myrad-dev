import { formatUSPhone } from './format';

/** US phone display formatting, aliased for the scan-center feature. */
export const formatUSPhoneNumber = (raw: string): string => formatUSPhone(raw);

/**
 * Download a file at `url` reliably (works cross-origin/presigned URLs) by
 * fetching it as a blob and triggering an `<a download>`. Falls back to opening
 * the URL in a new tab if the fetch is blocked (CORS/network).
 *
 * @returns `true` if the file was downloaded, `false` if it fell back to a new tab.
 */
export const downloadReport = async (url: string, filename = 'report.pdf'): Promise<boolean> => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
    return true;
  } catch {
    window.open(url, '_blank', 'noopener');
    return false;
  }
};
