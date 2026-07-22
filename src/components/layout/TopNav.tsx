import { Icon } from '@/components/common/Icon';
import { PRIMARY_NAV } from './navItems';
import { isNavActive } from './navActive';
import { PatientSelector } from './PatientSelector';
import { useNavStore } from '@/store/navStore';
import { useAppActions } from '@/hooks/useAppActions';

export function TopNav() {
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
    <div className="topnav">
      <div className="tn-logo">
        <div className="tn-logo-ic">
          <Icon name="grid" />
        </div>
        MyRad Images
      </div>

      <div className="tn-items">
        {PRIMARY_NAV.map((item) => (
          <button
            key={item.key}
            className={`tn-item ${isNavActive(item, screen, staffView) ? 'on' : ''}`}
            onClick={() => handleNav(item.key)}
          >
            <Icon name={item.icon} />
            {item.key === 'providerView' ? 'Provider' : item.label}
          </button>
        ))}
      </div>

      <PatientSelector variant="topnav" />

      <div className="tn-userwrap">
        <button className={`tn-user ${userMenuOpen ? 'open' : ''}`} onClick={toggleUserMenu}>
          <div className="tn-av">J</div>
          <div>
            <div className="tn-user-nm">John Doe</div>
            <div className="tn-user-sub">Patient</div>
          </div>
        </button>
        {userMenuOpen && (
          <>
            <div className="dropdown-scrim" onClick={toggleUserMenu} />
            <div className="tn-menu">
              <button className="tn-menu-item bottomnav-only" onClick={goSelfUpload}>
                <Icon name="upload" />
                Self Upload
              </button>
              <button className="tn-menu-item bottomnav-only" onClick={() => goStaff('walkin')}>
                <Icon name="bolt" />
                Walk-in
              </button>
              <button className="tn-menu-item bottomnav-only" onClick={() => goStaff('upload')}>
                <Icon name="building" />
                Imaging Center
              </button>
              <button className="tn-menu-item bottomnav-only" onClick={() => goStaff('provider')}>
                <Icon name="users" />
                Provider View
              </button>
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
  );
}
