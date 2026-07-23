import { Icon } from './Icon';
import { useDialogStore } from '@/store/dashboard/dialogStore';

export interface DropdownOption {
  value: string;
  label: string;
}

interface Props {
  ddKey: string;
  value: string;
  placeholder: string;
  options: DropdownOption[];
  onPick: (value: string) => void;
  size?: 'h58' | 'h52' | '';
  /** Render a full-screen scrim so an outside click closes the menu. */
  scrim?: boolean;
}

/** The ".ddrop" custom select used throughout the app (only one open at a time). */
export function Dropdown({ ddKey, value, placeholder, options, onPick, size = '', scrim = true }: Props) {
  const openDropdown = useDialogStore((s) => s.openDropdown);
  const toggle = useDialogStore((s) => s.toggleDropdown);
  const close = useDialogStore((s) => s.closeDropdown);
  const open = openDropdown === ddKey;

  const selected = options.find((o) => o.value === value);

  return (
    <div className="ddrop">
      <button
        type="button"
        className={`ddrop-btn ${size} ${value ? '' : 'empty'} ${open ? 'open' : ''}`}
        onClick={() => toggle(ddKey)}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <Icon name="chevronDown" className="ddrop-chev" />
      </button>
      {open && (
        <>
          {scrim && <div className="dropdown-scrim" onClick={close} />}
          <div className="ddrop-list">
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                className={`ddrop-opt ${value === o.value ? 'sel' : ''}`}
                onClick={() => {
                  onPick(o.value);
                  close();
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
