import { useMemo } from 'react';
import { useNavStore } from '@/store/dashboard/navStore';
import { useAppSelector } from '@/store/hook';

interface SelectablePatient {
  id: string;
  name: string;
}

/**
 * Active-patient filter derived from the *real* logged-in profile (self + family),
 * matching how `PatientSelector` builds its list. Replaces the seed-backed patient
 * helpers from `useDomainData` on the Images/Requests list screens so those screens
 * never depend on mock data.
 */
export function usePatientFilter() {
  const userProfile = useAppSelector((s) => s.user.userProfile);
  const activePatient = useNavStore((s) => s.activePatient);

  // Self first, then family members — ids match those set by PatientSelector.
  const patients = useMemo<SelectablePatient[]>(() => {
    if (!userProfile) return [];
    const self: SelectablePatient = {
      id: userProfile.selfPatientId ?? 'self',
      name: `${userProfile.firstName ?? ''} ${userProfile.lastName ?? ''}`.trim(),
    };
    const family = (userProfile.familyMembers ?? []).map((m) => ({
      id: m.memberId,
      name: `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim(),
    }));
    return [self, ...family];
  }, [userProfile]);

  const showingAllPatients = activePatient === 'all';

  const activePatientObj = useMemo(
    () => (showingAllPatients ? null : patients.find((p) => String(p.id) === String(activePatient)) ?? null),
    [showingAllPatients, patients, activePatient],
  );

  // Study/request `patient` fields are full names (patientName / fullName).
  const patientMatches = useMemo(
    () => (name: string) => showingAllPatients || !activePatientObj || name === activePatientObj.name,
    [showingAllPatients, activePatientObj],
  );

  return { showingAllPatients, activePatientObj, patientMatches };
}
