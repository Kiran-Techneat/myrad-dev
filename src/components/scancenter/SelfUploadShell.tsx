import { Outlet } from 'react-router-dom';
import styles from './SelfUploadShell.module.scss';

/**
 * Sidebar-less, center-aligned layout for the public scan-center upload routes
 * (`/u/:id`, `/selfupload/:id`, and their code-entry variants). No app chrome —
 * imaging-center staff reach these via a tokenized link without signing in.
 */
export function SelfUploadShell() {
  return (
    <div className={styles.shell}>
      <Outlet />
    </div>
  );
}
