import type { Screen, StaffView } from '@/store/dashboard/navStore';

/**
 * Single source of truth mapping the legacy `Screen` union to a URL path.
 * Used by the `useAppNavigate` adapter and any `<Link>`s so paths stay in one place.
 */
export const SCREEN_PATH: Record<Screen, string> = {
  home: '/dashboard',
  images: '/images',
  requests: '/requests',
  requestDetail: '/requests',
  shared: '/shared',
  viewer: '/viewer',
  profile: '/profile',
  billing: '/billing',
  wizard: '/wizard',
  upload: '/upload',
  centers: '/centers',
  notify: '/notify',
  selfUpload: '/self-upload',
  staff: '/staff',
};

/** Derive the active top-level screen from the current pathname (for nav highlighting). */
export function screenFromPath(pathname: string): Screen {
  if (pathname.startsWith('/images')) return 'images';
  if (pathname.startsWith('/requests')) return 'requests';
  if (pathname.startsWith('/shared')) return 'shared';
  if (pathname.startsWith('/self-upload')) return 'selfUpload';
  if (pathname.startsWith('/staff')) return 'staff';
  if (pathname.startsWith('/profile')) return 'profile';
  if (pathname.startsWith('/billing')) return 'billing';
  if (pathname.startsWith('/centers')) return 'centers';
  if (pathname.startsWith('/viewer')) return 'viewer';
  if (pathname.startsWith('/notify')) return 'notify';
  if (pathname.startsWith('/wizard')) return 'wizard';
  if (pathname.startsWith('/upload')) return 'upload';
  return 'home';
}

/** Derive the active staff sub-view from the current pathname. */
export function staffViewFromPath(pathname: string): StaffView {
  if (pathname.startsWith('/staff/walkin')) return 'walkin';
  if (pathname.startsWith('/staff/provider')) return 'provider';
  return 'upload';
}
