import { useLocation } from 'react-router-dom';
import { Icon } from '@/components/common/Icon';
import { BOTTOM_NAV } from './navItems';
import { isNavActive } from './navActive';
import { useNavStore } from '@/store/dashboard/navStore';
import { useAppActions } from '@/hooks/useAppActions';

export function BottomNav() {
  const { pathname } = useLocation();
  const userMenuOpen = useNavStore((s) => s.userMenuOpen);
  const toggleUserMenu = useNavStore((s) => s.toggleUserMenu);
  const { go } = useAppActions();

  return (
    <div className="bottomnav">
      {BOTTOM_NAV.map((item) => (
        <button
          key={item.key}
          className={`bn-item ${isNavActive(item, pathname) ? 'on' : ''}`}
          onClick={() => go(item.screen)}
        >
          <Icon name={item.icon} />
          {item.label}
        </button>
      ))}
      <button className={`bn-item ${userMenuOpen ? 'on' : ''}`} onClick={toggleUserMenu}>
        <div className="bn-av">J</div>
        More
      </button>
    </div>
  );
}
