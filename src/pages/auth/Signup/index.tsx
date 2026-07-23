import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common/Icon';
import { useAuthStore } from '@/store/auth/authStore';
import { SignupForm } from '@/components/auth/SignupForm';
import styles from '../auth.module.scss';

/** `/signup` — the signup form (multi-step internally) plus the post-signup success panel. */
export function SignupRoute() {
    const auth = useAuthStore();
    const navigate = useNavigate();

    if (auth.signupDone) {
        return (
            <>
                <div className={styles.lbrand} style={{ textAlign: 'center', alignItems: 'center' }}>
                    <div className="su-done-ic" style={{ margin: '0 auto 8px' }}>
                        <Icon name="check" sw={2.2} />
                    </div>
                    <h1 className="serif">Account created</h1>
                    <p>
                        Your account is ready. Sign in with the email and password you just created to
                        get started.
                    </p>
                </div>
                <button
                    className="btn btn-primary btn-block btn-lg"
                    onClick={() => {
                        auth.goToSignIn();
                        navigate('/login');
                    }}
                >
                    Go to sign in
                </button>
            </>
        );
    }
    return <SignupForm />;
}
