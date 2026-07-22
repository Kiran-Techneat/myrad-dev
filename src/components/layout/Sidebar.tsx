import { Icon } from '@/components/common/Icon';
import { PRIMARY_NAV } from './navItems';
import { isNavActive } from './navActive';
import { PatientSelector } from './PatientSelector';
import { useNavStore } from '@/store/navStore';
import { useAppActions } from '@/hooks/useAppActions';

export function Sidebar() {
  const { screen, staffView, userMenuOpen } = useNavStore();
  const toggleUserMenu = useNavStore((s) => s.toggleUserMenu);
  const { go, goSelfUpload, goStaff } = useAppActions();

  const handleNav = (key: string) => {
    switch (key) {
      case 'selfUpload':
        return goSelfUpload();
      case 'centerUpload':
        return goStaff('upload');
      case 'walkIn':
        return goStaff('walkin');
      case 'providerView':
        return goStaff('provider');
      default:
        return go(PRIMARY_NAV.find((n) => n.key === key)!.screen);
    }
  };

  return (
    <div className="sidebar">
      <div className="sb-logo">
        <div className="sb-logo-ic">
          <Icon name="grid" />
        </div>
        MyRad Images
      </div>

      <PatientSelector variant="sidebar" />

      <div className="sb-nav">
        {PRIMARY_NAV.map((item) => (
          <button
            key={item.key}
            className={`sb-navi ${isNavActive(item, screen, staffView) ? 'on' : ''}`}
            onClick={() => handleNav(item.key)}
          >
            <Icon name={item.icon} />
            {item.label}
          </button>
        ))}
      </div>

      <div className="sb-foot">
        <div className="sb-userwrap">
          <button className="sb-user" onClick={toggleUserMenu}>
            <div className="sb-av">J</div>
            <div>
              <div className="sb-user-nm">John Doe</div>
              <div className="sb-user-sub">Patient</div>
            </div>
          </button>
          {userMenuOpen && (
            <>
              <div className="dropdown-scrim" onClick={toggleUserMenu} />
              <div className="tn-menu sb-menu-pop-up">
                <button className="tn-menu-item" onClick={() => go('profile')}>
                  <Icon name="user" />
                  Profile
                </button>
                <button className="tn-menu-item" onClick={() => go('centers')}>
                  <Icon name="building" />
                  Centers
                </button>
                <button className="tn-menu-item" onClick={() => go('billing')}>
                  <Icon name="card" />
                  Billing
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
