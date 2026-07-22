import type { ReactNode } from 'react';
import type { StudyTag } from '@/types';

const GLYPHS: Record<StudyTag, ReactNode> = {
  MRI: (
    <>
      <path d="M5 18V10a7 7 0 0114 0v8" />
      <path d="M3 18h18" />
      <rect x="9.3" y="14.6" width="5.4" height="3" rx="1.5" />
    </>
  ),
  CT: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3v2.3M12 18.7V21M3 12h2.3M18.7 12H21" />
    </>
  ),
  XR: (
    <g transform="rotate(45 12 12)">
      <circle cx="4.6" cy="9.3" r="2.1" />
      <circle cx="4.6" cy="14.7" r="2.1" />
      <circle cx="19.4" cy="9.3" r="2.1" />
      <circle cx="19.4" cy="14.7" r="2.1" />
      <path d="M6.4 9.3H17.6" />
      <path d="M6.4 14.7H17.6" />
    </g>
  ),
  US: (
    <>
      <path d="M12 3v7" />
      <rect x="7" y="10" width="10" height="6" rx="3" />
      <path d="M9.3 19a3.4 3.4 0 015.4 0" />
    </>
  ),
  ECHO: <path d="M12 20.3c-1.2-.9-7.3-5.3-7.3-9.7a4 4 0 017.3-2.4 4 4 0 017.3 2.4c0 4.4-6.1 8.8-7.3 9.7z" />,
  PET: (
    <>
      <path d="M12 2v3" />
      <path d="M12 19v3" />
      <path d="M2 12h3" />
      <path d="M19 12h3" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="1.3" />
    </>
  ),
  MMG: (
    <>
      <path d="M6 3.4v16.4" />
      <path d="M6 3.4h6.4l2 2h4" />
      <rect x="4" y="16.6" width="14.6" height="3.2" rx="1.2" />
      <path d="M15.4 18.2h2" />
    </>
  ),
  NS: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.3 9.5a2.7 2.7 0 015.2 1.1c0 1.8-2.5 1.9-2.5 3.3" />
      <path d="M12 17.2h.01" />
    </>
  ),
  OTH: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <rect x="6.3" y="6.3" width="5" height="5" rx="1.4" />
      <rect x="12.7" y="6.3" width="5" height="5" rx="1.4" />
      <rect x="6.3" y="12.7" width="5" height="5" rx="1.4" />
      <rect x="12.7" y="12.7" width="5" height="5" rx="1.4" />
    </>
  ),
};

export function StudyIcon({ tag, className = 'ic' }: { tag: StudyTag; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {GLYPHS[tag] ?? GLYPHS.OTH}
    </svg>
  );
}
