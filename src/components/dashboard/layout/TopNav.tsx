import { useLocation } from 'react-router-dom';
import { Icon } from '@/components/common/Icon';
import { PRIMARY_NAV } from './navItems';
import { isNavActive } from './navActive';
import { PatientSelector } from './PatientSelector';
import { useNavStore } from '@/store/dashboard/navStore';
import { useAppActions } from '@/hooks/useAppActions';
import { useAppSelector } from '@/store/hook';
import { clearSession } from '@/utils/authUtility';

export function TopNav() {
  const { pathname } = useLocation();
  const userMenuOpen = useNavStore((s) => s.userMenuOpen);
  const toggleUserMenu = useNavStore((s) => s.toggleUserMenu);
  const { go, goSelfUpload } = useAppActions();
  const userProfile = useAppSelector((s) => s.user.userProfile);

  const fullName = `${userProfile?.firstName ?? ''} ${userProfile?.lastName ?? ''}`.trim() || 'John Doe';
  const avatarInitial = (userProfile?.firstName?.[0] ?? 'J').toUpperCase();

  const handleNav = (key: string) => {
    switch (key) {
      case 'selfUpload':
        return goSelfUpload();
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
            className={`tn-item ${isNavActive(item, pathname) ? 'on' : ''}`}
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
          <div
            className="tn-av"
            style={
              userProfile?.profilePicUrl
                ? {
                    backgroundImage: `url(${userProfile.profilePicUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : undefined
            }
          >
            {!userProfile?.profilePicUrl && avatarInitial}
          </div>
          <div>
            <div className="tn-user-nm">{fullName}</div>
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
              <button className="tn-menu-item" onClick={() => clearSession()}>
                <Icon name="lock" />
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
