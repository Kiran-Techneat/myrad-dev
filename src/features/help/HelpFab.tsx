import { Icon } from '@/components/common/Icon';
import { useDialogStore } from '@/store/dialogStore';
import { HelpHub } from './HelpHub';

export function HelpFab() {
  const toggleHelp = useDialogStore((s) => s.toggleHelp);
  return (
    <>
      <button className="help-fab" onClick={toggleHelp}>
        <Icon name="help" />
      </button>
      <HelpHub />
    </>
  );
}
