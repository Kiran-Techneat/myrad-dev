import { Outlet, useLocation } from 'react-router-dom';
import { Icon } from '@/components/common/Icon';
import { cx } from '@/utils/cx';
import styles from './auth.module.scss';

/** Shared marketing frame + card wrapper for every auth route (`/login`, `/signup`, `/verify-otp`). */
export function AuthLayout() {
    const isSignup = useLocation().pathname.startsWith('/signup');
    return (
        <div className="app">
            <div className={styles.loginwrap}>
                <div className={styles.loginside}>
                    <div className={styles['loginside-lockup']}>
                        <div className={styles['loginside-ic']}>
                            <Icon name="grid" />
                        </div>
                        <span className={cx(styles['loginside-wordmark'], 'serif')}>MyRad Images</span>
                    </div>
                    <h1 className="serif">Your medical images, all in one place.</h1>
                    <div className={styles['loginside-feats']}>
                        <div className={styles['loginside-feat']}>
                            <Icon name="clipboard" />
                            Request studies or images from any imaging center
                        </div>
                        <div className={styles['loginside-feat']}>
                            <Icon name="clipboard" />
                            See your reports as soon as they&apos;re ready
                        </div>
                        <div className={styles['loginside-feat']}>
                            <Icon name="share" />
                            Share securely with family, friends, or healthcare provider
                        </div>
                    </div>
                    <div className={styles['loginside-bg']}>
                        <Icon name="grid" />
                    </div>
                </div>

                <div className={styles['loginform-wrap']}>
                    <div className={cx(styles.logincard, isSignup && styles.wide)}>
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}
