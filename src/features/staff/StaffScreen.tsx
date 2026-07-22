import { useNavStore } from '@/store/navStore';
import { StaffUpload } from './StaffUpload';
import { StaffWalkIn } from './StaffWalkIn';
import { StaffProvider } from './StaffProvider';

export function StaffScreen() {
  const staffView = useNavStore((s) => s.staffView);
  return (
    <div className="staff-wrap">
      <div className="staff-page">
        {staffView === 'upload' && <StaffUpload />}
        {staffView === 'walkin' && <StaffWalkIn />}
        {staffView === 'provider' && <StaffProvider />}
      </div>
    </div>
  );
}
