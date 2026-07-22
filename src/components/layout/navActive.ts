import type { Screen, StaffView } from '@/store/navStore';
import type { NavItem } from './navItems';

export function isNavActive(item: NavItem, screen: Screen, staffView: StaffView): boolean {
  if (item.screen === 'staff') {
    return screen === 'staff' && staffView === item.staffView;
  }
  return screen === item.screen;
}
