import { useNavStore } from '@/store/navStore';
import { HomeScreen } from '@/features/home/HomeScreen';
import { ImagesScreen } from '@/features/images/ImagesScreen';
import { RequestsScreen } from '@/features/requests/RequestsScreen';
import { RequestDetailScreen } from '@/features/requests/RequestDetailScreen';
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

export function ScreenRouter() {
  const screen = useNavStore((s) => s.screen);

  switch (screen) {
    case 'home':
      return <HomeScreen />;
    case 'images':
      return <ImagesScreen />;
    case 'requests':
      return <RequestsScreen />;
    case 'requestDetail':
      return <RequestDetailScreen />;
    case 'shared':
      return <SharedScreen />;
    case 'wizard':
      return <WizardScreen />;
    case 'selfUpload':
      return <SelfUploadScreen />;
    case 'staff':
      return <StaffScreen />;
    case 'profile':
      return <ProfileScreen />;
    case 'centers':
      return <CentersScreen />;
    case 'billing':
      return <BillingScreen />;
    case 'viewer':
      return <ViewerScreen />;
    case 'notify':
      return <NotifyScreen />;
    case 'upload':
      return <UploadScreen />;
    default:
      return <HomeScreen />;
  }
}
