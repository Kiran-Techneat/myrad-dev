import { Icon } from '@/components/common/Icon';
import { useNavStore } from '@/store/dashboard/navStore';
import { useAppSelector } from '@/store/hook';

interface Props {
  variant: 'sidebar' | 'topnav';
}

interface SelectablePatient {
  id: string;
  name: string;
  initials: string;
}

const initialsOf = (first?: string, last?: string) =>
  `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || 'U';

/** Patient / "Everyone" scope switcher used in both the sidebar and top nav. */
export function PatientSelector({ variant }: Props) {
  const userProfile = useAppSelector((s) => s.user.userProfile);
  const open = useNavStore((s) => s.patientMenuOpen);
  const toggle = useNavStore((s) => s.togglePatientMenu);
  const setActivePatient = useNavStore((s) => s.setActivePatient);
  const activePatient = useNavStore((s) => s.activePatient);

  // Self first, then family members — all derived from the logged-in user's profile.
  const patients: SelectablePatient[] = userProfile
    ? [
        {
          id: userProfile.selfPatientId ?? 'self',
          name: `${userProfile.firstName ?? ''} ${userProfile.lastName ?? ''}`.trim(),
          initials: initialsOf(userProfile.firstName, userProfile.lastName),
        },
        ...(userProfile.familyMembers ?? []).map((m) => ({
          id: m.memberId,
          name: `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim(),
          initials: initialsOf(m.firstName, m.lastName),
        })),
      ]
    : [];

  const active = patients.find((p) => p.id === activePatient) ?? null;
  const curLabel = active ? active.name.split(' ')[0] : 'Everyone';
  const curInit = active ? active.initials : 'E';

  const menuClass = variant === 'sidebar' ? 'tn-menu sb-menu-pop' : 'tn-menu';
  const menuStyle = variant === 'topnav' ? { left: 'auto', right: 0, width: 230 } : undefined;

  const Button = (
    <button className={variant === 'sidebar' ? 'sb-patbtn' : 'tn-patbtn'} onClick={toggle}>
      <div className="p-av" style={{ width: 26, height: 26, fontSize: 11 }}>
        {curInit}
      </div>
      <span>{curLabel}</span>
      <Icon name="chevronDown" sw={2.4} style={{ width: 14, height: 14 }} />
    </button>
  );

  return (
    <div className={variant === 'sidebar' ? 'sb-patwrap' : 'tn-patwrap'}>
      {Button}
      {open && (
        <>
          <div className="dropdown-scrim" onClick={toggle} />
          <div className={menuClass} style={menuStyle}>
            <button className="tn-menu-item" onClick={() => setActivePatient('all')}>
              <div className="p-av" style={{ width: 26, height: 26, fontSize: 11 }}>
                E
              </div>
              Everyone
            </button>
            {patients.map((p) => (
              <button key={p.id} className="tn-menu-item" onClick={() => setActivePatient(p.id)}>
                <div className="p-av" style={{ width: 26, height: 26, fontSize: 11 }}>
                  {p.initials}
                </div>
                {p.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
