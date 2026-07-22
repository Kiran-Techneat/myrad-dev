import { Icon } from '@/components/common/Icon';
import { BOTTOM_NAV } from './navItems';
import { isNavActive } from './navActive';
import { useNavStore } from '@/store/navStore';
import { useAppActions } from '@/hooks/useAppActions';

export function BottomNav() {
  const { screen, staffView, userMenuOpen } = useNavStore();
  const toggleUserMenu = useNavStore((s) => s.toggleUserMenu);
  const { go } = useAppActions();

  return (
    <div className="bottomnav">
      {BOTTOM_NAV.map((item) => (
        <button
          key={item.key}
          className={`bn-item ${isNavActive(item, screen, staffView) ? 'on' : ''}`}
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
