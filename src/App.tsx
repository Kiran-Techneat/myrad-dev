import { useAuthStore } from '@/store/authStore';
import { AuthScreen } from '@/features/auth/AuthScreen';
import { AppShell } from '@/components/layout/AppShell';

export function App() {
  const loggedIn = useAuthStore((s) => s.loggedIn);
  return loggedIn ? <AppShell /> : <AuthScreen />;
}
