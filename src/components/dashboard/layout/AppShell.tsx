import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { BottomNav } from './BottomNav';
import { Overlays } from '@/components/dashboard/overlays/Overlays';
import { HelpFab } from '@/components/dashboard/help/HelpFab';

export function AppShell() {
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
    </div>
  );
}
