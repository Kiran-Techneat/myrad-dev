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
import { ProfileScreen } from '@/features/profile/ProfileScreen';
import { CentersScreen } from '@/features/centers/CentersScreen';
import { BillingScreen } from '@/features/billing/BillingScreen';
import { ViewerScreen } from '@/features/viewer/ViewerScreen';
import OhifViewerPage from '@/features/viewer/OhifViewerPage';
import { NotifyScreen } from '@/features/notify/NotifyScreen';
import { UploadScreen } from '@/features/upload/UploadScreen';
import { SelfUploadShell } from '@/components/scancenter/SelfUploadShell';
import ScanCenterHome from '@/features/scancenter/scancenterhome/ScanCenterHome';
import ScanCenterNoToken from '@/features/scancenter/scancenternotoken/ScanCenterNoToken';

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
          {/* Full-screen DICOM viewer — outside AppShell so it has no app chrome */}
          <Route path="/imageviewer/:id" element={<OhifViewerPage />} />
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<HomeScreen />} />
            <Route path="/images" element={<ImagesScreen />} />
            <Route path="/requests" element={<RequestsScreen />} />
            <Route path="/requests/:id" element={<RequestDetailScreen />} />
            <Route path="/shared" element={<SharedScreen />} />
            <Route path="/wizard" element={<WizardScreen />} />
            <Route path="/self-upload" element={<SelfUploadScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/centers" element={<CentersScreen />} />
            <Route path="/billing" element={<BillingScreen />} />
            <Route path="/billing/success" element={<BillingScreen />} />
            <Route path="/billing/cancel" element={<BillingScreen />} />
            <Route path="/viewer" element={<ViewerScreen />} />
            <Route path="/viewer/:studyId" element={<ViewerScreen />} />
            <Route path="/notify" element={<NotifyScreen />} />
            <Route path="/upload" element={<UploadScreen />} />
          </Route>
        </Route>

        {/* Public imaging-center upload portal — tokenized link, no sidebar/app chrome */}
        <Route element={<SelfUploadShell />}>
          <Route path="/u" element={<ScanCenterNoToken />} />
          <Route path="/u/:id" element={<ScanCenterHome />} />
          <Route path="/selfupload" element={<ScanCenterNoToken />} />
          <Route path="/selfupload/:id" element={<ScanCenterHome />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <CustomAlert />
    </>
  );
}
