import type { NavItem } from './navItems';
import { screenFromPath, staffViewFromPath } from '@/routes/paths';

export function isNavActive(item: NavItem, pathname: string): boolean {
  const screen = screenFromPath(pathname);
  if (item.screen === 'staff') {
    return screen === 'staff' && staffViewFromPath(pathname) === item.staffView;
  }
  return screen === item.screen;
}
