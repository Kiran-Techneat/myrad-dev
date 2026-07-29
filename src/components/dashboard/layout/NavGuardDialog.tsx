import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useNavGuardStore } from '@/store/dashboard/navGuardStore';

/**
 * Confirmation shown when the user tries to navigate away from a screen with
 * unsaved work (currently the create-request Wizard). Driven by `navGuardStore`:
 * a deferred navigation waits in `pendingNav`; Confirm runs it, Cancel drops it.
 * Rendered once at the AppShell level.
 */
export function NavGuardDialog() {
  const pendingNav = useNavGuardStore((s) => s.pendingNav);
  const confirmPending = useNavGuardStore((s) => s.confirmPending);
  const cancelPending = useNavGuardStore((s) => s.cancelPending);

  return (
    <Dialog open={pendingNav != null} onClose={cancelPending} maxWidth="xs" fullWidth>
      <DialogTitle>Discard this request?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Leaving now will reset this request and the studies you&apos;ve added will be lost.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={cancelPending}>Cancel</Button>
        <Button onClick={confirmPending} color="error" variant="contained" autoFocus>
          Discard &amp; leave
        </Button>
      </DialogActions>
    </Dialog>
  );
}
