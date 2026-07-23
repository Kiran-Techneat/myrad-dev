import { useMemo } from 'react';
import {
  useCenters,
  usePeople,
  useProviders,
  useRequests,
  useSelfUploads,
  useShares,
  useStudies,
} from './queries';
import { seedCenters, seedPeople, seedProviders, seedRequests, seedShares, seedStudies } from '@/data/seed';
import { useNavStore } from '@/store/dashboard/navStore';
import type { Person, Study } from '@/types';

/**
 * Convenience selectors that fold TanStack Query results together with the
 * active-patient filter. Falls back to seed data while the first fetch is in
 * flight so the UI never flashes empty.
 */
export function useDomainData() {
  const people = usePeople().data ?? seedPeople;
  const providers = useProviders().data ?? seedProviders;
  const centers = useCenters().data ?? seedCenters;
  const studies = useStudies().data ?? seedStudies;
  const selfUploads = useSelfUploads().data ?? [];
  const requests = useRequests().data ?? seedRequests;
  const shares = useShares().data ?? seedShares;

  const activePatient = useNavStore((s) => s.activePatient);

  const activePatientObj: Person | null =
    activePatient !== 'all' ? people.find((p) => p.id === activePatient) ?? null : null;

  const showingAllPatients = activePatient === 'all';

  const patientMatches = useMemo(
    () => (name: string) => showingAllPatients || !activePatientObj || name === activePatientObj.name,
    [showingAllPatients, activePatientObj],
  );

  const allStudies: Study[] = useMemo(() => [...studies, ...selfUploads], [studies, selfUploads]);

  return {
    people,
    providers,
    centers,
    studies,
    selfUploads,
    allStudies,
    requests,
    shares,
    activePatient,
    activePatientObj,
    showingAllPatients,
    patientMatches,
  };
}
