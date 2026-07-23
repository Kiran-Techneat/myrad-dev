import { useParams } from 'react-router-dom';
import type { StaffView } from '@/store/dashboard/navStore';
import { StaffUpload } from './StaffUpload';
import { StaffWalkIn } from './StaffWalkIn';
import { StaffProvider } from './StaffProvider';

export function StaffScreen() {
  const staffView = (useParams().view ?? 'upload') as StaffView;
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
