import { Icon } from '@/components/common/Icon';
import { useNavStore } from '@/store/navStore';
import { useDomainData } from '@/hooks/useDomainData';

interface Props {
  variant: 'sidebar' | 'topnav';
}

/** Patient / "Everyone" scope switcher used in both the sidebar and top nav. */
export function PatientSelector({ variant }: Props) {
  const { people, activePatientObj } = useDomainData();
  const open = useNavStore((s) => s.patientMenuOpen);
  const toggle = useNavStore((s) => s.togglePatientMenu);
  const setActivePatient = useNavStore((s) => s.setActivePatient);

  const curLabel = activePatientObj ? activePatientObj.name.split(' ')[0] : 'Everyone';
  const curInit = activePatientObj ? activePatientObj.initials : 'E';

  const menuClass =
    variant === 'sidebar' ? 'tn-menu sb-menu-pop' : 'tn-menu';
  const menuStyle = variant === 'topnav' ? { left: 'auto', right: 0, width: 230 } : undefined;

  const Button =
    variant === 'sidebar' ? (
      <button className="sb-patbtn" onClick={toggle}>
        <div className="p-av" style={{ width: 26, height: 26, fontSize: 11 }}>
          {curInit}
        </div>
        <span>{curLabel}</span>
        <Icon name="chevronDown" sw={2.4} style={{ width: 14, height: 14 }} />
      </button>
    ) : (
      <button className="tn-patbtn" onClick={toggle}>
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
            {people.map((p) => (
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
