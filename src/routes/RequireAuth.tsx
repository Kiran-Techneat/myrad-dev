import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth/authStore';

/** Gate for logged-in screens: bounce to /login (remembering the target) when signed out. */
export function RequireAuth() {
  const loggedIn = useAuthStore((s) => s.loggedIn);
  const location = useLocation();
  if (!loggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return <Outlet />;
}
