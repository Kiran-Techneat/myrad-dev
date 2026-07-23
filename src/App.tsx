import { Routes, Route, Navigate } from 'react-router-dom';
import CustomAlert from '@/components/common/CustomAlert';
import { AppShell } from '@/components/dashboard/layout/AppShell';
import { RequireAuth } from '@/routes/RequireAuth';
import { PublicOnly } from '@/routes/PublicOnly';
import { AuthLayout } from '@/pages/auth/AuthLayout';
import { LoginRoute } from '@/pages/auth/Login';
import { SignupRoute } from '@/pages/auth/Signup';
import { OtpRoute } from '@/pages/auth/VerifyOtp';
import { HomeScreen } from '@/pages/dashboard/Home';
import { ImagesScreen } from '@/features/images/ImagesScreen';
import { RequestsScreen } from '@/pages/dashboard/Requests';
import { RequestDetailScreen } from '@/pages/dashboard/RequestDetail';
import { SharedScreen } from '@/features/shared/SharedScreen';
import { WizardScreen } from '@/features/wizard/WizardScreen';
import { SelfUploadScreen } from '@/features/selfUpload/SelfUploadScreen';
import { StaffScreen } from '@/features/staff/StaffScreen';
import { ProfileScreen } from '@/features/profile/ProfileScreen';
import { CentersScreen } from '@/features/centers/CentersScreen';
import { BillingScreen } from '@/features/billing/BillingScreen';
import { ViewerScreen } from '@/features/viewer/ViewerScreen';
import { NotifyScreen } from '@/features/notify/NotifyScreen';
import { UploadScreen } from '@/features/upload/UploadScreen';

export function App() {
  return (
    <>
      <Routes>
        {/* Auth (redirects to /dashboard when already signed in) */}
        <Route element={<PublicOnly />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/signup" element={<SignupRoute />} />
            <Route path="/verify-otp" element={<OtpRoute />} />
          </Route>
        </Route>

        {/* App (redirects to /login when signed out) */}
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<HomeScreen />} />
            <Route path="/images" element={<ImagesScreen />} />
            <Route path="/requests" element={<RequestsScreen />} />
            <Route path="/requests/:id" element={<RequestDetailScreen />} />
            <Route path="/shared" element={<SharedScreen />} />
            <Route path="/wizard" element={<WizardScreen />} />
            <Route path="/self-upload" element={<SelfUploadScreen />} />
            <Route path="/staff" element={<Navigate to="/staff/upload" replace />} />
            <Route path="/staff/:view" element={<StaffScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/centers" element={<CentersScreen />} />
            <Route path="/billing" element={<BillingScreen />} />
            <Route path="/viewer" element={<ViewerScreen />} />
            <Route path="/viewer/:studyId" element={<ViewerScreen />} />
            <Route path="/notify" element={<NotifyScreen />} />
            <Route path="/upload" element={<UploadScreen />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <CustomAlert />
    </>
  );
}
