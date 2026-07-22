import type { CSSProperties, ReactNode } from 'react';

export type IconName =
  | 'grid'
  | 'home'
  | 'image'
  | 'clipboard'
  | 'share'
  | 'upload'
  | 'building'
  | 'bolt'
  | 'users'
  | 'user'
  | 'card'
  | 'chevronDown'
  | 'chevronRight'
  | 'chevronLeft'
  | 'check'
  | 'checkThick'
  | 'eye'
  | 'calendar'
  | 'search'
  | 'x'
  | 'phone'
  | 'mail'
  | 'fax'
  | 'mapPin'
  | 'clock'
  | 'alert'
  | 'info'
  | 'bulb'
  | 'shield'
  | 'shieldCheck'
  | 'checkCircle'
  | 'lock'
  | 'send'
  | 'plus'
  | 'edit'
  | 'doc'
  | 'download'
  | 'zoomIn'
  | 'chat'
  | 'star'
  | 'help'
  | 'disc'
  | 'folder'
  | 'link'
  | 'kebab'
  | 'checkBig';

const PATHS: Record<IconName, ReactNode> = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  home: (
    <>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9" r="1.5" />
      <path d="M21 15l-5-4-9 8" />
    </>
  ),
  clipboard: (
    <>
      <path d="M9 2h6l1 4H8l1-4z" />
      <rect x="5" y="6" width="14" height="16" rx="2" />
      <path d="M9 12h6M9 16h6" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 10.6l6.8-3.8M8.6 13.4l6.8 3.8" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4M7 9l5-5 5 5" />
      <path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" />
    </>
  ),
  building: (
    <>
      <path d="M19 21V8l-7-5-7 5v13" />
      <path d="M9 21v-6h6v6" />
    </>
  ),
  bolt: <path d="M13 2L3 14h7l-1 8 11-14h-7l1-8z" />,
  users: (
    <>
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a8 8 0 0116 0v1" />
    </>
  ),
  card: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </>
  ),
  chevronDown: <path d="M6 9l6 6 6-6" />,
  chevronRight: <path d="M9 6l6 6-6 6" />,
  chevronLeft: <path d="M15 18l-6-6 6-6" />,
  check: <path d="M5 12l5 5 9-10" />,
  checkThick: <path d="M5 13l4 4 10-11" />,
  checkBig: <path d="M20 6L9 17l-5-5" />,
  eye: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M8 2v4M16 2v4M3 10h18" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>
  ),
  x: <path d="M18 6L6 18M6 6l12 12" />,
  phone: <path d="M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3.5 7l8.5 6 8.5-6" />
    </>
  ),
  fax: <path d="M7 9V4h10v5M7 18H5a2 2 0 01-2-2v-3a2 2 0 012-2h14a2 2 0 012 2v3a2 2 0 01-2 2h-2M7 14h10v6H7z" />,
  mapPin: (
    <>
      <path d="M12 21s7-6.5 7-12a7 7 0 00-14 0c0 5.5 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  alert: (
    <>
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.3 3.9L2.5 17a2 2 0 001.7 3h15.6a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" />
    </>
  ),
  bulb: (
    <>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 00-4 10.5c.6.5 1 1.3 1 2.5h6c0-1.2.4-2 1-2.5A6 6 0 0012 3z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3.2v5c0 4.6-3 7.8-7 9-4-1.2-7-4.4-7-9v-5z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  shieldCheck: (
    <>
      <path d="M12 3l7 3.2v5c0 4.6-3 7.8-7 9-4-1.2-7-4.4-7-9v-5z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  checkCircle: (
    <>
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <path d="M22 4L12 14.01l-3-3" />
    </>
  ),
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </>
  ),
  send: (
    <>
      <path d="M22 3L11 14" />
      <path d="M22 3l-7 18-4-8-8-4z" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
    </>
  ),
  doc: (
    <>
      <path d="M6 3h8l5 5v13H6z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 16.5h4" />
    </>
  ),
  download: <path d="M12 4v11M8 11l4 4 4-4M5 20h14" />,
  zoomIn: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
      <path d="M11 8v6M8 11h6" />
    </>
  ),
  chat: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />,
  star: <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5-4.8-4.6 6.6-.9z" />,
  help: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M9.1 9a3 3 0 015.8 1c0 2-3 2.5-3 4.5" />
      <path d="M12 17.5h.01" />
    </>
  ),
  disc: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    </>
  ),
  folder: <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />,
  link: (
    <>
      <path d="M9 15l6-6" />
      <path d="M13 6l1-1a4 4 0 015.5 5.5l-2 2M11 18l-1 1a4 4 0 01-5.5-5.5l2-2" />
    </>
  ),
  kebab: (
    <>
      <circle cx="12" cy="5" r="1.9" />
      <circle cx="12" cy="12" r="1.9" />
      <circle cx="12" cy="19" r="1.9" />
    </>
  ),
};

export interface IconProps {
  name: IconName;
  className?: string;
  sw?: number;
  style?: CSSProperties;
}

export function Icon({ name, className = 'ic', sw = 2, style }: IconProps) {
  const filled = name === 'kebab';
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={filled ? undefined : sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
