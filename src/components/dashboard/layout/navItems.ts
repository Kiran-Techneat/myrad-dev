import type { IconName } from '@/components/common/Icon';
import type { Screen, StaffView } from '@/store/dashboard/navStore';

export interface NavItem {
  key: string;
  label: string;
  icon: IconName;
  screen: Screen;
  staffView?: StaffView;
}

export const PRIMARY_NAV: NavItem[] = [
  { key: 'home', label: 'Home', icon: 'home', screen: 'home' },
  { key: 'images', label: 'Images', icon: 'image', screen: 'images' },
  { key: 'requests', label: 'Requests', icon: 'clipboard', screen: 'requests' },
  { key: 'shared', label: 'Shared', icon: 'share', screen: 'shared' },
  { key: 'selfUpload', label: 'Self Upload', icon: 'upload', screen: 'selfUpload' },
  { key: 'centerUpload', label: 'Imaging Center', icon: 'building', screen: 'staff', staffView: 'upload' },
  { key: 'walkIn', label: 'Walk-in', icon: 'bolt', screen: 'staff', staffView: 'walkin' },
  { key: 'providerView', label: 'Provider View', icon: 'users', screen: 'staff', staffView: 'provider' },
];

export const BOTTOM_NAV = PRIMARY_NAV.slice(0, 4);
