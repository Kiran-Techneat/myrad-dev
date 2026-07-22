import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { BottomNav } from './BottomNav';
import { ScreenRouter } from './ScreenRouter';
import { Overlays } from '@/components/overlays/Overlays';
import { HelpFab } from '@/features/help/HelpFab';

export function AppShell() {
  return (
    <div className="app">
      <Sidebar />
      <TopNav />
      <BottomNav />
      <div className="main">
        <ScreenRouter />
      </div>
      <HelpFab />
      <Overlays />
    </div>
  );
}
