import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { BottomNav } from './BottomNav';
import { NavGuardDialog } from './NavGuardDialog';
import { Overlays } from '@/components/dashboard/overlays/Overlays';
import { HelpFab } from '@/components/dashboard/help/HelpFab';
import { useAppDispatch } from '@/store/hook';
import { getUserProfile } from '@/redux/user/action';

export function AppShell() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  return (
    <div className="app">
      <Sidebar />
      <TopNav />
      <BottomNav />
      <div className="main">
        <Outlet />
      </div>
      <HelpFab />
      <Overlays />
      <NavGuardDialog />
    </div>
  );
}
