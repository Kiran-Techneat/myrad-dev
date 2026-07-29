import type { NavItem } from './navItems';
import { screenFromPath } from '@/routes/paths';

export function isNavActive(item: NavItem, pathname: string): boolean {
  return screenFromPath(pathname) === item.screen;
}
