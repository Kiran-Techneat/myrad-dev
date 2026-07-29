import { useLocation } from 'react-router-dom';
import { Icon } from '@/components/common/Icon';
import { PRIMARY_NAV } from './navItems';
import { isNavActive } from './navActive';
import { PatientSelector } from './PatientSelector';
import { useNavStore } from '@/store/dashboard/navStore';
import { useAppActions } from '@/hooks/useAppActions';
import { useAppSelector } from '@/store/hook';
import { useDialogStore } from '@/store/dashboard/dialogStore';
import { clearSession } from '@/utils/authUtility';

export function Sidebar() {
  const { pathname } = useLocation();
  const userMenuOpen = useNavStore((s) => s.userMenuOpen);
  const toggleUserMenu = useNavStore((s) => s.toggleUserMenu);
  const { go, goSelfUpload } = useAppActions();
  const userProfile = useAppSelector((s) => s.user.userProfile);
  const askConfirm = useDialogStore((s) => s.askConfirm);

  const fullName = `${userProfile?.firstName ?? ''} ${userProfile?.lastName ?? ''}`.trim() || 'John Doe';
  const avatarInitial = (userProfile?.firstName?.[0] ?? 'J').toUpperCase();

  const confirmLogout = () =>
    askConfirm({
      title: 'Log out?',
      msg: 'Are you sure you want to log out?',
      confirmLabel: 'Log out',
      run: () => clearSession(),
    });

  const handleNav = (key: string) => {
    switch (key) {
      case 'selfUpload':
        return goSelfUpload();
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
            className={`sb-navi ${isNavActive(item, pathname) ? 'on' : ''}`}
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
            <div
              className="sb-av"
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
              <div className="sb-user-nm">{fullName}</div>
              <div className="sb-user-sub">Patient</div>
            </div>
          </button>
          {userMenuOpen && (
            <>
              <div className="dropdown-scrim" onClick={toggleUserMenu} />
              <div className="tn-menu sb-menu-pop-up">
                <button className="tn-menu-item" onClick={confirmLogout}>
                  <Icon name="lock" />
                  Logout
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
    </div>
  );
}
