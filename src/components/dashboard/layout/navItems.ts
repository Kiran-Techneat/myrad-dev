import type { IconName } from '@/components/common/Icon';
import type { Screen } from '@/store/dashboard/navStore';

export interface NavItem {
  key: string;
  label: string;
  icon: IconName;
  screen: Screen;
}

export const PRIMARY_NAV: NavItem[] = [
  { key: 'home', label: 'Home', icon: 'home', screen: 'home' },
  { key: 'images', label: 'Images', icon: 'image', screen: 'images' },
  { key: 'requests', label: 'Requests', icon: 'clipboard', screen: 'requests' },
  { key: 'shared', label: 'Shared', icon: 'share', screen: 'shared' },
  { key: 'selfUpload', label: 'Self Upload', icon: 'upload', screen: 'selfUpload' },
];

export const BOTTOM_NAV = PRIMARY_NAV.slice(0, 4);
