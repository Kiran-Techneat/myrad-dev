import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth/authStore';

/** Gate for auth screens: redirect to the dashboard when already signed in. */
export function PublicOnly() {
  const loggedIn = useAuthStore((s) => s.loggedIn);
  if (loggedIn) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
