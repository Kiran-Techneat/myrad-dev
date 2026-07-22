import type {
  Center,
  ImagingRequest,
  Person,
  Provider,
  Share,
  Study,
} from '@/types';

/**
 * Seed data for the mock backend. In the original app this lived on the
 * component instance; here it seeds the mock API + localStorage store.
 */

export const seedPeople: Person[] = [
  { id: 1, name: 'John Doe', role: 'Myself', initials: 'JD', sex: 'Male', dob: '03/14/1974', isSelf: true, mobile: '(248) 555-0101' },
  { id: 2, name: 'Mary Doe', role: 'Spouse', initials: 'MD', sex: 'Female', dob: '07/22/1976', mobile: '(248) 555-0102' },
  { id: 3, name: 'Robert Doe', role: 'Father', initials: 'RD', sex: 'Male', dob: '11/02/1947', mobile: '(248) 737-6695' },
];

export const seedProviders: Provider[] = [
  { name: 'Dr. Emily Watson', spec: 'Neurology', init: 'EW', phone: '+1 (212) 555-0142', email: 'e.watson@neuroassoc.com', fax: '+1 (212) 555-0143' },
  { name: 'Dr. Michael Torres', spec: 'Orthopedics', init: 'MT', phone: '+1 (312) 555-0187', email: 'mtorres@ortho-partners.com', fax: '+1 (312) 555-0188' },
  { name: 'Dr. Kevin Park', spec: 'Cardiology', init: 'KP', phone: '+1 (617) 555-0198', email: 'kevin.park@heartcare.com', fax: '+1 (617) 555-0199' },
];

export const seedCenters: Center[] = [
  { id: 1, name: 'Metro Radiology', address: '123 Park Ave, New York, NY 10001', phone: '+1 (212) 555-0110', email: 'records@metrorad.com', fax: '+1 (212) 555-0111' },
  { id: 2, name: 'City Imaging Center', address: '456 Michigan Ave, Chicago, IL 60601', phone: '+1 (312) 555-0120', email: 'records@cityimaging.com', fax: '+1 (312) 555-0121' },
  { id: 3, name: 'HealthScan Labs', address: '789 Wacker Dr, Chicago, IL 60604', phone: '+1 (312) 555-0140', email: 'records@healthscanlabs.com', fax: '' },
  { id: 4, name: 'Heart Institute', address: '321 Beacon St, Boston, MA 02101', phone: '+1 (617) 555-0160', email: 'records@heartinstitute.org', fax: '' },
];

/** Baseline studies (always present, not persisted). */
export const seedStudies: Study[] = [
  { id: 1, tag: 'MRI', name: 'MRI · Brain', place: 'Metro Radiology', date: 'May 28, 2026', status: 'ready', reportStatus: 'ready', patient: 'John Doe' },
  { id: 2, tag: 'MRI', name: 'MRI · Spine — Cervical', place: 'Metro Radiology', date: 'June 3, 2026', status: 'ready', reportStatus: 'ready', patient: 'John Doe' },
  { id: 3, tag: 'CT', name: 'CT · Chest', place: 'City Imaging Center', date: 'June 14, 2026', status: 'ready', reportStatus: 'pending', patient: 'Mary Doe' },
  { id: 4, tag: 'XR', name: 'X-Ray · Hip (Left)', place: 'HealthScan Labs', date: 'June 18, 2026', status: 'ready', reportStatus: 'ready', patient: 'John Doe' },
  { id: 5, tag: 'US', name: 'Ultrasound · Abdomen', place: 'Metro Radiology', date: 'March 12, 2026', status: 'ready', reportStatus: 'ready', patient: 'Robert Doe' },
  { id: 6, tag: 'CT', name: 'CT · Abdomen', place: 'HealthScan Labs', date: 'January 7, 2026', status: 'pending', reportStatus: 'pending', patient: 'John Doe' },
];

export const seedRequests: ImagingRequest[] = [
  { id: 'REQ-1042', center: 'Metro Radiology', date: 'June 20, 2026', status: 'ready', delivery: 'Email + Fax', patient: 'John Doe', items: [{ tag: 'MRI', label: 'MRI · Brain', status: 'ready' }] },
  { id: 'REQ-1039', center: 'City Imaging Center', date: 'June 12, 2026', status: 'partial', delivery: 'Email', patient: 'Mary Doe', items: [{ tag: 'CT', label: 'CT · Chest', status: 'ready' }, { tag: 'CT', label: 'CT · Abdomen', status: 'pending' }] },
  { id: 'REQ-1036', center: 'HealthScan Labs', date: 'June 8, 2026', status: 'pending', delivery: 'Fax', patient: 'Robert Doe', items: [{ tag: 'XR', label: 'X-Ray · Hip (Left)', status: 'pending' }] },
  { id: 'REQ-1031', center: 'Heart Institute', date: 'May 30, 2026', status: 'cancelled', delivery: 'Email + Fax', patient: 'John Doe', items: [{ tag: 'ECHO', label: 'Echocardiography · Heart', status: 'cancelled' }] },
];

export const seedShares: Share[] = [
  { study: 'MRI · Brain', person: 'John Doe', provider: 'Dr. Emily Watson', spec: 'Neurology', init: 'EW', date: 'June 22, 2026', viewed: true, studies: [{ name: 'MRI · Brain', contents: 'Images & report' }] },
  { study: 'CT · Chest', person: 'Mary Doe', provider: 'Dr. Michael Torres', spec: 'Orthopedics', init: 'MT', date: 'June 19, 2026', viewed: false, studies: [{ name: 'CT · Chest', contents: 'Images & report' }] },
];
